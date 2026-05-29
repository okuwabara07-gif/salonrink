'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * /dashboard/ec — 店販EC 注文管理
 * 未発送注文の一覧・発送済み更新。RLS(owner_user_id=auth.uid())で自店分のみ。
 */

type OrderItem = { product_id: string; name: string; price: number; qty: number };
type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  payment_status: string;
  fulfillment_status: string;
  shipping_name: string | null;
  shipping_postal: string | null;
  shipping_address: string | null;
  shipping_phone: string | null;
  created_at: string;
};

type Filter = 'unshipped' | 'shipped' | 'all';

export default function EcPage() {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('unshipped');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: salon } = await supabase
        .from('salons').select('id').eq('owner_user_id', user.id).maybeSingle();
      if (!salon) { setLoading(false); return; }
      setSalonId(salon.id);
      let q = supabase
        .from('orders')
        .select('id, items, total, payment_status, fulfillment_status, shipping_name, shipping_postal, shipping_address, shipping_phone, created_at')
        .eq('salon_id', salon.id)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });
      if (filter !== 'all') q = q.eq('fulfillment_status', filter);
      const { data } = await q;
      setOrders((data as Order[]) || []);
    } catch (e) {
      console.error('[ec] load:', e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function markShipped(orderId: string) {
    if (!salonId) return;
    setBusy(orderId);
    try {
      const supabase = createClient();
      await supabase
        .from('orders')
        .update({ fulfillment_status: 'shipped', shipped_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', orderId);
      await load();
    } catch (e) {
      console.error('[ec] markShipped:', e);
      alert('更新に失敗しました');
    } finally {
      setBusy(null);
    }
  }

  const FULFILL: Record<string, { text: string; bg: string; color: string }> = {
    unshipped: { text: '発送待ち', bg: 'rgba(212,150,40,0.16)', color: '#a8701a' },
    shipped: { text: '発送済み', bg: 'rgba(90,140,90,0.16)', color: '#3c7d4e' },
    cancelled: { text: 'キャンセル', bg: 'rgba(120,120,120,0.16)', color: '#777' },
  };

  return (
    <div style={{ padding: '8px 36px 28px' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 500, color: 'var(--ink)' }}>店販EC 注文管理</h1>
        <button onClick={load} style={btnGhost}>更新</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {([['unshipped', '未発送'], ['shipped', '発送済み'], ['all', 'すべて']] as [Filter, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ ...tab, ...(filter === k ? tabActive : {}) }}>{label}</button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--muted)', fontSize: 13 }}>読み込み中...</p>}
      {!loading && orders.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>該当する注文はありません。</p>}

      {!loading && orders.map((o) => {
        const f = FULFILL[o.fulfillment_status] || FULFILL.unshipped;
        const date = new Date(o.created_at).toLocaleString('ja-JP');
        return (
          <div key={o.id} style={orderCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>#{o.id.slice(0, 8)} ・ {date}</span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: f.bg, color: f.color, fontWeight: 600 }}>{f.text}</span>
            </div>
            <div style={{ marginBottom: 10 }}>
              {o.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--ink)', padding: '2px 0' }}>
                  <span>{it.name} × {it.qty}</span><span>¥{(it.price * it.qty).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--line)' }}>
                <span>合計</span><span>¥{o.total.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.7, background: 'var(--paper)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
              <div>{o.shipping_name || '(宛名なし)'} 様 {o.shipping_phone || ''}</div>
              <div>〒{o.shipping_postal || '---'} {o.shipping_address || '(住所未取得)'}</div>
            </div>
            {o.fulfillment_status === 'unshipped' && (
              <button onClick={() => markShipped(o.id)} disabled={busy === o.id} style={{ ...btnPrimary, opacity: busy === o.id ? 0.6 : 1 }}>
                {busy === o.id ? '更新中...' : '発送済みにする'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const btnGhost: React.CSSProperties = { border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--ink)', borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer' };
const btnPrimary: React.CSSProperties = { border: 'none', background: 'var(--ink)', color: '#f0e6d2', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const tab: React.CSSProperties = { border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--muted)', borderRadius: 999, padding: '6px 16px', fontSize: 13, cursor: 'pointer' };
const tabActive: React.CSSProperties = { background: 'var(--ink)', color: '#f0e6d2', borderColor: 'var(--ink)' };
const orderCard: React.CSSProperties = { background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 14, padding: 18, marginBottom: 14 };
