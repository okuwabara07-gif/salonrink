'use client'

import { useEffect, useState } from 'react'
import LinkQr from './LinkQr'
import { OVERDUE_WEEKS, memoView, type PassTodayRow } from './todayModel'
import {
  fetchChemNotes,
  formulaText,
  saveChemNote,
  toDraft,
  type ChemDraft,
  type ChemNote,
} from './chemNotes'

const C = {
  text: '#1F2A37',
  weak: '#98948A',
  label: '#66716A',
  primary: '#2F6FC4',
  line: '#DDE5EF',
  line2: '#E3E9F1',
  line3: '#EEF2F7',
  bonus: '#5E9270',
  error: '#A0522D',
}
const MONO = 'var(--font-mono)'
const SANS = 'inherit'

type Field = { k: string; key: keyof ChemDraft; view: (n: ChemNote) => string; mono: boolean; input?: 'finish' | 'textarea' }

const FIELDS: Field[] = [
  { k: '施術区分', key: 'service_type', view: (n) => n.service_type ?? '', mono: false },
  { k: '薬剤', key: 'formula', view: (n) => formulaText(n.formula), mono: true },
  { k: 'オキシ', key: 'oxidant_pct', view: (n) => (n.oxidant_pct != null ? `OX${n.oxidant_pct}%` : ''), mono: true },
  { k: '放置時間', key: 'process_min', view: (n) => (n.process_min != null ? `${n.process_min}分` : ''), mono: true },
  { k: '根元の伸び', key: 'root_growth_cm', view: (n) => (n.root_growth_cm != null ? `${n.root_growth_cm}cm` : ''), mono: true },
  { k: '白髪率', key: 'gray_ratio', view: (n) => (n.gray_ratio != null ? `${n.gray_ratio}%` : ''), mono: true },
  { k: '頭皮の状態', key: 'scalp_note', view: (n) => n.scalp_note ?? '', mono: false },
  { k: '仕上がり', key: 'finish', view: (n) => n.finish ?? '', mono: false, input: 'finish' },
  { k: '申し送り', key: 'handover', view: (n) => n.handover ?? '', mono: false, input: 'textarea' },
  { k: '客側の色名', key: 'color_label', view: (n) => n.color_label ?? '', mono: false },
]

const UNIT_HINT: Partial<Record<keyof ChemDraft, string>> = {
  formula: '例：6/0+8/0 1:1',
  oxidant_pct: '％（数字）',
  process_min: '分（数字）',
  root_growth_cm: 'cm（数字）',
  gray_ratio: '％（数字）',
}

function md(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd)
  return m ? `${Number(m[2])}/${Number(m[3])}` : ymd
}

function receivedAt(v: unknown): string {
  if (!v || typeof v !== 'object') return ''
  const at = (v as { created_at?: unknown }).created_at
  if (typeof at !== 'string') return ''
  const d = new Date(Date.parse(at) + 9 * 3600 * 1000)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${d.getUTCHours()}:${String(d.getUTCMinutes()).padStart(2, '0')} LINEで受信`
}

type ChemState = { status: 'loading' } | { status: 'error'; error: string } | { status: 'ready'; current: ChemNote | null; past: ChemNote[] }

export default function DetailPanel({
  row,
  salonId,
  date,
  showQr,
  onClose,
}: {
  row: PassTodayRow
  salonId: string
  date: string
  showQr: boolean
  onClose: () => void
}) {
  const [chem, setChem] = useState<ChemState>({ status: 'loading' })
  const [nonce, setNonce] = useState(0)
  const [editing, setEditing] = useState<ChemDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [qrOpen, setQrOpen] = useState(showQr)

  const customerId = row.customer_id
  const name = row.customer_name ? `${row.customer_name}様` : 'お客様'
  const unlinked = !row.line_linked

  useEffect(() => {
    if (!customerId) return
    let cancelled = false
    fetchChemNotes(customerId, row.reservation_id).then((r) => {
      if (cancelled) return
      setChem('error' in r ? { status: 'error', error: r.error } : { status: 'ready', ...r })
    })
    return () => {
      cancelled = true
    }
  }, [customerId, row.reservation_id, nonce])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const ready = chem.status === 'ready' ? chem : null
  const pastAsc = ready ? [...ready.past].reverse() : []
  const previous = ready?.past[0] ?? null

  const save = async () => {
    if (!editing || !ready || !customerId) return
    setSaving(true)
    setSaveError(null)
    const r = await saveChemNote({
      draft: editing,
      current: ready.current,
      previous,
      salonId,
      customerId,
      reservationId: row.reservation_id,
      visitedOn: date,
    })
    setSaving(false)
    if (r.error) {
      setSaveError(r.error)
      return
    }
    setEditing(null)
    setChem({ status: 'loading' })
    setNonce((n) => n + 1)
  }

  const memo = memoView(row.consult_memo)
  const weeks = row.weeks_since_last
  const over = weeks != null && weeks >= OVERDUE_WEEKS
  const gridCols = `92px repeat(${Math.max(pastAsc.length, 1)},minmax(0,1fr)) minmax(0,1.1fr)`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name}の詳細`}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(31,42,55,.28)' }} />
      <div
        style={{
          position: 'relative',
          width: 'min(760px, 100vw)',
          height: '100vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: '26px 0 0 26px',
          padding: '24px 26px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 10px 30px rgba(40,70,120,.18)',
          color: C.text,
          fontSize: '14px',
          lineHeight: 1.6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              boxShadow: `inset 0 0 0 1px ${C.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 900,
              color: C.primary,
              flex: 'none',
            }}
          >
            {(row.customer_name ?? '').slice(0, 1)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <strong style={{ fontSize: '20px', fontWeight: 900 }}>{name}</strong>
            {unlinked && (
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '1px 9px',
                  borderRadius: '999px',
                  color: C.label,
                  boxShadow: `inset 0 0 0 1px ${C.line}`,
                }}
              >
                未連携
              </span>
            )}
          </div>
          {weeks != null && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                flex: 'none',
                color: over ? '#7A4E00' : C.label,
                background: over ? '#FCEBB4' : '#F1F5FA',
              }}
            >
              前回から{weeks}週
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            style={{
              marginLeft: weeks != null ? 0 : 'auto',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: `1px solid ${C.line}`,
              background: '#fff',
              boxShadow: '0 1px 4px rgba(40,70,120,.08)',
              color: C.label,
              fontSize: '18px',
              cursor: 'pointer',
              flex: 'none',
            }}
          >
            ×
          </button>
        </div>

        {unlinked && customerId && (
          <section
            style={{
              borderRadius: '20px',
              padding: '18px',
              boxShadow: `inset 0 0 0 1px ${C.line2}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: C.label }}>未連携のお客様</span>
            {qrOpen ? (
              <LinkQr customerId={customerId} name={name} balance={row.balance ?? 0} />
            ) : (
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#fff',
                  background: 'linear-gradient(180deg,#4A90E2,#2F6FC4)',
                  borderRadius: '12px',
                  padding: '0 14px',
                  minHeight: '44px',
                  border: 'none',
                  boxShadow: '0 4px 10px rgba(47,111,196,.3)',
                  cursor: 'pointer',
                }}
              >
                登録QRを表示
              </button>
            )}
          </section>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '12px' }}>
          {[
            ['来店回数', row.visit_count != null ? `${row.visit_count}回` : '—'],
            ['前回来店', row.last_visit_date ? row.last_visit_date.replace(/-/g, '/') : '—'],
            ['ポイント残高', `${row.balance ?? 0}P`],
            ['担当', row.staff_name || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ borderRadius: '16px', padding: '10px 14px', boxShadow: `inset 0 0 0 1px ${C.line}` }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: C.weak }}>{k}</div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: C.primary }}>{v}</div>
            </div>
          ))}
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <strong style={{ fontSize: '15px', fontWeight: 900 }}>薬剤メモ</strong>
            <span style={{ fontSize: '11.5px', color: C.weak }}>直近3回と今回。今回分は前回から自動で複製</span>
          </div>
          <div
            style={{
              borderRadius: '18px',
              padding: '6px 16px',
              boxShadow: '0 2px 8px rgba(40,70,120,.07)',
              border: `1px solid ${C.line2}`,
            }}
          >
            {!customerId && <Note text="お客様情報が未登録のため、薬剤メモはありません" />}
            {customerId && chem.status === 'loading' && <Note text="読み込み中…" />}
            {customerId && chem.status === 'error' && <Note text={`薬剤メモを取得できませんでした（${chem.error}）`} error />}
            {ready && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: gridCols,
                    gap: '10px',
                    padding: '10px 0',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: C.weak,
                    borderBottom: `1px solid ${C.line}`,
                  }}
                >
                  <span />
                  {pastAsc.length === 0 && <span>履歴なし</span>}
                  {pastAsc.map((n) => (
                    <span key={n.id}>{md(n.visited_on)}</span>
                  ))}
                  <span style={{ color: C.primary }}>今回 {md(date)}</span>
                </div>
                {FIELDS.map((f) => (
                  <div
                    key={f.k}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: gridCols,
                      gap: '10px',
                      padding: '7px 0',
                      borderBottom: `1px solid ${C.line3}`,
                      alignItems: 'start',
                    }}
                  >
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: C.label }}>{f.k}</span>
                    {pastAsc.length === 0 && <span />}
                    {pastAsc.map((n) => (
                      <Cell key={n.id} text={f.view(n) || '—'} mono={f.mono} />
                    ))}
                    <Cell
                      text={ready.current ? f.view(ready.current) || '—' : '—'}
                      mono={f.mono}
                      muted={!ready.current || ready.current.source === 'carry_over'}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0 8px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: ready.current ? C.bonus : C.weak,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {!ready.current
                      ? '今回分はまだありません（修正すると前回から作成）'
                      : ready.current.source === 'edited'
                        ? '今回：修正済み'
                        : '今回：前回と同じ（自動）'}
                  </span>
                  {!editing && (
                    <button
                      type="button"
                      onClick={() => setEditing(toDraft(ready.current ?? previous))}
                      style={{
                        marginLeft: 'auto',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: C.primary,
                        padding: '6px 18px',
                        borderRadius: '999px',
                        background: '#fff',
                        border: `1px solid ${C.line}`,
                        boxShadow: '0 1px 4px rgba(40,70,120,.08)',
                        cursor: 'pointer',
                        flex: 'none',
                      }}
                    >
                      修正
                    </button>
                  )}
                </div>
                {editing && (
                  <EditForm
                    draft={editing}
                    onChange={setEditing}
                    onCancel={() => {
                      setEditing(null)
                      setSaveError(null)
                    }}
                    onSave={() => void save()}
                    saving={saving}
                    error={saveError}
                  />
                )}
              </>
            )}
          </div>
        </section>

        {/* TODO(design): 前回の仕上がり写真は取得方法が未定のため非表示 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong style={{ fontSize: '15px', fontWeight: 900 }}>今回のご希望</strong>
          <div
            style={{
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: `inset 0 0 0 1px ${C.line}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {memo.wish === '—' ? (
              <span style={{ fontSize: '13px', color: C.weak }}>まだ届いていません</span>
            ) : (
              <>
                <span style={{ fontSize: '14px', fontWeight: 900, color: C.primary }}>{memo.wish}</span>
                {memo.sub && (
                  <span style={{ fontSize: '13px', lineHeight: 1.7 }}>{memo.sub.replace(/^「|」$/g, '')}</span>
                )}
                {receivedAt(row.consult_memo) && (
                  <span style={{ fontSize: '11px', color: C.weak }}>{receivedAt(row.consult_memo)}</span>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Note({ text, error }: { text: string; error?: boolean }) {
  return <div style={{ padding: '14px 0', fontSize: '13px', color: error ? C.error : C.weak }}>{text}</div>
}

function Cell({ text, mono, muted }: { text: string; mono: boolean; muted?: boolean }) {
  return (
    <span
      style={{
        fontFamily: mono ? MONO : SANS,
        fontSize: '12px',
        lineHeight: 1.55,
        color: muted ? C.weak : C.text,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {text}
    </span>
  )
}

function EditForm({
  draft,
  onChange,
  onCancel,
  onSave,
  saving,
  error,
}: {
  draft: ChemDraft
  onChange: (d: ChemDraft) => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
  error: string | null
}) {
  const inputStyle = {
    minHeight: '40px',
    borderRadius: '10px',
    border: `1px solid ${C.line}`,
    background: '#F1F5FA',
    padding: '6px 10px',
    fontSize: '13px',
    color: C.text,
    width: '100%',
    boxSizing: 'border-box' as const,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0 14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px 14px' }}>
        {FIELDS.map((f) => (
          <label
            key={f.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              gridColumn: f.input === 'textarea' ? '1 / -1' : undefined,
            }}
          >
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: C.label }}>
              {f.k}
              {UNIT_HINT[f.key] && <span style={{ fontWeight: 400, color: C.weak }}>　{UNIT_HINT[f.key]}</span>}
            </span>
            {f.input === 'finish' ? (
              <select
                value={draft[f.key]}
                onChange={(e) => onChange({ ...draft, [f.key]: e.target.value })}
                style={inputStyle}
              >
                <option value="">—</option>
                <option value="◎">◎</option>
                <option value="○">○</option>
                <option value="△">△</option>
              </select>
            ) : f.input === 'textarea' ? (
              <textarea
                value={draft[f.key]}
                onChange={(e) => onChange({ ...draft, [f.key]: e.target.value })}
                rows={2}
                style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
              />
            ) : (
              <input
                value={draft[f.key]}
                onChange={(e) => onChange({ ...draft, [f.key]: e.target.value })}
                inputMode={UNIT_HINT[f.key]?.includes('数字') ? 'decimal' : undefined}
                style={{ ...inputStyle, fontFamily: f.mono ? MONO : 'inherit' }}
              />
            )}
          </label>
        ))}
      </div>
      {error && <span style={{ fontSize: '12.5px', color: C.error }}>保存できませんでした（{error}）</span>}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          style={{
            minHeight: '40px',
            padding: '0 18px',
            borderRadius: '999px',
            border: `1px solid ${C.line}`,
            background: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            color: C.text,
            cursor: 'pointer',
          }}
        >
          やめる
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          style={{
            minHeight: '40px',
            padding: '0 22px',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(90deg,#3C82D6,#2F6FC4)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? '保存中…' : '保存する'}
        </button>
      </div>
    </div>
  )
}
