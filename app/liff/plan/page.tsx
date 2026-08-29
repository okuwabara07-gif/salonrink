'use client';
// B-2 画面19「プラン」
// create-checkout v39 PLANS準拠: premium_month ¥480 / premium_year ¥3,980 / deep ¥110 / credit ¥500(5回) / photo_pack ¥110(写真+20枚)
// 決済後の戻り先はサーバー定義で /neo/mycarte.html（変更しない）。反映はstripe-webhook側 → 案内文で補足。
// 現在プランは get-mycarte plan（is_premium / diag_limit / photo_limit）。

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { bootLiff, liff } from '../_lib/liffLite';

const FN_CHECKOUT = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/create-checkout';
const FN_MYCARTE = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/get-mycarte';

const card: CSSProperties = { background: '#fff', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 0 #E5DDCF' };
const h: CSSProperties = { fontFamily: "'Shippori Mincho',serif", fontSize: 14, fontWeight: 500 };
const row: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11.5, background: '#F7F3EA', borderRadius: 11, padding: '10px 12px' };

const FEATURES: { label: string; free: string; premium: string }[] = [
  { label: 'AI診断', free: '月2回', premium: '月5回' },
  { label: 'カルテ写真の保存', free: '10枚・90日', premium: '50枚・無期限' },
  { label: 'ビューティー占い', free: '1日1テーマ', premium: '全テーマ毎日' },
  { label: 'AI深掘り相談', free: '初回無料→¥110/回', premium: '月5回まで無料' },
];

export default function PlanPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [outside, setOutside] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const b = await bootLiff();
      if (!alive) return;
      if (b.status !== 'ok' || !b.userId) { setOutside(true); return; }
      setUserId(b.userId);
      try {
        const r = await fetch(FN_MYCARTE, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ line_user_id: b.userId }) });
        const j = await r.json();
        if (alive && j?.ok) setIsPremium(!!j?.plan?.is_premium);
      } catch { /* 表示は続行 */ }
    })();
    return () => { alive = false; };
  }, []);

  const checkout = async (kind: string) => {
    if (!userId || busy) return;
    setBusy(kind); setMsg('');
    try {
      const r = await fetch(FN_CHECKOUT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ line_user_id: userId, kind }) });
      const j = await r.json();
      if (r.ok && j?.url) {
        try { liff.openWindow({ url: j.url, external: true }); } catch { window.location.href = j.url; }
        setMsg('お支払い画面を開きました。完了後はLINEに戻り、ミニアプリを開き直すと反映されます。');
      } else {
        setMsg(String(j?.message ?? 'ただいま手続きを開始できませんでした。時間をおいてお試しください。'));
      }
    } catch {
      setMsg('ただいま手続きを開始できませんでした。通信状況をご確認ください。');
    } finally { setBusy(''); }
  };

  const payBtn = (kind: string, label: string, sub: string, dark: boolean) => (
    <button type="button" disabled={!userId || !!busy} onClick={() => void checkout(kind)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: '100%', border: dark ? 'none' : '1px solid #E5DDCF', borderRadius: 16, padding: '13px 10px', background: dark ? '#1B1815' : '#fff', color: dark ? '#fff' : '#2E2A24', cursor: 'pointer', font: 'inherit', opacity: !userId || !!busy ? 0.6 : 1 }}>
      <b style={{ fontSize: 12.5 }}>{busy === kind ? '手続き中…' : label}</b>
      <span style={{ fontSize: 9.5, color: dark ? 'rgba(255,255,255,.7)' : '#A2988A' }}>{sub}</span>
    </button>
  );

  return (
    <div style={{ minHeight: '100dvh', background: '#F3EEE5', color: '#2E2A24' }}>
      <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid #E5DDCF', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/liff/home" style={{ fontSize: 15, color: '#8A7A5F', textDecoration: 'none' }}>‹</Link>
        <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 17, fontWeight: 500 }}>プラン</span>
      </div>

      <div style={{ padding: '16px 18px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {outside && (
          <div style={{ ...card, alignItems: 'center', textAlign: 'center', padding: '26px 17px' }}>
            <span style={h}>LINEから開いてください</span>
            <span style={{ fontSize: 11, color: '#7A7266', lineHeight: 1.8 }}>プランのお手続きはLINEログイン後にご利用いただけます。</span>
          </div>
        )}

        {!outside && (
          <>
            <div style={{ background: '#EDE5D6', borderRadius: 18, padding: '13px 17px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, color: '#5F584E' }}>現在のプラン</span>
              <b style={{ fontSize: 12.5, color: '#8A7A5F' }}>{isPremium == null ? '—' : isPremium ? 'プレミアム' : '無料プラン'}</b>
            </div>

            <div style={card}>
              <span style={h}>プレミアムでできること</span>
              {FEATURES.map((f) => (
                <div key={f.label} style={row}>
                  <span style={{ color: '#7A7266', flex: 'none' }}>{f.label}</span>
                  <span style={{ textAlign: 'right' }}><span style={{ color: '#A2988A' }}>{f.free}</span> → <b style={{ color: '#8A7A5F' }}>{f.premium}</b></span>
                </div>
              ))}
              {!isPremium && (
                <div style={{ display: 'flex', gap: 9 }}>
                  {payBtn('premium_month', '月額 ¥480', 'いつでも解約OK', true)}
                  {payBtn('premium_year', '年額 ¥3,980', '2か月分お得', false)}
                </div>
              )}
              {isPremium && <span style={{ fontSize: 11, color: '#8A7A5F', textAlign: 'center' }}>プレミアムをご利用中です。いつもありがとうございます。</span>}
              <span style={{ fontSize: 9.5, lineHeight: 1.7, color: '#A2988A' }}>お支払いはStripeの安全な決済画面で行われます。完了後はLINEに戻り、ミニアプリを開き直すと反映されます。</span>
            </div>

            <div style={card}>
              <span style={h}>単品で追加する</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {payBtn('deep', 'AI深掘り相談 ¥110', '診断結果へのパーソナル助言 1回分', false)}
                {payBtn('credit', 'AI相談クレジット5回 ¥500', '1回あたり¥100でお得', false)}
                {payBtn('photo_pack', 'カルテ写真 追加20枚 ¥110', '保存枠を20枚ぶん拡張', false)}
              </div>
            </div>
          </>
        )}

        {msg && <span style={{ fontSize: 11, color: '#8A7A5F', textAlign: 'center', lineHeight: 1.8 }}>{msg}</span>}
      </div>
    </div>
  );
}
