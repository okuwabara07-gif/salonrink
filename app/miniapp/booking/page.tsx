'use client'

/**
 * app/miniapp/booking/page.tsx
 *
 * 予約画面。
 * - 起動: /api/miniapp/reservations (action=list) でメニュー・設定・既存予約を取得
 * - 新規予約: メニュー選択 → 日付 → 時間 → 確定(action=create)
 * - 既存予約: 一覧表示 + キャンセル(op=cancel)
 *
 * 空き枠は salon_settings(open/close/last_order/slot/closed_weekdays)から算出。
 * ※HPB予約との二重防止は将来課題。当面1店舗は運用カバー。
 */

import { useEffect, useState } from 'react'
import liff from '@line/liff'

type Menu = { id: string; name: string; price: number; duration: number; category: string }
type Settings = {
  open_time: string
  close_time: string
  last_order_time: string
  slot_minutes: number
  closed_weekdays: number[]
  closed_dates: string[]
  daily_reservation_limit: number
} | null
type Reservation = { id: string; datetime: string; menu: string | null; status: string }

type State = 'loading' | 'ready' | 'unlinked' | 'error'

const C = {
  rose: '#C24E40',
  gold: '#B08D5E',
  ink: '#2b2622',
  muted: '#6f655d',
  bg: '#faf8f5',
  line: '#ece6df',
}

function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`
  } catch {
    return iso
  }
}

// 営業設定から指定日の予約可能時刻スロットを生成
function buildSlots(dateStr: string, s: Settings): string[] {
  if (!s) return ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + (m || 0)
  }
  const start = toMin(s.open_time || '10:00')
  const lastOrder = toMin(s.last_order_time || s.close_time || '19:00')
  const step = s.slot_minutes || 30
  const out: string[] = []
  for (let t = start; t <= lastOrder; t += step) {
    const h = Math.floor(t / 60)
    const m = t % 60
    out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return out
}

export default function MiniappBookingPage() {
  const [state, setState] = useState<State>('loading')
  const [idToken, setIdToken] = useState<string | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [settings, setSettings] = useState<Settings>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  // フォーム状態
  const [selMenu, setSelMenu] = useState<string>('')
  const [selDate, setSelDate] = useState<string>('')
  const [selTime, setSelTime] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const load = async (token: string) => {
    const res = await fetch('/api/miniapp/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token, action: 'list' }),
    })
    const data = await res.json()
    if (data.linked === false) {
      window.location.replace('/miniapp/link')
      return
    }
    setMenus(data.menus || [])
    setSettings(data.settings || null)
    setReservations((data.reservations || []).filter((r: Reservation) => r.status !== 'cancelled'))
    setState('ready')
  }

  useEffect(() => {
    const init = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER
        if (!liffId) throw new Error('LIFF ID が設定されていません')
        await liff.init({ liffId })
        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }
        const token = liff.getIDToken()
        if (!token) throw new Error('ログイン情報を取得できませんでした')
        setIdToken(token)
        await load(token)
      } catch (err) {
        console.error('[miniapp/booking] init error:', err)
        setErrorMsg(err instanceof Error ? err.message : '不明なエラーが発生しました')
        setState('error')
      }
    }
    init()
  }, [])

  const submit = async () => {
    if (!idToken || !selDate || !selTime) {
      setErrorMsg('日付と時間を選択してください')
      return
    }
    setErrorMsg('')
    setSubmitting(true)
    try {
      const datetime = new Date(`${selDate}T${selTime}:00`).toISOString()
      const menuName = menus.find((m) => m.id === selMenu)?.name || null
      const res = await fetch('/api/miniapp/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, action: 'create', datetime, menu: menuName }),
      })
      const data = await res.json()
      if (data.reservation) {
        setDone(true)
        setSelDate('')
        setSelTime('')
        setSelMenu('')
        await load(idToken)
      } else {
        setErrorMsg(data.error || '予約に失敗しました')
      }
    } catch {
      setErrorMsg('通信エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const cancel = async (id: string) => {
    if (!idToken) return
    if (!confirm('この予約をキャンセルしますか？')) return
    try {
      await fetch(`/api/miniapp/reservations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, op: 'cancel' }),
      })
      await load(idToken)
    } catch {
      setErrorMsg('キャンセルに失敗しました')
    }
  }

  // 今日以降の日付候補(14日分・定休日除外)
  const dateOptions: { value: string; label: string }[] = []
  {
    const closed = settings?.closed_weekdays || []
    const closedDates = settings?.closed_dates || []
    const now = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      if (closed.includes(d.getDay())) continue
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      if (closedDates.includes(ymd)) continue
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
      const wd = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
      dateOptions.push({ value, label: `${d.getMonth() + 1}/${d.getDate()}(${wd})` })
    }
  }
  const timeSlots = selDate ? buildSlots(selDate, settings) : []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'sans-serif', paddingBottom: 80 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: C.gold, fontWeight: 700 }}>
            SALONRINK
          </div>
          <h1 style={{ fontSize: 20, color: C.ink, marginTop: 4, fontWeight: 700 }}>ご予約</h1>
        </div>

        {state === 'loading' && <p style={{ color: C.muted, textAlign: 'center', marginTop: 40 }}>読み込み中...</p>}
        {state === 'error' && <p style={{ color: C.rose, textAlign: 'center', marginTop: 40 }}>{errorMsg}</p>}

        {state === 'ready' && (
          <>
            {/* 既存予約 */}
            {reservations.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={sectionLabel}>ご予約中</div>
                {reservations.map((r) => (
                  <div key={r.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>{fmtDateTime(r.datetime)}</div>
                      {r.menu && <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{r.menu}</div>}
                    </div>
                    <button onClick={() => cancel(r.id)} style={cancelBtn}>キャンセル</button>
                  </div>
                ))}
              </div>
            )}

            {done && (
              <div style={{ ...cardStyle, borderLeft: `4px solid ${C.rose}`, color: C.rose, fontWeight: 700 }}>
                ご予約を承りました。
              </div>
            )}

            {/* 新規予約フォーム */}
            <div style={cardStyle}>
              <div style={sectionLabel}>新しいご予約</div>

              <label style={fieldLabel}>メニュー</label>
              <select value={selMenu} onChange={(e) => setSelMenu(e.target.value)} style={selectStyle}>
                <option value="">選択してください</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}（¥{m.price.toLocaleString()}）
                  </option>
                ))}
              </select>

              <label style={fieldLabel}>日付</label>
              <select
                value={selDate}
                onChange={(e) => {
                  setSelDate(e.target.value)
                  setSelTime('')
                }}
                style={selectStyle}
              >
                <option value="">選択してください</option>
                {dateOptions.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              {selDate && (
                <>
                  <label style={fieldLabel}>時間</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelTime(t)}
                        style={{
                          ...timeChip,
                          background: selTime === t ? C.rose : '#fff',
                          color: selTime === t ? '#fff' : C.ink,
                          borderColor: selTime === t ? C.rose : C.line,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {errorMsg && <p style={{ color: C.rose, fontSize: 13, marginTop: 12 }}>{errorMsg}</p>}

              <button onClick={submit} disabled={submitting} style={{ ...ctaStyle, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? '送信中...' : 'この内容で予約する'}
              </button>
            </div>
          </>
        )}
      </div>

      <nav style={navStyle}>
        <a href="/miniapp" style={navItem}>ホーム</a>
        <a href="/miniapp/history" style={navItem}>履歴</a>
        <a href="/miniapp/booking" style={{ ...navItem, color: C.rose, fontWeight: 700 }}>予約</a>
      </nav>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
}
const sectionLabel: React.CSSProperties = { fontSize: 13, color: C.gold, fontWeight: 700, marginBottom: 8 }
const fieldLabel: React.CSSProperties = { display: 'block', fontSize: 13, color: C.muted, margin: '12px 0 6px' }
const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  fontSize: 15,
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  background: '#fff',
  boxSizing: 'border-box',
}
const timeChip: React.CSSProperties = {
  padding: '8px 14px',
  fontSize: 14,
  border: `1px solid ${C.line}`,
  borderRadius: 999,
  cursor: 'pointer',
}
const ctaStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 18,
  padding: '15px',
  fontSize: 16,
  fontWeight: 700,
  color: '#fff',
  background: C.rose,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
}
const cancelBtn: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 13,
  color: C.rose,
  background: '#fff',
  border: `1px solid ${C.rose}`,
  borderRadius: 8,
  cursor: 'pointer',
}
const navStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  background: '#fff',
  borderTop: `1px solid ${C.line}`,
  maxWidth: 480,
  margin: '0 auto',
}
const navItem: React.CSSProperties = {
  flex: 1,
  textAlign: 'center',
  padding: '14px 0',
  fontSize: 13,
  color: C.muted,
  textDecoration: 'none',
}
