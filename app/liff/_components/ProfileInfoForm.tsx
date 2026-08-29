'use client';
// B-1 画面10「わたしの情報」: 17 過去の施術履歴 / 18 アレルギー・注意事項
// upsert-profile v9 に直接POST。タップ/確定のたびに自動保存。
// 使い方: <ProfileInfoForm lineUserId={userId} initial={data?.profile ?? null} />

import { useState, type CSSProperties } from 'react';

const FN_UPSERT = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/upsert-profile';

export type TreatmentEntry = { type?: string; period?: string; note?: string };

export type ProfileInfoInitial = {
  allergies?: string[] | null;
  allergy_note?: string | null;
  treatment_history?: TreatmentEntry[] | null;
} | null;

const ALLERGY_OPTIONS = ['ヘアカラーでしみやすい', '金属アレルギーあり', '肌が敏感・荒れやすい'];
const TREATMENT_TYPES = ['カラー', 'パーマ', '縮毛矯正', 'ブリーチ', 'その他'];

const card: CSSProperties = { background: '#fff', borderRadius: 18, padding: 17, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 0 #E5DDCF' };
const heading: CSSProperties = { fontFamily: "'Shippori Mincho',serif", fontSize: 14, fontWeight: 500, color: '#2E2A24' };
const chipOff: CSSProperties = { border: '1px solid #E5DDCF', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, cursor: 'pointer', color: '#2E2A24' };
const chipOn: CSSProperties = { ...chipOff, border: '1px solid #A98D4B', background: '#EFE8DA', color: '#8A7A5F', fontWeight: 500 };
const inputStyle: CSSProperties = { border: '1px solid #E5DDCF', borderRadius: 12, padding: 12, fontSize: 11.5, width: '100%', boxSizing: 'border-box', background: '#fff', color: '#2E2A24' };
const rowStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', background: '#F7F3EA', borderRadius: 11, padding: '11px 12px', fontSize: 11.5, gap: 8 };

export default function ProfileInfoForm({ lineUserId, initial, onSaved }: {
  lineUserId: string;
  initial?: ProfileInfoInitial;
  onSaved?: () => void;
}) {
  const [allergies, setAllergies] = useState<string[]>(initial?.allergies ?? []);
  const [allergyNote, setAllergyNote] = useState(initial?.allergy_note ?? '');
  const [history, setHistory] = useState<TreatmentEntry[]>(initial?.treatment_history ?? []);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<TreatmentEntry>({ type: 'カラー', period: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const persist = async (patch: { allergies?: string[]; allergy_note?: string; treatment_history?: TreatmentEntry[] }) => {
    setBusy(true); setMsg('');
    try {
      const body = { line_user_id: lineUserId, allergies, allergy_note: allergyNote, treatment_history: history, ...patch };
      const r = await fetch(FN_UPSERT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!j?.ok) throw new Error(String(j?.error ?? 'save_failed'));
      setMsg('保存しました');
      onSaved?.();
    } catch {
      setMsg('保存に失敗しました。通信状況をご確認ください');
    } finally {
      setBusy(false);
    }
  };

  const toggleAllergy = (a: string) => {
    const next = allergies.includes(a) ? allergies.filter((v) => v !== a) : [...allergies, a];
    setAllergies(next);
    void persist({ allergies: next });
  };

  const addTreatment = () => {
    if (!draft.type && !draft.period && !draft.note) return;
    const next = [...history, { ...draft }];
    setHistory(next);
    setDraft({ type: 'カラー', period: '', note: '' });
    setAdding(false);
    void persist({ treatment_history: next });
  };

  const removeTreatment = (i: number) => {
    const next = history.filter((_, idx) => idx !== i);
    setHistory(next);
    void persist({ treatment_history: next });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <section style={card}>
        <span style={heading}>アレルギー・注意事項</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALLERGY_OPTIONS.map((a) => {
            const on = allergies.includes(a);
            return (
              <button key={a} type="button" onClick={() => toggleAllergy(a)} style={{ ...(on ? chipOn : chipOff), textAlign: 'left', font: 'inherit' }}>
                <span>{a}</span>
                <span style={{ width: 17, height: 17, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, ...(on ? { background: '#A98D4B', color: '#fff' } : { border: '1px solid #D8CCB8' }) }}>{on ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>
        <input
          style={inputStyle}
          placeholder="その他（自由記入）"
          value={allergyNote}
          maxLength={200}
          onChange={(e) => setAllergyNote(e.target.value)}
          onBlur={() => void persist({ allergy_note: allergyNote })}
        />
      </section>

      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={heading}>過去の施術履歴</span>
          <span style={{ fontSize: 10.5, color: '#A2988A' }}>自動＋手入力</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {history.length === 0 && <span style={{ fontSize: 11.5, color: '#A2988A' }}>まだ登録がありません</span>}
          {history.map((t, i) => (
            <div key={i} style={rowStyle}>
              <span style={{ color: '#7A7266', flex: 'none' }}>{t.type ?? 'その他'}</span>
              <span style={{ flex: 1, textAlign: 'right' }}>{[t.period, t.note].filter(Boolean).join('・') || '—'}</span>
              <button type="button" onClick={() => removeTreatment(i)} style={{ border: 'none', background: 'none', color: '#A8705C', fontSize: 11, cursor: 'pointer', padding: 0 }}>削除</button>
            </div>
          ))}
        </div>
        {adding ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {TREATMENT_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setDraft((d) => ({ ...d, type: t }))} style={{ ...(draft.type === t ? chipOn : chipOff), borderRadius: 99, padding: '8px 14px', font: 'inherit' }}>{t}</button>
              ))}
            </div>
            <input style={inputStyle} placeholder="時期（例 2026-05）" value={draft.period ?? ''} maxLength={20} onChange={(e) => setDraft((d) => ({ ...d, period: e.target.value }))} />
            <input style={inputStyle} placeholder="メモ（例 9レベル）" value={draft.note ?? ''} maxLength={60} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setAdding(false)} style={{ flex: 'none', width: 96, textAlign: 'center', border: '1px solid #E5DDCF', borderRadius: 99, padding: 11, fontSize: 12, background: 'none', color: '#7A7266', cursor: 'pointer', font: 'inherit' }}>やめる</button>
              <button type="button" onClick={addTreatment} style={{ flex: 1, textAlign: 'center', background: '#1B1815', color: '#fff', border: 'none', borderRadius: 99, padding: 11, fontSize: 12, fontWeight: 700, cursor: 'pointer', font: 'inherit' }}>この施術を追加</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAdding(true)} style={{ textAlign: 'center', border: '1px solid #E5DDCF', borderRadius: 99, padding: 11, fontSize: 12, background: 'none', cursor: 'pointer', font: 'inherit', color: '#2E2A24' }}>施術を追加する</button>
        )}
        <span style={{ fontSize: 10, lineHeight: 1.7, color: '#A2988A' }}>履歴が揃うほど、薬剤選定の判断材料が増えます</span>
      </section>

      {(busy || msg) && <span style={{ fontSize: 10.5, color: msg.includes('失敗') ? '#A8705C' : '#A2988A', textAlign: 'center' }}>{busy ? '保存中…' : msg}</span>}
    </div>
  );
}
