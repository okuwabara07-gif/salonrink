'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * /dashboard/reviews — 口コミ承認管理
 * 投稿された口コミ(pending)を承認(approved)/非表示(hidden)にする。RLSで自店分のみ。
 */

type Review = {
  id: string;
  product_id: string;
  rating: number;
  body: string | null;
  status: string;
  created_at: string;
  product_name?: string;
};
type Filter = 'pending' | 'approved' | 'hidden';

export default function ReviewsPage() {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
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
      const { data } = await supabase
        .from('product_reviews')
        .select('id, product_id, rating, body, status, created_at, products(name)')
        .eq('salon_id', salon.id)
        .eq('status', filter)
        .order('created_at', { ascending: false });
      const mapped = (data || []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        product_id: r.product_id as string,
        rating: r.rating as number,
        body: r.body as string | null,
        status: r.status as string,
        created_at: r.created_at as string,
        product_name: (r.products as { name?: string } | null)?.name,
      }));
      setReviews(mapped);
    } catch (e) {
      console.error('[reviews] load:', e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: 'approved' | 'hidden') {
    if (!salonId) return;
    setBusy(id);
    try {
      const supabase = createClient();
      const patch: Record<string, unknown> = { status };
      if (status === 'approved') patch.approved_at = new Date().toISOString();
      await supabase.from('product_reviews').update(patch).eq('id', id);
      await load();
    } catch (e) {
      console.error('[reviews] update:', e);
      alert('更新に失敗しました');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ padding: '8px 36px 28px' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 500, color: 'var(--ink)' }}>口コミ承認</h1>
        <button onClick={load} style={btnGhost}>更新</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {([['pending', '承認待ち'], ['approved', '公開中'], ['hidden', '非表示']] as [Filter, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ ...tab, ...(filter === k ? tabActive : {}) }}>{label}</button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--muted)', fontSize: 13 }}>読み込み中...</p>}
      {!loading && reviews.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>該当する口コミはありません。</p>}

      {!loading && reviews.map((r) => (
        <div key={r.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.product_name || '(製品)'}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(r.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
          <div style={{ color: '#B8966A', fontSize: 15, marginBottom: 6 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
          {r.body && <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7, margin: '0 0 12px' }}>{r.body}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            {r.status !== 'approved' && (
              <button onClick={() => updateStatus(r.id, 'approved')} disabled={busy === r.id} style={btnPrimary}>承認して公開</button>
            )}
            {r.status !== 'hidden' && (
              <button onClick={() => updateStatus(r.id, 'hidden')} disabled={busy === r.id} style={btnGhost}>非表示にする</button>
            )}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 18, lineHeight: 1.7 }}>
        ※薬機法に配慮し、効果を断定する表現や不適切な内容は非表示にしてください。
      </p>
    </div>
  );
}

const btnGhost: React.CSSProperties = { border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--ink)', borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer' };
const btnPrimary: React.CSSProperties = { border: 'none', background: 'var(--ink)', color: '#f0e6d2', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const tab: React.CSSProperties = { border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--muted)', borderRadius: 999, padding: '6px 16px', fontSize: 13, cursor: 'pointer' };
const tabActive: React.CSSProperties = { background: 'var(--ink)', color: '#f0e6d2', borderColor: 'var(--ink)' };
const card: React.CSSProperties = { background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 14, padding: 18, marginBottom: 14 };
