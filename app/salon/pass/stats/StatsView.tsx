'use client'

import { useEffect, useState } from 'react'
import { SalonShell } from '../../_components/SalonShell'
import { loadStats, type Stats } from './statsData'

const C = {
  text: '#1F2A37',
  weak: '#98948A',
  label: '#66716A',
  primary: '#2F6FC4',
  bar1: '#3C82D6',
  bar2: '#8FB8E8',
  line2: '#E3E9F1',
  axis: '#D5DDE8',
  delta: '#5E9270',
  error: '#A0522D',
}

const card = {
  background: '#FFFFFF',
  borderRadius: '22px',
  padding: '20px 22px',
  boxShadow: '0 4px 14px rgba(40,70,120,.08)',
  border: `1px solid ${C.line2}`,
} as const

function signed(n: number | null, unit: string): string {
  if (n == null) return ''
  return `前月 ${n >= 0 ? '+' : ''}${n}${unit}`
}

export default function StatsView({ salonId, salonName }: { salonId: string; salonName: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadStats(salonId)
      .then((s) => {
        if (!cancelled) setStats(s)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [salonId])

  const kpis = stats
    ? [
        { lbl: 'LINE会員登録率', val: stats.regRate != null ? String(stats.regRate) : '—', unit: '%', delta: signed(stats.regDelta, 'pt') },
        { lbl: '次回予約率', val: stats.nextRate != null ? String(stats.nextRate) : '—', unit: '%', delta: signed(stats.nextDelta, 'pt') || '直近30日' },
        { lbl: '特典交換数', val: String(stats.redeemsThisMonth), unit: '件', delta: '今月' },
        { lbl: '紙カードの削減', val: String(stats.linkedTotal), unit: '枚', delta: '累計' },
      ]
    : []

  return (
    <SalonShell active="stats" salonName={salonName}>
      <main style={{ minWidth: 0, padding: '30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 900, lineHeight: 1.2 }}>導入効果</h1>
        {error && <span style={{ color: C.error }}>集計できませんでした（{error}）</span>}
        {!error && !stats && <span style={{ color: C.weak }}>集計中…</span>}

        {stats && (
          <div style={{ width: '1100px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '18px' }}>
              {kpis.map((k) => (
                <div key={k.lbl} style={{ ...card, borderRadius: '20px', padding: '16px 19px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.weak }}>{k.lbl}</div>
                  <div style={{ fontSize: '34px', fontWeight: 900, color: C.primary, lineHeight: 1.35 }}>
                    {k.val}
                    <small style={{ fontSize: '14px', fontWeight: 700, color: C.label, marginLeft: '3px' }}>{k.unit}</small>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.delta, minHeight: '18px' }}>{k.delta}</div>
                </div>
              ))}
            </div>

            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <strong style={{ fontSize: '15px', fontWeight: 900 }}>月別の推移</strong>
                <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: C.label, marginLeft: 'auto' }}>
                  <Legend color={C.bar1} text="LINE会員登録率" />
                  <Legend color={C.bar2} text="次回予約率" />
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6,minmax(0,1fr))',
                  gap: '18px',
                  height: '220px',
                  alignItems: 'end',
                  padding: '0 8px',
                  borderBottom: `1px solid ${C.axis}`,
                }}
              >
                {stats.months.map((m) => (
                  <div
                    key={m.key}
                    style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}
                  >
                    <Bar value={m.regRate} color={C.bar1} label={`${m.label} LINE会員登録率`} />
                    <Bar value={m.nextRate} color={C.bar2} label={`${m.label} 次回予約率`} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: '18px', padding: '0 8px' }}>
                {stats.months.map((m) => (
                  <div key={m.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{m.label}</span>
                    <span style={{ fontSize: '11px', color: C.weak }}>
                      {m.regRate ?? '—'}% / {m.nextRate ?? '—'}%
                    </span>
                    {m.phase && <span style={{ fontSize: '11px', color: C.weak }}>{m.phase}</span>}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '11.5px', color: C.weak, lineHeight: 1.7 }}>
                月別の登録率は「その月にご来店のお客様のうち、月末までにLINE会員に連携した割合」、次回予約率は「その月の会計済みのうち、次回予約が紐付いた割合」です。
                上のLINE会員登録率は「連携済みの人数 ÷ 直近90日にご来店のお客様」です。
              </span>
            </div>
          </div>
        )}
      </main>
    </SalonShell>
  )
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
      {text}
    </span>
  )
}

function Bar({ value, color, label }: { value: number | null; color: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} ${value ?? 'データなし'}${value != null ? '%' : ''}`}
      title={value != null ? `${value}%` : 'データなし'}
      style={{
        width: '26px',
        borderRadius: '8px 8px 0 0',
        background: color,
        height: `${Math.min(100, value ?? 0)}%`,
      }}
    />
  )
}
