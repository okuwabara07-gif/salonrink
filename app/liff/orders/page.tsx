'use client';
// B-2 画面18「注文履歴・口コミ」
// liff-store v1: action=orders → 注文＋自分の口コミ / action=save_review → pending保存（承認制・購入者のみ）
// 決済(画面17)は未接続のため、ここは閲覧＋口コミのみ。空状態はストアへの導線。

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { bootLiff } from '../_lib/liffLite';

const FN_STORE = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/liff-store';

type OrderItem = { product_id?: string; id?: string; name?: string; product_name?: string; qty?: number; quantity?: number; price?: number };
type Order = { id: string; items: OrderItem[] | null; total: number; payment_status: string; fulfillment_status: string | null; shipped_at: string | null; created_at: string };
type MyReview = { product_id: string; rating: number; status: string };

const card: CSSProperties = { background: '#fff', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 11, boxShadow: '0 1px 0 #E5DDCF' };
const h: CSSProperties = { fontFamily: "'Shippori Mincho',serif", fontSize: 14, fontWeight: 500 };
const cta2: CSSProperties = { border: '1px solid #E5DDCF', borderRadius: 99, padding: 11, textAlign: 'center', fontSize: 11.5, background: '#fff', cursor: 'pointer', font: 'inherit', color: '#2E2A24' };

const payLabel = (s: string) => s === 'paid' ? '支払い済み' : s === 'pending' ? '未決済' : s === 'refunded' ? '返金済み' : s;
const shipLabel = (o: Order) => o.shipped_at ? '発送済み' : (o.payment_status === 'paid' ? '発送準備中' : '—');
const dt = (s: string) => { const d = new Date(s); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`; };
const itemName = (it: OrderItem) => it.name ?? it.product_name ?? '商品';
const itemQty = (it: OrderItem) => Number(it.qty ?? it.quantity ?? 1);
const itemPid = (it: OrderItem) => it.product_id ?? it.id ?? '';

export default function OrdersPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [outside, setOutside] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState<{ pid: string; name: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const b = await bootLiff();
      if (!alive) return;
      if (b.status !== 'ok' || !b.userId) { setOutside(true); setLoading(false); return; }
      setUserId(b.userId);
      try {
        const r = await fetch(FN_STORE, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'orders', line_user_id: b.userId }) });
        const j = await r.json();
        if (alive && j?.ok) { setOrders(j.orders ?? []); setReviews(j.reviews ?? []); }
      } catch { if (alive) setMsg('注文の取得に失敗しました。'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const myReview = (pid: string) => reviews.find((r) => r.product_id === pid);

  const submit = async () => {
    if (!userId || !writing || rating < 1 || !text.trim()) return;
    setMsg('');
    try {
      const r = await fetch(FN_STORE, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'save_review', line_user_id: userId, product_id: writing.pid, rating, body: text.trim() }),
      });
      const j = await r.json();
      if (!j?.ok) { setMsg(String(j?.message ?? j?.error ?? '投稿に失敗しました')); return; }
      setReviews((rs) => [{ product_id: writing.pid, rating, status: 'pending' }, ...rs]);
      setWriting(null); setRating(0); setText('');
      setMsg('投稿ありがとうございます。確認後に掲載されます。');
    } catch { setMsg('投稿に失敗しました。通信状況をご確認ください。'); }
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#F3EEE5', color: '#2E2A24' }}>
      <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid #E5DDCF', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/liff/store" style={{ fontSize: 15, color: '#8A7A5F', textDecoration: 'none' }}>‹</Link>
        <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 17, fontWeight: 500 }}>注文履歴</span>
      </div>

      <div style={{ padding: '16px 18px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading && <span style={{ fontSize: 11, color: '#A2988A', textAlign: 'center', padding: '20px 0' }}>読み込み中…</span>}

        {!loading && outside && (
          <div style={{ ...card, alignItems: 'center', textAlign: 'center', gap: 10, padding: '28px 17px' }}>
            <span style={h}>LINEから開いてください</span>
            <span style={{ fontSize: 11, color: '#7A7266', lineHeight: 1.8 }}>注文履歴はLINEログイン後に表示できます。</span>
          </div>
        )}

        {!loading && !outside && orders.length === 0 && (
          <div style={{ ...card, alignItems: 'center', textAlign: 'center', gap: 12, padding: '30px 17px' }}>
            <span style={h}>まだ注文はありません</span>
            <span style={{ fontSize: 11, color: '#7A7266', lineHeight: 1.8 }}>サロンの取り扱い製品や、市販の白髪ケアを見てみませんか。</span>
            <Link href="/liff/store" style={{ background: '#1B1815', color: '#fff', borderRadius: 99, padding: '13px 26px', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>ストアを見る</Link>
          </div>
        )}

        {orders.map((o) => (
          <div key={o.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: '#A2988A' }}>{dt(o.created_at)} のご注文</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: o.payment_status === 'paid' ? '#8A7A5F' : '#A8705C' }}>{payLabel(o.payment_status)} ／ {shipLabel(o)}</span>
            </div>
            {(o.items ?? []).map((it, i) => {
              const pid = itemPid(it);
              const rv = pid ? myReview(pid) : undefined;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 7, background: '#F7F3EA', borderRadius: 12, padding: '11px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11.5 }}>
                    <b style={{ lineHeight: 1.5 }}>{itemName(it)}</b>
                    <span style={{ flex: 'none', color: '#7A7266' }}>×{itemQty(it)}</span>
                  </div>
                  {o.payment_status === 'paid' && pid && (
                    rv ? (
                      <span style={{ fontSize: 10, color: '#A2988A' }}>{'★'.repeat(rv.rating)} 口コミ{rv.status === 'approved' ? '掲載中' : '確認中'}</span>
                    ) : (
                      <button type="button" style={{ ...cta2, padding: 9, fontSize: 10.5 }} onClick={() => { setWriting({ pid, name: itemName(it) }); setRating(0); setText(''); setMsg(''); }}>口コミを書く</button>
                    )
                  )}
                </div>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
              <span style={{ color: '#7A7266' }}>合計</span><b>¥{Number(o.total ?? 0).toLocaleString('ja-JP')}</b>
            </div>
          </div>
        ))}

        {writing && (
          <div style={card}>
            <span style={h}>「{writing.name}」の口コミ</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: n <= rating ? '#A98D4B' : '#DCCFBD', padding: 0 }}>★</button>
              ))}
            </div>
            <textarea value={text} maxLength={500} rows={4} placeholder="使ってみた感想（500字まで）"
              onChange={(e) => setText(e.target.value)}
              style={{ border: '1px solid #E5DDCF', borderRadius: 12, padding: 12, fontSize: 11.5, font: 'inherit', resize: 'vertical', background: '#fff', color: '#2E2A24' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" style={{ ...cta2, flex: 'none', width: 96 }} onClick={() => setWriting(null)}>やめる</button>
              <button type="button" disabled={rating < 1 || !text.trim()}
                style={{ flex: 1, background: rating < 1 || !text.trim() ? '#B8B0A2' : '#1B1815', color: '#fff', border: 'none', borderRadius: 99, padding: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', font: 'inherit' }}
                onClick={() => void submit()}>投稿する（確認後に掲載）</button>
            </div>
          </div>
        )}

        {msg && <span style={{ fontSize: 11, color: msg.includes('失敗') ? '#A8705C' : '#8A7A5F', textAlign: 'center' }}>{msg}</span>}
        <span style={{ fontSize: 9.5, lineHeight: 1.7, color: '#A2988A', textAlign: 'center' }}>口コミはご購入者のみ投稿できます。内容の確認後に掲載されます。</span>
      </div>
    </div>
  );
}
