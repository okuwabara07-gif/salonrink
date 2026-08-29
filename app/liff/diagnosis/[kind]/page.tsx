'use client';
// B-2 画面12〜15: 診断イントロ → 問診(scalpのみ) → 撮影 → 解析中 → 結果 → 共有
// hair-diagnose v52 契約:
//   POST { image(dataURL可), kind, line_user_id?, session_id?, survey_answers?, consent_stats?, consent_photo? }
//   200 { ok, id, result:{scores(5軸), type, comment, care_tips[], kind}, share_code }
//   402 plan_limit { message, upgrade:{monthly:480, yearly:3980} } / 429 rate_limited { message }
// scalp の問診設問はサーバー側 SURVEY_QS と完全一致させること（v51）。
// TODO(次バッチ): AI深掘り相談(¥110)=deep-advice、おすすめ商品=list-products をここに接続。

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bootLiff, diagSessionId, liff } from '../../_lib/liffLite';

const FN_DIAG = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/hair-diagnose';

type Meta = { title: string; introTitle: string; introBody: string; tips: string[]; axes: Record<string, string> };
const META: Record<string, Meta> = {
  hair: { title: '髪質診断', introTitle: 'カメラで30秒。今の髪を見える化します',
    introBody: '髪全体が写るように撮影すると、ツヤ・まとまり・うるおいなどをスコア化します。',
    tips: ['自然光の下で、髪をおろした状態で', '髪全体が画面に入るように', '気になる箇所は寄りでもOK'],
    axes: { tsuya: 'ツヤ', matomari: 'まとまり', uruoi: 'うるおい', volume: 'ボリューム', hari_koshi: 'ハリ・コシ' } },
  gray: { title: '白髪診断', introTitle: 'カメラで30秒。今の白髪を見える化します',
    introBody: '頭頂部と分け目を撮影すると、白髪の見え方と分布の目安が届きます。',
    tips: ['自然光の下で、髪をおろした状態で', '頭頂部が画面の中央に入るように', '気になる箇所は2枚目で寄りの撮影を'],
    axes: { ratio: '全体の目立ちにくさ', hairline: '生え際', parting: '分け目', side: 'サイド', density: '毛の密度感' } },
  scalp: { title: '頭皮診断', introTitle: '問診＋写真で、頭皮の今を確認します',
    introBody: '回答と画像解析を組み合わせて、ケアの目安とカウンセリング内容を最適化します。',
    tips: ['分け目を開いて頭皮が見えるように', '明るい場所で、フラッシュは使わずに', '気になる箇所を中心に'],
    axes: { uruoi: 'うるおい感', hishi: '皮脂バランス', akami: '赤みの少なさ', keana: '毛穴の整い', fuke: 'フケ・乾燥の少なさ' } },
  nail: { title: '爪・ネイル診断', introTitle: '手もとを撮って、爪の状態を確認します',
    introBody: '爪の見た目からケアの目安をスコア化します。',
    tips: ['爪がはっきり写る距離で', '自然光の下で', 'ネイルオフの状態が正確です'],
    axes: { tsuya: 'ツヤ', atsumi: '厚み・強さ', tatesen: '縦線の少なさ', hakudaku: '濁りの少なさ', amakawa: '甘皮まわり' } },
  lash: { title: 'まつげ診断', introTitle: '目もとを撮って、まつげの状態を確認します',
    introBody: '長さ・密度・カールの見え方をスコア化します。',
    tips: ['目を開けた正面の写真で', '明るい場所で', 'マスカラなしが正確です'],
    axes: { nagasa: '長さの印象', mitsudo: '密度', curl: 'カールの持ち', hari: 'ハリ感', uruoi: '目元のうるおい' } },
  color: { title: 'カラー診断', introTitle: '顔まわりを撮って、似合う色の傾向を見ます',
    introBody: '肌の明るさ・血色感などから、似合う色の傾向の目安を出します。',
    tips: ['自然光の下で、正面から', 'メイクは薄めが正確です', '髪と肌が両方写るように'],
    axes: { meido: '肌の明るさ', kesshoku: '血色感', undertone: 'イエベ(0)〜ブルベ(100)', contrast: 'コントラスト', saido: '鮮やかな色との相性' } },
};

// サーバー v51 SURVEY_QS.scalp と完全一致（変更禁止）
const SCALP_SURVEY: { q: string; options: string[] }[] = [
  { q: 'カラー剤やパーマ剤でしみたりヒリヒリしたことは', options: ['よくある', 'たまにある', 'ほとんどない'] },
  { q: 'カラー・パーマ後にかぶれ・赤み・かゆみが出たことは', options: ['ある', '軽くあった', 'ない'] },
  { q: 'ふだんフケやかゆみは', options: ['毎日気になる', 'ときどき', 'ほとんどない'] },
  { q: '頭皮の状態', options: ['乾燥ぎみ', 'ベタつきぎみ', 'ふつう', 'よくわからない'] },
  { q: 'シャンプー回数', options: ['1日1回', '1日2回以上', '2日に1回以下'] },
];

const card: CSSProperties = { background: '#fff', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 0 #E5DDCF' };
const h: CSSProperties = { fontFamily: "'Shippori Mincho',serif", fontSize: 14, fontWeight: 500 };
const cta: CSSProperties = { background: '#1B1815', color: '#fff', textAlign: 'center', borderRadius: 99, padding: 15, fontSize: 13.5, fontWeight: 700, border: 'none', width: '100%', cursor: 'pointer', font: 'inherit' };
const cta2: CSSProperties = { border: '1px solid #E5DDCF', borderRadius: 99, padding: 12, textAlign: 'center', fontSize: 12, background: '#fff', width: '100%', cursor: 'pointer', font: 'inherit', color: '#2E2A24' };
const chipOff: CSSProperties = { border: '1px solid #E5DDCF', borderRadius: 99, padding: '8px 14px', fontSize: 11.5, cursor: 'pointer', background: 'none', font: 'inherit', color: '#2E2A24' };
const chipOn: CSSProperties = { ...chipOff, border: '1px solid #A98D4B', background: '#EFE8DA', color: '#8A7A5F', fontWeight: 500 };

async function fileToDataUrl(f: File): Promise<string> {
  try {
    const img = await createImageBitmap(f);
    const max = 1280;
    const sc = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.width * sc));
    c.height = Math.max(1, Math.round(img.height * sc));
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85);
  } catch {
    return await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = () => rej(new Error('read failed'));
      r.readAsDataURL(f);
    });
  }
}

type DiagResult = { scores: Record<string, number>; type?: string; comment?: string; care_tips?: string[]; kind?: string };

export default function DiagnosisFlowPage() {
  const params = useParams<{ kind: string }>();
  const router = useRouter();
  const kind = typeof params?.kind === 'string' ? params.kind : 'hair';
  const meta = META[kind];

  const [step, setStep] = useState<'intro' | 'survey' | 'analyzing' | 'result'>('intro');
  const [userId, setUserId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<DiagResult | null>(null);
  const [err, setErr] = useState('');
  const [limitMsg, setLimitMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { void bootLiff().then((b) => setUserId(b.userId)); }, []);
  useEffect(() => { if (!META[kind]) router.replace('/liff/diagnosis'); }, [kind, router]);
  if (!meta) return null;

  const isScalp = kind === 'scalp';

  const startCamera = () => fileRef.current?.click();

  const onFile = async (f: File | null) => {
    if (!f) return;
    setErr(''); setLimitMsg(''); setStep('analyzing');
    try {
      const dataUrl = await fileToDataUrl(f);
      const body: Record<string, unknown> = {
        image: dataUrl, kind,
        line_user_id: userId ?? undefined,
        session_id: diagSessionId(),
        consent_stats: false, consent_photo: false,
      };
      if (isScalp) body.survey_answers = answers;
      const r = await fetch(FN_DIAG, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (r.status === 402) { setLimitMsg(String(j?.message ?? '今月の診断回数の上限に達しました。')); setStep('intro'); return; }
      if (r.status === 429) { setErr(String(j?.message ?? '本日の診断枠が上限です。時間をおいてお試しください。')); setStep('intro'); return; }
      if (!j?.ok || !j?.result) throw new Error(String(j?.error ?? 'diagnose_failed'));
      setResult(j.result as DiagResult);
      setStep('result');
    } catch {
      setErr('解析に失敗しました。通信状況をご確認のうえ、もう一度お試しください。');
      setStep(isScalp ? 'survey' : 'intro');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const share = async () => {
    try {
      if (!result) return;
      const avg = overall(result);
      const text = `${meta.title}の結果を共有します\n整い度スコア ${avg ?? '--'}\n${result.type ?? ''}\n${result.comment ?? ''}\n#SalonRink`;
      if (liff.isApiAvailable('shareTargetPicker')) {
        await liff.shareTargetPicker([{ type: 'text', text }]);
      } else {
        await navigator.clipboard.writeText(text);
        setErr('共有テキストをコピーしました。LINEに貼り付けて送れます。');
      }
    } catch { /* ユーザーキャンセル等は無視 */ }
  };

  const overall = (res: DiagResult): number | null => {
    const v = Object.values(res.scores ?? {}).filter((x) => typeof x === 'number');
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#F3EEE5', color: '#2E2A24', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid #E5DDCF', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" onClick={() => (step === 'result' ? setStep('intro') : router.push('/liff/diagnosis'))} style={{ fontSize: 15, color: '#8A7A5F', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>‹</button>
        <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 17, fontWeight: 500 }}>
          {meta.title}{step === 'survey' ? ' ・ 問診' : step === 'result' ? 'の結果' : ''}
        </span>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={(e) => void onFile(e.target.files?.[0] ?? null)} />

      {step === 'intro' && (
        <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card}>
            <span style={h}>{meta.introTitle}</span>
            <span style={{ fontSize: 11.5, lineHeight: 1.8, color: '#7A7266' }}>{meta.introBody}</span>
          </div>
          <div style={card}>
            <span style={h}>撮影のコツ</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5, color: '#7A7266' }}>
              {meta.tips.map((t) => <span key={t}>◦ {t}</span>)}
            </div>
            <span style={{ fontSize: 10.5, lineHeight: 1.7, color: '#A2988A' }}>
              撮影した写真は診断のためだけに使用されます。ご自身で共有しない限り、他の人に見られることはありません。
            </span>
          </div>
          {limitMsg && (
            <div style={{ background: '#EDE5D6', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11.5, lineHeight: 1.8, color: '#5F584E' }}>{limitMsg}</span>
              <span style={{ fontSize: 10.5, color: '#A2988A' }}>プレミアム: 月¥480 ／ 年¥3,980（2か月分お得）・月5回まで</span>
            </div>
          )}
          {err && <span style={{ fontSize: 11, color: '#A8705C', textAlign: 'center' }}>{err}</span>}
          <button type="button" style={cta} onClick={() => (isScalp ? setStep('survey') : startCamera())}>
            {isScalp ? '問診に進む' : 'カメラで診断をはじめる'}
          </button>
          <button type="button" style={cta2} onClick={() => router.push('/liff/diagnosis')}>あとで</button>
        </div>
      )}

      {step === 'survey' && (
        <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 10.5, color: '#A2988A', lineHeight: 1.7 }}>
            回答と画像解析を組み合わせて、ケアの目安とカウンセリング内容を最適化します。
          </span>
          {SCALP_SURVEY.map((s, i) => (
            <div key={s.q} style={card}>
              <span style={{ fontSize: 11.5, fontWeight: 700 }}>{s.q}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {s.options.map((op, oi) => (
                  <button key={op} type="button" style={answers[String(i)] === oi ? chipOn : chipOff}
                    onClick={() => setAnswers((a) => ({ ...a, [String(i)]: oi }))}>{op}</button>
                ))}
              </div>
            </div>
          ))}
          {err && <span style={{ fontSize: 11, color: '#A8705C', textAlign: 'center' }}>{err}</span>}
          <button type="button" style={cta} onClick={startCamera}>回答してカメラ撮影へ</button>
        </div>
      )}

      {step === 'analyzing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '60px 30px' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#EFE8DA' }} />
          <span style={{ ...h, fontSize: 16 }}>AIが解析しています</span>
          <span style={{ fontSize: 10.5, color: '#A2988A', textAlign: 'center', lineHeight: 1.8 }}>
            写真を読み取っています。<br />そのままお待ちください。
          </span>
        </div>
      )}

      {step === 'result' && result && (
        <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...card, alignItems: 'center', textAlign: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 44, lineHeight: 1, color: '#8A7A5F' }}>{overall(result) ?? '--'}</span>
            <span style={{ fontSize: 11.5, color: '#7A7266' }}>整い度スコア</span>
            {result.type && <span style={{ fontSize: 12.5, fontWeight: 700, color: '#8A7A5F' }}>{result.type}</span>}
            {result.comment && <span style={{ fontSize: 11.5, lineHeight: 1.8, color: '#5F584E' }}>{result.comment}</span>}
            <span style={{ fontSize: 10, color: '#A2988A' }}>カルテに自動保存済み</span>
          </div>
          <div style={card}>
            <span style={h}>項目別スコア</span>
            {Object.entries(meta.axes).map(([key, label]) => {
              const v = Math.max(0, Math.min(100, Number(result.scores?.[key] ?? 0)));
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                    <span style={{ color: '#7A7266' }}>{label}</span><b>{v}</b>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: '#EFE8DA', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${v}%`, background: '#A98D4B', borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
          {Array.isArray(result.care_tips) && result.care_tips.length > 0 && (
            <div style={{ background: '#EDE5D6', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={h}>ケアの目安</span>
              {result.care_tips.map((t) => <span key={t} style={{ fontSize: 11.5, lineHeight: 1.8, color: '#5F584E' }}>◦ {t}</span>)}
            </div>
          )}
          {err && <span style={{ fontSize: 11, color: '#A8705C', textAlign: 'center' }}>{err}</span>}
          <button type="button" style={{ ...cta, background: '#06C755' }} onClick={() => void share()}>LINEで美容師に共有する</button>
          <button type="button" style={cta2} onClick={() => { setResult(null); setStep('intro'); }}>もう一度診断する</button>
          <span style={{ fontSize: 10, color: '#A2988A', textAlign: 'center', lineHeight: 1.7 }}>
            本診断は美容目的の見た目の目安であり、医療的な判断を行うものではありません
          </span>
        </div>
      )}
    </div>
  );
}
