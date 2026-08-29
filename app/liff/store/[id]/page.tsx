'use client';
// B-2 画面17「商品詳細」
// liff-store v2 action=product → 商品＋承認済み口コミ(最大20件)。
// 購入は外部EC（inhouse=BASE / affiliate=楽天・Yahoo）。Stripe直販SKUはサーバー未実装のため作らない（方針C: Stripe保全）。
// ec_url が無い商品は購入ボタン自体を出さない（死にボタン禁止）。

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const FN_STORE = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/liff-store';

type Item = { id: string; name: string; price: number; image_url: string | null; ec_url: string | null; source: string | null; fulfillment_type: string; brand: string | null; category: string | null; is_active: boolean };
type Review = { rating: number; body: string; created_at: string };

const card: CSSProperties = { background: '#fff', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 11, boxShadow: '0 1px 0 #E5DDCF' };
const h: CSSProperties = { fontFamily: "'Shippori Mincho',serif", fontSize: 14, fontWeight: 500 };

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const pid = typeof params?.id === 'string' ? params.id : '';
  const [item, setItem] = useState<Item | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!pid) return;
    let alive = true;
    (async () => {
      try {
        const r = await fetch(FN_STORE, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'product', product_id: pid }) });
        const j = await r.json();
        if (!alive) return;
        if (j?.ok && j.item) { setItem(j.item as Item); setReviews(j.reviews ?? []); setCount(Number(j.review_count) || 0); }
        else setErr('商品が見つかりませんでした。');
      } catch { if (alive) setErr('商品の取得に失敗しました。'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [pid]);

  const yen = (n: number) => '¥' + Number(n ?? 0).toLocaleString('ja-JP');
  const isAff = item?.fulfillment_type === 'affiliate';
  const buyLabel = isAff ? (item?.source === 'yahoo' ? 'Yahoo!で見る' : '楽天で見る') : 'サロンECで購入';
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : 0;
  const dt = (s: string) => { const d = new Date(s); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`; };

  return (
    <div style={{ minHeight: '100dvh', background: '#F3EEE5', color: '#2E2A24' }}>
      <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid #E5DDCF', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/liff/store" style={{ fontSize: 15, color: '#8A7A5F', textDecoration: 'none' }}>‹</Link>
        <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 17, fontWeight: 500 }}>商品詳細</span>
      </div>

      <div style={{ padding: '16px 18px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading && <span style={{ fontSize: 11, color: '#A2988A', textAlign: 'center', padding: '24px 0' }}>読み込み中…</span>}
        {!loading && err && <span style={{ fontSize: 11.5, color: '#A8705C', textAlign: 'center', padding: '24px 0' }}>{err}</span>}

        {item && (
          <>
            <div style={{ ...card, padding: 0, overflow: 'hidden', gap: 0 }}>
              <div style={{ aspectRatio: '1.15', background: '#fff', position: 'relative' }}>
                {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                {isAff && <span style={{ position: 'absolute', left: 10, top: 10, fontSize: 9, background: 'rgba(27,24,21,.72)', color: '#fff', borderRadius: 99, padding: '3px 9px', fontWeight: 700 }}>PR</span>}
              </div>
              <div style={{ padding: 17, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {item.brand && <span style={{ fontSize: 10.5, color: '#A2988A' }}>{item.brand}</span>}
                <b style={{ fontSize: 14, lineHeight: 1.6 }}>{item.name}</b>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#8A7A5F' }}>{yen(item.price)}<span style={{ fontWeight: 400, fontSize: 10, color: '#A2988A' }}>（税込）</span></span>
                {count > 0 && <span style={{ fontSize: 11, color: '#A98D4B' }}>{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))} <span style={{ color: '#A2988A' }}>（{count}件の口コミ）</span></span>}
                {item.ec_url ? (
                  <a href={item.ec_url} target="_blank" rel={isAff ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
                    style={{ display: 'block', textAlign: 'center', background: '#1B1815', color: '#fff', borderRadius: 99, padding: 14, fontSize: 13, fontWeight: 700, textDecoration: 'none', marginTop: 4 }}>{buyLabel}</a>
                ) : (
                  <span style={{ fontSize: 11, color: '#A2988A', textAlign: 'center', padding: '10px 0' }}>現在お取り扱いの準備中です。来店時にスタッフへお声がけください。</span>
                )}
                {!isAff && item.ec_url && <span style={{ fontSize: 9.5, color: '#A2988A', textAlign: 'center' }}>来店時にも購入できます</span>}
                {isAff && <span style={{ fontSize: 9, color: '#A2988A', lineHeight: 1.7 }}>[PR] 価格・在庫はリンク先の情報が最新です。</span>}
              </div>
            </div>

            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={h}>口コミ</span>
                <span style={{ fontSize: 10, color: '#A2988A' }}>ご購入者のみ投稿・確認後に掲載</span>
              </div>
              {reviews.length === 0 && <span style={{ fontSize: 11, color: '#A2988A' }}>まだ口コミはありません</span>}
              {reviews.map((r, i) => (
                <div key={i} style={{ background: '#F7F3EA', borderRadius: 12, padding: '11px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}>
                    <span style={{ color: '#A98D4B' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span style={{ color: '#A2988A' }}>{dt(r.created_at)}</span>
                  </div>
                  <span style={{ fontSize: 11.5, lineHeight: 1.75, color: '#5F584E' }}>{r.body}</span>
                </div>
              ))}
              <span style={{ fontSize: 9.5, color: '#A2988A' }}>口コミの投稿は<Link href="/liff/orders" style={{ color: '#8A7A5F', fontWeight: 700 }}>注文履歴</Link>から</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
