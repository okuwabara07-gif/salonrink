'use client';
// B-2 画面20「ビューティー占い」
// fortune-gate v2: 方針C=占い単体課金なし。free=1日1テーマ(23:59 JSTまで変更不可) / premium=全テーマ。
// テーマキーはサーバー正: love|social|work|beauty（miniappの'people'はサーバー不一致の既知バグ。ここでは social を使う）。
// 命式: miniapp computeMeishiki / computeZodiac を忠実移植。誕生日は get-mycarte profile.birth、未登録なら入力→upsert-profile {birth} 保存。
// 鑑定文: 五行×テーマ×日付(JST)の決定論生成（同日同人は同結果）。エンタメ表記あり。

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { bootLiff } from '../_lib/liffLite';

const FN_GATE = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/fortune-gate';
const FN_MYCARTE = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/get-mycarte';
const FN_UPSERT = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/upsert-profile';

type Meishiki = { pillar: string; element: string; type: string; hint: string; color: string };

function computeMeishiki(birth: string | null | undefined): Meishiki | null {
  const m = (birth || '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) return null;
  const y = +m[1], mo = +m[2], da = +m[3];
  if (mo < 1 || mo > 12 || da < 1 || da > 31) return null;
  const a = Math.floor((14 - mo) / 12), yy = y + 4800 - a, mm = mo + 12 * a - 3;
  const jdn = da + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const idx = ((jdn + 49) % 60 + 60) % 60;
  const elements = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  const types: Record<string, { type: string; hint: string; color: string }> = {
    '木': { type: 'しなやかな木タイプ', hint: '伸びやかさが魅力。ナチュラルな抜け感のあるスタイルが運気を伸ばします。', color: 'オリーブグリーン' },
    '火': { type: '情熱の火タイプ', hint: '華やかさが武器。ツヤ感を高めるケアで、持ち前の輝きがさらに際立ちます。', color: 'テラコッタ' },
    '土': { type: 'おだやかな土タイプ', hint: '安定感と包容力。ベージュ系カラーと、じっくり育てる保湿ケアが吉。', color: 'サンドベージュ' },
    '金': { type: '凛とした金タイプ', hint: '洗練された美意識の持ち主。輪郭の際立つスタイルと艶ケアが好相性。', color: 'シャンパンゴールド' },
    '水': { type: '流れる水タイプ', hint: '柔軟さと透明感が魅力。うるおい重視のケアで運気の流れが良くなります。', color: 'グレージュ' },
  };
  const el = elements[idx % 10];
  const t = types[el];
  return { pillar: stems[idx % 10] + branches[idx % 12], element: el, type: t.type, hint: t.hint, color: t.color };
}

function computeZodiac(birth: string | null | undefined): string | null {
  const m = (birth || '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) return null;
  const md = +m[2] * 100 + +m[3];
  const signs: [number, string][] = [[120, 'やぎ座'], [219, 'みずがめ座'], [321, 'うお座'], [420, 'おひつじ座'], [521, 'おうし座'], [622, 'ふたご座'], [723, 'かに座'], [823, 'しし座'], [923, 'おとめ座'], [1024, 'てんびん座'], [1123, 'さそり座'], [1222, 'いて座'], [1300, 'やぎ座']];
  for (const [lim, name] of signs) if (md < lim) return name;
  return 'やぎ座';
}

function todayJst(): { key: string; label: string } {
  const j = new Date(Date.now() + 9 * 3600 * 1000);
  const y = j.getUTCFullYear(), mo = j.getUTCMonth() + 1, d = j.getUTCDate();
  const w = ['日', '月', '火', '水', '木', '金', '土'][j.getUTCDay()];
  return { key: `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`, label: `${mo}月${d}日（${w}）` };
}
function hash(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

const TOPICS = [
  { key: 'love', label: '恋愛', desc: '出会い・相手の気持ち・進展のタイミング' },
  { key: 'social', label: '対人関係', desc: '職場・友人・距離感の取り方' },
  { key: 'work', label: '仕事', desc: '評価・決断・動くべき時間帯' },
  { key: 'beauty', label: '美容・イメチェン', desc: '似合う色・ケアと変身の日どり' },
] as const;

const EL_STYLE: Record<string, string> = { '木': 'ナチュラルな抜け感', '火': 'ツヤと血色感', '土': 'ベージュ系の落ち着き', '金': '輪郭の際立つ艶', '水': 'うるおいと透明感' };

function reading(topic: string, mk: Meishiki | null, userId: string, dateKey: string) {
  const el = mk?.element ?? '土';
  const h1 = hash(`${dateKey}|${userId}|${topic}`);
  const stars = 3 + (h1 % 3);
  const timeSlot = ['午前中', '昼過ぎ', '15時前後', '夕方以降', '21時以降'][h1 % 5];
  const color = mk?.color ?? 'ベージュ';
  const style = EL_STYLE[el];
  const pools: Record<string, { p1: string[]; p2: string[]; act: string[] }> = {
    love: {
      p1: [`あなたの魅力が外へ向かって開く日。気になる相手には、長文より短いひとことに運が乗ります。`, `相手のペースに合わせるほど流れが良くなる日。聞き役に回ると距離が縮まります。`, `第一印象が普段より強く残る日。${style}を意識した仕込みが効きます。`],
      p2: [`${el}のあなたは${timeSlot}に縁の気配。予定があるなら少し丁寧に支度を。`, `連絡のタイミングは${timeSlot}が吉。焦らず、明るい話題から。`, `新しい出会いより、いまある縁を温めるほうが実りやすい日です。`],
      act: [`リップかネイルに${color}を。連絡は${timeSlot}が吉。`, `香りとツヤ髪の仕込みを。会うなら${timeSlot}に。`],
    },
    social: {
      p1: [`言葉が強く出やすい日。正しさより伝え方が問われます。相手の話を最後まで聞くだけで評価が上がります。`, `頼まれごとが増える日。全部引き受けず、優先順位をひとつに絞ると流れが整います。`, `聞き役に徹すると信頼が積み上がる日。相づちを丁寧に。`],
      p2: [`誘いを断る罪悪感は手放してOK。自分のリズムを守るほうが関係は長持ちします。`, `大事な話は${timeSlot}に。感情的になりそうなら一晩置くのが吉。`, `久しぶりの人からの連絡に縁あり。短くても返事を。`],
      act: [`大事な話は${timeSlot}に。夜の約束は短めが運気キープのコツ。`, `返事は急がず、ひと呼吸おいてから。`],
    },
    work: {
      p1: [`直感が冴える日。保留にしていた判断は${timeSlot}に決めると納得の選択になります。`, `段取りが物を言う日。最初の1時間を計画に使うと後半が軽くなります。`, `細部より全体。完璧を目指すより、まず形にすることが評価につながります。`],
      p2: [`午後は細かいミスが出やすい時間帯。確認作業は早めに済ませ、夕方は明日の段取りに。`, `${el}のあなたは追い込みに強いタイプ。ただし今日は前倒しが吉。`, `相談ごとは${timeSlot}に切り出すと通りやすい日です。`],
      act: [`朝いちばんに最重要タスクを。${timeSlot}以降は判断より作業を。`, `机まわりをひとつ片づけてから始めると集中が続きます。`],
    },
    beauty: {
      p1: [`今日は「仕込み」に良い日。${style}を足すケアが第一印象の運を引き上げます。`, `イメチェンを考えているなら、今日は情報収集と予約が吉。実行は後日でOK。`, `髪のうるおいが運気の鍵。いつもより1分長いトリートメントを。`],
      p2: [`開運色は${color}。髪色に取り入れるなら、白髪ぼかしを兼ねたハイライトが命式と好相性。`, `${el}のあなたは${style}が似合う時期。小物からでも取り入れて。`, `新しいコスメより、いま持っているものを丁寧に使う日。`],
      act: [`${timeSlot}のヘアオイルケアを。サロン予約は今日のうちに。`, `鏡の前で3分、髪をとかす時間を。${color}の小物が吉。`],
    },
  };
  const p = pools[topic] ?? pools.beauty;
  const pick = (arr: string[], salt: number) => arr[(h1 + salt) % arr.length];
  return { stars: '★'.repeat(stars) + '☆'.repeat(5 - stars), p1: pick(p.p1, 1), p2: pick(p.p2, 2), action: pick(p.act, 3) };
}

const card: CSSProperties = { background: '#2B2724', borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 11, color: '#EDE6D9' };
const lightCard: CSSProperties = { background: 'rgba(255,255,255,.06)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 };
const h: CSSProperties = { fontFamily: "'Shippori Mincho',serif", fontSize: 14, fontWeight: 500, color: '#D8B476' };

export default function FortunePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [outside, setOutside] = useState(false);
  const [birth, setBirth] = useState('');
  const [birthInput, setBirthInput] = useState('');
  const [access, setAccess] = useState<'free' | 'day' | 'premium'>('free');
  const [lockedTopic, setLockedTopic] = useState<string | null>(null);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const today = todayJst();
  const mk = computeMeishiki(birth);
  const zodiac = computeZodiac(birth);

  useEffect(() => {
    let alive = true;
    (async () => {
      const b = await bootLiff();
      if (!alive) return;
      if (b.status !== 'ok' || !b.userId) { setOutside(true); setLoading(false); return; }
      setUserId(b.userId);
      try {
        const [g, mc] = await Promise.all([
          fetch(FN_GATE, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ line_user_id: b.userId, action: 'status' }) }).then((r) => r.json()),
          fetch(FN_MYCARTE, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ line_user_id: b.userId }) }).then((r) => r.json()).catch(() => null),
        ]);
        if (!alive) return;
        if (g?.ok) {
          setAccess(g.access === 'premium' ? 'premium' : g.access === 'day' ? 'day' : 'free');
          if (g.topic_locked && g.topic) { setLockedTopic(g.topic); setOpenTopic(g.topic); }
        }
        const bi = mc?.profile?.birth;
        if (typeof bi === 'string' && bi) setBirth(bi);
      } catch { /* 表示は続行 */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const saveBirth = async () => {
    if (!userId || !computeMeishiki(birthInput)) { setMsg('例：1994/05/12 の形式で入力してください'); return; }
    setMsg('');
    try {
      const r = await fetch(FN_UPSERT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ line_user_id: userId, birth: birthInput }) });
      const j = await r.json();
      if (!j?.ok) throw new Error('save');
      setBirth(birthInput);
    } catch { setMsg('保存に失敗しました。通信状況をご確認ください。'); }
  };

  const pickTopic = async (key: string) => {
    if (!userId) return;
    if (access === 'premium') { setOpenTopic(key); return; }
    if (lockedTopic) { setOpenTopic(lockedTopic); if (key !== lockedTopic) setMsg('本日のテーマは選択済みです（変更は明日から）'); return; }
    setMsg('');
    try {
      const r = await fetch(FN_GATE, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ line_user_id: userId, action: 'select_topic', topic: key }) });
      const j = await r.json();
      if (r.status === 409) { setLockedTopic(j?.topic ?? null); setOpenTopic(j?.topic ?? null); setMsg('本日のテーマは選択済みです（変更は明日から）'); return; }
      if (!j?.ok) { setMsg(String(j?.message ?? '選択に失敗しました。もう一度お試しください')); return; }
      setLockedTopic(key); setOpenTopic(key);
    } catch { setMsg('選択に失敗しました。通信状況をご確認ください。'); }
  };

  const shownTopics = access === 'premium' ? TOPICS.map((t) => t.key) : (openTopic ? [openTopic] : []);

  return (
    <div style={{ minHeight: '100dvh', background: '#221E19', color: '#EDE6D9' }}>
      <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/liff/home" style={{ fontSize: 15, color: '#D8B476', textDecoration: 'none' }}>‹</Link>
        <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 17, fontWeight: 500 }}>ビューティー占い</span>
      </div>

      <div style={{ padding: '16px 18px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={{ fontSize: 11, color: '#B08654', letterSpacing: '.2em' }}>{today.label}{birth ? ' ・ あなた専用' : ''}</span>

        {loading && <span style={{ fontSize: 11, color: '#8C857A', textAlign: 'center', padding: '20px 0' }}>読み込み中…</span>}

        {!loading && outside && (
          <div style={{ ...card, alignItems: 'center', textAlign: 'center', padding: '28px 18px' }}>
            <span style={h}>LINEから開いてください</span>
            <span style={{ fontSize: 11, color: '#B5AC9E', lineHeight: 1.8 }}>占いはLINEログイン後にご利用いただけます。</span>
          </div>
        )}

        {!loading && !outside && !birth && (
          <div style={card}>
            <span style={h}>生年月日を登録してください</span>
            <span style={{ fontSize: 11, color: '#B5AC9E', lineHeight: 1.8 }}>命式（五行）を算出して、あなた専用の鑑定にします。登録は1回だけです。</span>
            <input value={birthInput} onChange={(e) => setBirthInput(e.target.value)} placeholder="例：1994/05/12" inputMode="numeric"
              style={{ background: '#fff', border: 'none', borderRadius: 14, padding: '14px 16px', fontSize: 14, font: 'inherit', color: '#2B2724' }} />
            <button type="button" onClick={() => void saveBirth()}
              style={{ background: '#B08654', color: '#fff', border: 'none', borderRadius: 99, padding: 13, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', font: 'inherit' }}>この生年月日で占う</button>
          </div>
        )}

        {!loading && !outside && birth && mk && (
          <div style={card}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 24, fontWeight: 700, color: '#B08654' }}>{mk.pillar}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <b style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 15 }}>{mk.type}</b>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10 }}>
                  <span style={{ border: '1px solid rgba(176,134,84,.5)', color: '#B08654', borderRadius: 99, padding: '3px 10px' }}>五行：{mk.element}</span>
                  <span style={{ border: '1px solid rgba(255,255,255,.2)', color: '#B5AC9E', borderRadius: 99, padding: '3px 10px' }}>開運色：{mk.color}</span>
                  {zodiac && <span style={{ border: '1px solid rgba(255,255,255,.2)', color: '#B5AC9E', borderRadius: 99, padding: '3px 10px' }}>{zodiac}</span>}
                </div>
              </div>
            </div>
            <span style={{ fontSize: 12, color: '#D8CFC0', lineHeight: 1.8 }}>{mk.hint}</span>
            <span style={{ fontSize: 9.5, color: '#8C857A' }}>生年月日 {birth} から算出</span>
          </div>
        )}

        {!loading && !outside && birth && access !== 'premium' && !openTopic && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 11.5, color: '#B5AC9E' }}>今日の詳細鑑定 — テーマをひとつ選べます（本日23:59まで・変更不可）</span>
            {TOPICS.map((t) => (
              <button key={t.key} type="button" onClick={() => void pickTopic(t.key)}
                style={{ ...card, cursor: 'pointer', border: 'none', textAlign: 'left', font: 'inherit', width: '100%', gap: 4 }}>
                <b style={{ fontSize: 13, color: '#EDE6D9' }}>{t.label}</b>
                <span style={{ fontSize: 10.5, color: '#8C857A' }}>{t.desc}</span>
              </button>
            ))}
            <span style={{ fontSize: 10, color: '#8C857A', textAlign: 'center' }}>プレミアム会員は毎日すべてのテーマをご覧いただけます</span>
          </div>
        )}

        {!loading && !outside && birth && shownTopics.map((key) => {
          const t = TOPICS.find((x) => x.key === key);
          if (!t || !userId) return null;
          const r = reading(key, mk, userId, today.key);
          return (
            <div key={key} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={h}>{t.label}の詳細鑑定</span>
                <span style={{ fontSize: 12, color: '#D8B476', letterSpacing: '.15em' }}>{r.stars}</span>
              </div>
              <span style={{ fontSize: 12, lineHeight: 1.95, color: '#D8CFC0' }}>{r.p1}</span>
              <span style={{ fontSize: 12, lineHeight: 1.95, color: '#D8CFC0' }}>{r.p2}</span>
              <div style={lightCard}>
                <span style={{ fontSize: 10, color: '#B08654', fontWeight: 700 }}>今日のアクション</span>
                <span style={{ fontSize: 11.5, lineHeight: 1.8, color: '#EDE6D9' }}>{r.action}</span>
              </div>
            </div>
          );
        })}

        {msg && <span style={{ fontSize: 11, color: '#D8B476', textAlign: 'center' }}>{msg}</span>}
        <span style={{ fontSize: 9.5, color: '#8C857A', textAlign: 'center', lineHeight: 1.7 }}>占いはエンターテインメントです。効果を保証するものではありません。</span>
      </div>
    </div>
  );
}
