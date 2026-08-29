'use client';
// B-2 画面16「ストア」
// ・サロンの取り扱い製品: liff-store(action=salon_products) → inhouse & is_active のみ。BASE等の ec_url へ外部リンク
// ・[PR] 市販の白髪ケア: list-products v17（アフィリエイト。楽天/Yahooへ外部リンク・PR表記・順位表記なし=景表法配慮）
// ・購入(Stripe/画面17)は決済バッチで接続。ここでは外部リンクのみ＝死にボタンなし
// TODO(決済バッチ): inhouse商品の create-checkout 接続、注文導線

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';

const FN_STORE = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/liff-store';
const FN_LIST = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/list-products';

type SalonItem = { id: string; name: string; price: number; image_url: string | null; ec_url: string | null };
type AffItem = {
  id: string; display_name: string; price: number; image_url: string | null; ec_url: string;
  brand_name: string; purpose: string; container: string; mall: string; mall_label: string;
};

const PURPOSES = ['すべて', '白髪染め', '白髪ぼかし', 'おしゃれ染め'];
const CONTAINERS = ['すべて', 'クリーム・チューブ', 'トリートメント', '泡タイプ', 'ポンプタイプ', 'スプレー・部分用'];

const card: CSSProperties = { background: '#fff', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 0 #E5DDCF' };
const h: CSSProperties = { fontFamily: "'Shippori Mincho',serif", fontSize: 14, fontWeight: 500 };
const chipOff: CSSProperties = { border: '1px solid #E5DDCF', borderRadius: 99, padding: '7px 12px', fontSize: 10.5, cursor: 'pointer', background: '#fff', font: 'inherit', color: '#2E2A24', flex: 'none' };
const chipOn: CSSProperties = { ...chipOff, border: '1px solid #A98D4B', background: '#EFE8DA', color: '#8A7A5F', fontWeight: 700 };
const extBtn: CSSProperties = { display: 'block', textAlign: 'center', border: '1px solid #1B1815', borderRadius: 99, padding: '9px 0', fontSize: 11, fontWeight: 700, color: '#1B1815', textDecoration: 'none' };

export default function StorePage() {
  const [salon, setSalon] = useState<SalonItem[]>([]);
  const [aff, setAff] = useState<AffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purpose, setPurpose] = useState('すべて');
  const [container, setContainer] = useState('すべて');
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [sr, ar] = await Promise.all([
          fetch(FN_STORE, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'salon_products' }) }).then((r) => r.json()),
          fetch(`${FN_LIST}?limit=120&order=balanced`).then((r) => r.json()),
        ]);
        if (!alive) return;
        if (sr?.ok) setSalon(sr.items ?? []);
        if (Array.isArray(ar?.items)) setAff(ar.items as AffItem[]);
      } catch {
        if (alive) setErr('商品の取得に失敗しました。通信状況をご確認ください。');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => aff.filter((p) =>
    (purpose === 'すべて' || p.purpose === purpose) &&
    (container === 'すべて' || p.container === container)
  ).slice(0, 60), [aff, purpose, container]);

  const yen = (n: number) => '¥' + Number(n ?? 0).toLocaleString('ja-JP');

  return (
    <div style={{ minHeight: '100dvh', background: '#F3EEE5', color: '#2E2A24' }}>
      <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid #E5DDCF', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/liff/home" style={{ fontSize: 15, color: '#8A7A5F', textDecoration: 'none' }}>‹</Link>
        <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 17, fontWeight: 500 }}>ストア</span>
        <Link href="/liff/orders" style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, color: '#8A7A5F', textDecoration: 'none' }}>注文履歴</Link>
      </div>

      <div style={{ padding: '16px 18px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {salon.length > 0 && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={h}>サロンの取り扱い製品</span>
              <span style={{ fontSize: 9.5, color: '#A2988A' }}>来店時にも購入できます</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {salon.map((p) => (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ aspectRatio: '1', borderRadius: 12, background: '#EFE8DA', overflow: 'hidden' }}>
                    {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <Link href={`/liff/store/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><b style={{ fontSize: 11, lineHeight: 1.5 }}>{p.name}</b></Link>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8A7A5F' }}>{yen(p.price)}<span style={{ fontWeight: 400, fontSize: 9, color: '#A2988A' }}>（税込）</span></span>
                  {p.ec_url && <a href={p.ec_url} target="_blank" rel="noopener noreferrer" style={extBtn}>サロンECで購入</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={h}>市販の白髪ケアを探す</span>
            <span style={{ fontSize: 9, color: '#A2988A' }}>[PR] 広告を含みます</span>
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {PURPOSES.map((p) => (
              <button key={p} type="button" style={purpose === p ? chipOn : chipOff} onClick={() => setPurpose(p)}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {CONTAINERS.map((c) => (
              <button key={c} type="button" style={container === c ? chipOn : chipOff} onClick={() => setContainer(c)}>{c}</button>
            ))}
          </div>

          {loading && <span style={{ fontSize: 11, color: '#A2988A', textAlign: 'center', padding: '18px 0' }}>読み込み中…</span>}
          {!loading && shown.length === 0 && <span style={{ fontSize: 11, color: '#A2988A', textAlign: 'center', padding: '18px 0' }}>条件に合う商品が見つかりませんでした</span>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {shown.map((p) => (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ aspectRatio: '1', borderRadius: 12, background: '#EFE8DA', overflow: 'hidden', position: 'relative' }}>
                  {p.image_url && <img src={p.image_url} alt={p.display_name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} />}
                  <span style={{ position: 'absolute', left: 6, top: 6, fontSize: 8, background: 'rgba(27,24,21,.72)', color: '#fff', borderRadius: 99, padding: '2px 7px', fontWeight: 700 }}>PR</span>
                </div>
                <span style={{ fontSize: 9.5, color: '#A2988A' }}>{p.brand_name}</span>
                <Link href={`/liff/store/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><b style={{ fontSize: 10.5, lineHeight: 1.5, minHeight: '2.9em' }}>{p.display_name}</b></Link>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8A7A5F' }}>{yen(p.price)}</span>
                <a href={p.ec_url} target="_blank" rel="noopener noreferrer sponsored" style={{ ...extBtn, borderColor: '#E5DDCF', color: '#7A7266', fontWeight: 500 }}>{p.mall_label}</a>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 9, lineHeight: 1.7, color: '#A2988A' }}>
            価格・在庫はリンク先の情報が最新です。表示順はおすすめ順であり、効果や品質の順位を示すものではありません。
          </span>
        </div>

        {err && <span style={{ fontSize: 11, color: '#A8705C', textAlign: 'center' }}>{err}</span>}
      </div>
    </div>
  );
}
