'use client';
// B-1 チェック版 19「予算の目安・滞在できる時間」— 画面06(Step3)「伝えておきたいこと」直前に挿入。
// 値は profiles.visit_budget / stay_limit（upsert-profile v9）に保存 = 次回以降のカルテに自動添付。
// 使い方:
//   <VisitBudgetPicker lineUserId={userId}
//     initialBudget={data?.profile?.visit_budget ?? null}
//     initialStayLimit={data?.profile?.stay_limit ?? null} />

import { useState, type CSSProperties } from 'react';

const FN_UPSERT = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/upsert-profile';

const BUDGETS = ['〜¥5,000', '〜¥10,000', '〜¥15,000', '¥15,000以上'];

const card: CSSProperties = { background: '#fff', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 0 #E5DDCF' };
const heading: CSSProperties = { fontFamily: "'Shippori Mincho',serif", fontSize: 14, fontWeight: 500, color: '#2E2A24' };
const chipOff: CSSProperties = { border: '1px solid #E5DDCF', borderRadius: 99, padding: '8px 14px', fontSize: 11.5, cursor: 'pointer', background: 'none', color: '#2E2A24', font: 'inherit' };
const chipOn: CSSProperties = { ...chipOff, border: '1px solid #A98D4B', background: '#EFE8DA', color: '#8A7A5F', fontWeight: 500 };

export default function VisitBudgetPicker({ lineUserId, initialBudget, initialStayLimit }: {
  lineUserId: string;
  initialBudget?: string | null;
  initialStayLimit?: string | null;
}) {
  const [budget, setBudget] = useState<string | null>(initialBudget ?? null);
  const initialIsTime = /^\d{1,2}:\d{2}まで$/.test(initialStayLimit ?? '');
  const [stayMode, setStayMode] = useState<'none' | 'time'>(initialIsTime ? 'time' : 'none');
  const [leaveAt, setLeaveAt] = useState(initialIsTime ? (initialStayLimit ?? '').replace('まで', '') : '');
  const [msg, setMsg] = useState('');

  const persist = async (patch: { visit_budget?: string | null; stay_limit?: string | null }) => {
    setMsg('');
    try {
      const r = await fetch(FN_UPSERT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ line_user_id: lineUserId, ...patch }),
      });
      const j = await r.json();
      if (!j?.ok) throw new Error(String(j?.error ?? 'save_failed'));
    } catch {
      setMsg('保存に失敗しました。通信状況をご確認ください');
    }
  };

  const pickBudget = (b: string) => {
    const next = budget === b ? null : b;
    setBudget(next);
    void persist({ visit_budget: next ?? '' });
  };

  const pickStayNone = () => {
    setStayMode('none');
    setLeaveAt('');
    void persist({ stay_limit: '' });
  };

  const onTime = (v: string) => {
    setLeaveAt(v);
    setStayMode('time');
    if (v) void persist({ stay_limit: v + 'まで' });
  };

  return (
    <section style={card}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={heading}>予算の目安・滞在できる時間</span>
        <span style={{ fontSize: 10.5, lineHeight: 1.7, color: '#A2988A' }}>先に伝えておくと、当日の施術範囲を調整してもらえます（任意）</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {BUDGETS.map((b) => (
          <button key={b} type="button" onClick={() => pickBudget(b)} style={budget === b ? chipOn : chipOff}>{b}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={pickStayNone} style={stayMode === 'none' ? chipOn : chipOff}>時間の指定なし</button>
        <label style={{ ...(stayMode === 'time' ? chipOn : chipOff), display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="time"
            value={leaveAt}
            onChange={(e) => onTime(e.target.value)}
            style={{ border: 'none', background: 'none', font: 'inherit', color: 'inherit', padding: 0 }}
          />
          <span>までに退店したい</span>
        </label>
      </div>

      {msg && <span style={{ fontSize: 10.5, color: '#A8705C', textAlign: 'center' }}>{msg}</span>}
    </section>
  );
}
