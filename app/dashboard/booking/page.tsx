'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// === 時間軸 ===
const TIME_START_MIN = 10 * 60
const TIME_END_MIN = 20 * 60
const TOTAL_MIN = TIME_END_MIN - TIME_START_MIN
const HOUR_WIDTH_PX = 160
const STAFF_COL_WIDTH_PX = 196

// === デザイントークン ===
const C = {
  bg: '#f4ede1', bgTint: '#efe6d4', surface: '#fefcf7', surface2: '#f9f3e7',
  line: '#e2d6bd', lineSoft: '#ece2cb',
  ink: '#1f1612', ink2: '#4a4239', ink3: '#7a7064', ink4: '#aaa094',
  accent: '#5a6b3f', accentInk: '#3a4628', accentSoft: '#eaeed8',
  danger: '#a85555', warn: '#b08840', info: '#4a6b80',
}
const FONT_SERIF = '"Noto Serif JP", serif'
const FONT_SANS = '"Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif'
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace'

const STATUS_STYLE: Record<string, { ja: string; color: string; bg: string; border: string }> = {
  confirmed:  { ja: '確定',   color: '#5a7a52', bg: '#eaf1e1', border: '#bcc9a8' },
  tentative:  { ja: '仮予約', color: '#a08036', bg: '#f6efde', border: '#d9c89a' },
  inprogress: { ja: '来店中', color: '#4a6b80', bg: '#e3ecf3', border: '#a8c2d2' },
  done:       { ja: '完了',   color: '#6b6357', bg: '#eee9df', border: '#cabfaa' },
  canceled:   { ja: '見送り', color: '#a85555', bg: '#f3e3e3', border: '#d9aeae' },
}
const SOURCE_STYLE: Record<string, { ja: string; short: string; color: string }> = {
  web:       { ja: 'ウェブ予約',     short: 'WEB',  color: '#5a7a8f' },
  phone:     { ja: '電話',           short: 'TEL',  color: '#8a6e4d' },
  walkin:    { ja: '直接来店',       short: '店頭', color: '#7a8f5a' },
  repeat:    { ja: 'リピーター',     short: 'RPT',  color: '#a3727f' },
  hpb:       { ja: 'HotPepper',      short: 'HPB',  color: '#c84a4a' },
  hotpepper: { ja: 'HotPepper',      short: 'HPB',  color: '#c84a4a' },
  line:      { ja: 'LINE',           short: 'LINE', color: '#06c755' },
  manual:    { ja: '手動',           short: '手動', color: '#7a7064' },
}
const STAFF_COLORS = ['#7a8f5a', '#a6794d', '#6e7fa3', '#a3727f', '#9a9285', '#8a7a5a']

function hashColor(s: string): string {
  let sum = 0
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i)
  return STAFF_COLORS[sum % STAFF_COLORS.length]
}
function initials(name: string): string {
  if (!name) return '—'
  const t = name.trim()
  if (t.length === 0) return '—'
  return t.slice(0, 2)
}
function fmtMin(min: number): string {
  const h = Math.floor(min / 60), m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function isoToMin(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}
function fmtDateJa(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日 (${'日月火水木金土'[d.getDay()]})`
}

interface Booking {
  id: string
  staffId: string
  staffName: string
  startMin: number
  endMin: number
  customerName: string
  phone: string
  menu: string
  price: number
  status: string
  source: string
  tags: string[]
  memo: string
}
interface StaffInfo {
  id: string
  name: string
  role: string
  count: number
  totalMin: number
}

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [date, setDate] = useState<Date>(() => new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterStaff, setFilterStaff] = useState<string>('all')
  const [query, setQuery] = useState<string>('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [shopName, setShopName] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [nowMin, setNowMin] = useState<number>(() => {
    const n = new Date()
    return n.getHours() * 60 + n.getMinutes()
  })

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date()
      setNowMin(n.getHours() * 60 + n.getMinutes())
    }, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function load() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserName((user.user_metadata as any)?.name || user.email?.split('@')[0] || 'ユーザー')
      const { data: salon } = await supabase
        .from('salons')
        .select('id, name')
        .eq('owner_user_id', user.id)
        .maybeSingle()
      if (!salon) {
        setLoading(false)
        return
      }
      setShopName(salon.name || 'サロン')
      await fetchBookings(salon.id, date)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    async function refetch() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: salon } = await supabase
        .from('salons').select('id').eq('owner_user_id', user.id).maybeSingle()
      if (!salon) return
      await fetchBookings(salon.id, date)
    }
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  async function fetchBookings(salonId: string, targetDate: Date) {
    setLoading(true)
    const supabase = await createClient()
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0)
    const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1, 0, 0, 0)

    let hpbData: any[] = []
    try {
      const r = await supabase
        .from('hpb_reservations')
        .select('*')
        .eq('salon_id', salonId)
        .gte('start_time', dayStart.toISOString())
        .lt('start_time', dayEnd.toISOString())
        .order('start_time', { ascending: true })
      hpbData = r.data || []
    } catch (e) {
      console.warn('hpb_reservations fetch failed:', e)
    }

    let resvData: any[] = []
    try {
      const r = await supabase
        .from('reservations')
        .select('*')
        .eq('salon_id', salonId)
        .gte('datetime', dayStart.toISOString())
        .lt('datetime', dayEnd.toISOString())
        .order('datetime', { ascending: true })
      resvData = r.data || []
    } catch (e) {
      console.warn('reservations fetch failed:', e)
    }

    const all: Booking[] = []
    for (const r of hpbData) {
      if (!r.start_time) continue
      const startMin = isoToMin(r.start_time)
      const endMin = r.end_time ? isoToMin(r.end_time) : startMin + 60
      const staffId = (r.raw_data && r.raw_data.staff_id) || 'unknown'
      const staffSuffix = staffId !== 'unknown' ? staffId.slice(-4) : '未'
      all.push({
        id: 'hpb_' + r.id,
        staffId,
        staffName: staffId === 'unknown' ? '未割当' : `スタッフ ${staffSuffix}`,
        startMin, endMin,
        customerName: r.customer_name || 'ゲスト',
        phone: '',
        menu: r.menu_name || '(メニュー未取得)',
        price: 0,
        status: r.status || 'confirmed',
        source: 'hpb',
        tags: [],
        memo: '',
      })
    }
    for (const r of resvData) {
      if (!r.datetime) continue
      const startMin = isoToMin(r.datetime)
      all.push({
        id: 'resv_' + r.id,
        staffId: r.staff_id || 'unknown',
        staffName: '未割当',
        startMin, endMin: startMin + 60,
        customerName: r.customer_name || 'ゲスト',
        phone: r.customer_line_id || '',
        menu: r.menu || '',
        price: 0,
        status: r.status || 'confirmed',
        source: r.source || 'manual',
        tags: [],
        memo: '',
      })
    }
    setBookings(all.sort((a, b) => a.startMin - b.startMin))
    setLoading(false)
  }

  // フィルタ適用
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filterStatus !== 'all' && b.status !== filterStatus) return false
      if (filterSource !== 'all' && b.source !== filterSource) return false
      if (filterStaff !== 'all' && b.staffId !== filterStaff) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        if (!b.customerName.toLowerCase().includes(q) && !b.menu.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [bookings, filterStatus, filterSource, filterStaff, query])

  // スタッフ集計
  const staffList = useMemo<StaffInfo[]>(() => {
    const map = new Map<string, StaffInfo>()
    for (const b of filteredBookings) {
      if (!map.has(b.staffId)) {
        map.set(b.staffId, { id: b.staffId, name: b.staffName, role: '', count: 0, totalMin: 0 })
      }
      const s = map.get(b.staffId)!
      s.count += 1
      s.totalMin += (b.endMin - b.startMin)
    }
    if (map.size === 0) {
      map.set('unknown', { id: 'unknown', name: 'スタッフ未割当', role: '', count: 0, totalMin: 0 })
    }
    return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id))
  }, [filteredBookings])

  // 全スタッフ(フィルタ前、フィルタUI用)
  const allStaffOptions = useMemo<StaffInfo[]>(() => {
    const map = new Map<string, StaffInfo>()
    for (const b of bookings) {
      if (!map.has(b.staffId)) {
        map.set(b.staffId, { id: b.staffId, name: b.staffName, role: '', count: 0, totalMin: 0 })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id))
  }, [bookings])

  // KPI 計算
  const kpis = useMemo(() => {
    const total = filteredBookings.length
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length
    const inprogress = filteredBookings.filter(b => b.status === 'inprogress').length
    const newCount = filteredBookings.filter(b => b.tags.includes('新規')).length
    const revenue = filteredBookings.reduce((sum, b) => sum + (b.price || 0), 0)
    return { total, confirmed, inprogress, newCount, revenue }
  }, [filteredBookings])

  const hours = useMemo(() => {
    const arr: number[] = []
    for (let t = TIME_START_MIN; t < TIME_END_MIN; t += 60) arr.push(t)
    return arr
  }, [])

  const halfSlots = useMemo(() => {
    const arr: number[] = []
    for (let t = TIME_START_MIN; t < TIME_END_MIN; t += 30) arr.push(t)
    return arr
  }, [])

  function countAt(slotStart: number): number {
    const slotEnd = slotStart + 30
    return filteredBookings.filter(b =>
      b.status !== 'canceled' && b.startMin < slotEnd && b.endMin > slotStart
    ).length
  }

  // 同じスタッフ行内で時間重なりを検出してレーン分けする
  function assignLanes(rowBookings: Booking[]): { booking: Booking; lane: number; totalLanes: number }[] {
    const sorted = [...rowBookings].sort((a, b) => a.startMin - b.startMin)
    const lanes: number[] = []
    const result: { booking: Booking; lane: number }[] = []
    for (const b of sorted) {
      let assigned = -1
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i] <= b.startMin) {
          assigned = i
          lanes[i] = b.endMin
          break
        }
      }
      if (assigned === -1) {
        lanes.push(b.endMin)
        assigned = lanes.length - 1
      }
      result.push({ booking: b, lane: assigned })
    }
    const totalLanes = lanes.length
    return result.map(r => ({ ...r, totalLanes }))
  }

  const selectedBooking = bookings.find(b => b.id === selectedId)
  const nowInRange = nowMin >= TIME_START_MIN && nowMin <= TIME_END_MIN
  const nowLeftPx = ((nowMin - TIME_START_MIN) / 60) * HOUR_WIDTH_PX

  const isToday = (() => {
    const today = new Date()
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate()
  })()

  function shiftDate(days: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    setDate(d)
    setSelectedId(null)
  }
  function goToday() {
    setDate(new Date())
    setSelectedId(null)
  }

  async function updateStatus(bookingId: string, newStatus: string) {
    // 楽観的更新
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
    const isHpb = bookingId.startsWith('hpb_')
    const realId = bookingId.replace(/^(hpb_|resv_)/, '')
    try {
      const supabase = await createClient()
      const table = isHpb ? 'hpb_reservations' : 'reservations'
      await supabase.from(table).update({ status: newStatus }).eq('id', realId)
    } catch (e) {
      console.warn('status update failed:', e)
    }
  }

  return (
    <main style={{
      background: C.bg, minHeight: '100vh', color: C.ink,
      fontFamily: FONT_SANS, fontFeatureSettings: '"palt"',
    }}>
      {/* ============ トップバー ============ */}
      <header style={{
        height: 56, display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center',
        padding: '0 22px', borderBottom: `1px solid ${C.lineSoft}`,
        background: C.surface,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{
            fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 500,
            letterSpacing: '0.08em', color: C.ink,
          }}>サロンリンク</span>
          <span style={{
            fontSize: 11, color: C.ink3, letterSpacing: '0.08em',
          }}>管理 / 予約</span>
        </div>
        <div style={{
          textAlign: 'center', fontSize: 11, color: C.ink3,
          letterSpacing: '0.12em',
        }}>
          {shopName || '店舗名'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
          <button style={{
            padding: '6px 14px', border: `1px solid ${C.line}`, borderRadius: 6,
            background: C.surface, color: C.ink2, fontSize: 11,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M6 6.5C6 5.5 6.8 5 8 5C9.2 5 10 5.7 10 6.5C10 7.3 9 7.5 9 8.5M9 11h0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            ヘルプ
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999, background: C.accent,
              color: '#fdf6e8', display: 'grid', placeItems: 'center',
              fontFamily: FONT_SERIF, fontSize: 12, fontWeight: 500,
            }}>{initials(userName)}</div>
            <span style={{ fontSize: 11, color: C.ink2 }}>{userName}</span>
          </div>
        </div>
      </header>

      {/* ============ コントロールバー ============ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 28px 12px', flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.16em', color: C.ink3,
            textTransform: 'uppercase', marginBottom: 4,
          }}>RESERVATIONS</div>
          <h1 style={{
            fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 500,
            letterSpacing: '0.06em', color: C.ink, margin: 0,
          }}>予約管理</h1>
        </div>

        {/* 日付ナビ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
          <button onClick={() => shiftDate(-1)} style={ghostIconBtn}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{
            fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 500,
            letterSpacing: '0.04em', color: C.ink, padding: '0 10px',
          }}>{fmtDateJa(date)}</div>
          <button onClick={() => shiftDate(1)} style={ghostIconBtn}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={goToday} style={{
            padding: '4px 12px', borderRadius: 999,
            border: `1px solid ${isToday ? C.accent : C.line}`,
            background: isToday ? C.accentSoft : C.surface,
            color: isToday ? C.accentInk : C.ink2,
            fontSize: 11, cursor: 'pointer', marginLeft: 4,
          }}>今日</button>
        </div>

        {/* セグメントコントロール 日/週/月 */}
        <div role="tablist" style={{
          display: 'inline-flex', border: `1px solid ${C.line}`, borderRadius: 8,
          overflow: 'hidden',
        }}>
          {(['day', 'week', 'month'] as const).map(v => (
            <button key={v} role="tab" onClick={() => setView(v)} style={{
              padding: '6px 14px', border: 'none', cursor: 'pointer',
              background: view === v ? C.ink : C.surface,
              color: view === v ? '#fdf6e8' : C.ink2,
              fontFamily: FONT_SERIF, fontSize: 12, fontWeight: 500,
              letterSpacing: '0.06em',
            }}>{v === 'day' ? '日' : v === 'week' ? '週' : '月'}</button>
          ))}
        </div>

        {/* フィルタ群 */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: 10, top: 8, color: C.ink4 }}>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="お客様名 / メニュー" style={{
                padding: '6px 12px 6px 28px', borderRadius: 6,
                border: `1px solid ${C.line}`, background: C.surface,
                fontFamily: FONT_SANS, fontSize: 12, color: C.ink, width: 180,
                outline: 'none',
              }} />
          </div>
          <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} style={selectStyle}>
            <option value="all">担当: 全員</option>
            {allStaffOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={selectStyle}>
            <option value="all">経路: 全て</option>
            {Object.entries(SOURCE_STYLE).map(([k, v]) => <option key={k} value={k}>{v.ja}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="all">状態: 全て</option>
            {Object.entries(STATUS_STYLE).map(([k, v]) => <option key={k} value={k}>{v.ja}</option>)}
          </select>
          <button onClick={() => window.print()} style={ghostBtn}>印刷</button>
          <button onClick={() => setShowNewModal(true)} style={primaryBtn}>+ 新規予約</button>
        </div>
      </div>

      {/* ============ KPIサマリーストリップ ============ */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 28px', alignItems: 'stretch',
        flexWrap: 'wrap',
      }}>
        {[
          { label: '本日の予約数', value: kpis.total, suffix: '件' },
          { label: '確定', value: kpis.confirmed, suffix: '件' },
          { label: '来店中', value: kpis.inprogress, suffix: '件', color: C.info },
          { label: '新規顧客', value: kpis.newCount, suffix: '名' },
          { label: '見込み売上', value: '¥' + kpis.revenue.toLocaleString(), suffix: '', mono: true },
        ].map((k, i) => (
          <div key={i} style={{
            padding: '14px 22px', borderRight: `1px solid ${C.lineSoft}`,
            minWidth: 100,
          }}>
            <div style={{
              fontSize: 10, letterSpacing: '0.14em', color: C.ink3,
              textTransform: 'uppercase', marginBottom: 4,
            }}>{k.label}</div>
            <div style={{
              fontSize: 20, fontWeight: 500,
              color: k.color || C.ink,
              fontFamily: k.mono ? FONT_MONO : FONT_SANS,
            }}>
              {k.value}<span style={{ fontSize: 11, color: C.ink3, marginLeft: 4, fontWeight: 400 }}>{k.suffix}</span>
            </div>
          </div>
        ))}
        <div style={{
          padding: '14px 22px', marginLeft: 'auto',
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.14em', color: C.ink3,
            textTransform: 'uppercase', marginBottom: 4,
          }}>現在時刻</div>
          <div style={{
            fontSize: 20, fontWeight: 500, color: C.danger,
            fontFamily: FONT_MONO,
          }}>{fmtMin(nowMin)}</div>
        </div>
      </div>

      {/* ============ メイン領域(タイムライン + 詳細パネル) ============ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedBooking ? '1fr 380px' : '1fr',
        gap: 0, transition: 'grid-template-columns 0.2s ease',
      }}>
        <div style={{ padding: '12px 28px 32px' }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: C.ink3 }}>読み込み中...</div>
          ) : view === 'day' ? (
            <DayTimeline
              hours={hours}
              halfSlots={halfSlots}
              staffList={staffList}
              bookings={filteredBookings}
              selectedId={selectedId}
              onSelect={setSelectedId}
              nowMin={nowMin}
              nowInRange={nowInRange}
              nowLeftPx={nowLeftPx}
              countAt={countAt}
              assignLanes={assignLanes}
            />
          ) : (
            <div style={{
              background: C.surface, borderRadius: 18, padding: 60,
              border: `1px solid ${C.lineSoft}`, textAlign: 'center',
              color: C.ink3, fontSize: 13,
            }}>
              {view === 'week' ? '週ビュー' : '月ビュー'}は近日実装予定です
            </div>
          )}
        </div>

        {selectedBooking && (
          <DetailPanel
            booking={selectedBooking}
            onClose={() => setSelectedId(null)}
            onStatusChange={updateStatus}
          />
        )}
      </div>

      {/* ============ 新規予約モーダル ============ */}
      {showNewModal && (
        <NewBookingModal
          onClose={() => setShowNewModal(false)}
          allStaff={allStaffOptions}
          onAdd={(newB) => {
            setBookings(prev => [...prev, newB].sort((a, b) => a.startMin - b.startMin))
            setShowNewModal(false)
          }}
        />
      )}
    </main>
  )
}

// === タイムライン本体 ===
function DayTimeline(props: {
  hours: number[]
  halfSlots: number[]
  staffList: StaffInfo[]
  bookings: Booking[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  nowMin: number
  nowInRange: boolean
  nowLeftPx: number
  countAt: (slot: number) => number
  assignLanes: (rowBookings: Booking[]) => { booking: Booking; lane: number; totalLanes: number }[]
}) {
  const { hours, halfSlots, staffList, bookings, selectedId, onSelect, nowInRange, nowLeftPx, countAt, assignLanes } = props
  const totalCap = Math.max(1, staffList.length)

  return (
    <div style={{
      background: C.surface, borderRadius: 18,
      border: `1px solid ${C.lineSoft}`,
      boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 6px 22px -10px rgba(60,40,20,.10)',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: STAFF_COL_WIDTH_PX + hours.length * HOUR_WIDTH_PX }}>
          {/* ヘッダー行 */}
          <div style={{
            display: 'grid', gridTemplateColumns: `${STAFF_COL_WIDTH_PX}px 1fr`,
            borderBottom: `1px solid ${C.line}`, background: C.surface2,
          }}>
            <div style={{
              padding: '12px 16px', fontSize: 10, letterSpacing: '0.16em',
              color: C.ink3, textTransform: 'uppercase',
              borderRight: `1px solid ${C.line}`,
            }}>時間</div>
            <div style={{ display: 'flex' }}>
              {hours.map(h => {
                const slotCount = bookings.filter(b => b.status !== 'canceled' && b.startMin < h + 60 && b.endMin > h).length
                return (
                  <div key={h} style={{
                    width: HOUR_WIDTH_PX, padding: '10px 12px',
                    borderRight: `1px solid ${C.lineSoft}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 500, color: C.ink2 }}>
                      {fmtMin(h)}
                    </span>
                    <span style={{ fontSize: 9, color: C.ink3 }}>
                      予約<strong style={{ marginLeft: 2, color: C.ink2 }}>{slotCount}</strong>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* サマリー行(30分単位) */}
          <div style={{
            display: 'grid', gridTemplateColumns: `${STAFF_COL_WIDTH_PX}px 1fr`,
            borderBottom: `1px solid ${C.line}`, background: C.surface2,
          }}>
            <div style={{
              padding: '8px 16px', borderRight: `1px solid ${C.line}`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, letterSpacing: '0.1em' }}>受付状況</div>
              <div style={{ fontSize: 9, color: C.ink3, marginTop: 2 }}>30分単位 / 全{totalCap}席</div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${halfSlots.length}, ${HOUR_WIDTH_PX / 2}px)`,
            }}>
              {halfSlots.map(s => {
                const used = countAt(s)
                const cap = totalCap
                const remain = Math.max(0, cap - used)
                const isFull = remain === 0
                const isEmpty = used === 0
                return (
                  <div key={s} style={{
                    padding: '6px 4px', textAlign: 'center',
                    borderRight: `1px solid ${C.lineSoft}`,
                    background: isFull ? '#f3e3e3' : 'transparent',
                  }}>
                    <div style={{ fontSize: 9, color: isFull ? C.danger : C.ink3 }}>残{remain}</div>
                    <div style={{
                      fontFamily: FONT_MONO, fontSize: 14, fontWeight: 600,
                      color: isFull ? C.danger : isEmpty ? C.ink4 : C.ink,
                    }}>{used}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* スタッフ行 */}
          {staffList.map(staff => {
            const rowBookings = bookings.filter(b => b.staffId === staff.id)
            const laneAssignments = assignLanes(rowBookings)
            const totalLanes = Math.max(1, laneAssignments[0]?.totalLanes || 1)
            const rowHeight = Math.max(76, totalLanes * 70)
            return (
              <div key={staff.id} style={{
                display: 'grid', gridTemplateColumns: `${STAFF_COL_WIDTH_PX}px 1fr`,
                borderBottom: `1px solid ${C.lineSoft}`, minHeight: rowHeight,
              }}>
                <div style={{
                  padding: '12px 16px', borderRight: `1px solid ${C.line}`,
                  display: 'flex', alignItems: 'center', gap: 10, background: C.surface,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 999,
                    background: hashColor(staff.id), color: '#fdf6e8',
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 600, fontFamily: FONT_SERIF,
                    flexShrink: 0,
                  }}>{initials(staff.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: FONT_SERIF, fontSize: 13, fontWeight: 500,
                      letterSpacing: '0.04em', color: C.ink,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{staff.name}</div>
                    <div style={{ fontSize: 10, color: C.ink3, fontFamily: FONT_MONO, marginTop: 2 }}>
                      {staff.count}件 / {(staff.totalMin / 60).toFixed(1)}h
                    </div>
                  </div>
                </div>
                <div style={{
                  position: 'relative',
                  background: `repeating-linear-gradient(to right, transparent 0 ${HOUR_WIDTH_PX - 1}px, ${C.lineSoft} ${HOUR_WIDTH_PX - 1}px ${HOUR_WIDTH_PX}px), repeating-linear-gradient(to right, transparent 0 ${HOUR_WIDTH_PX / 2 - 1}px, ${C.lineSoft}66 ${HOUR_WIDTH_PX / 2 - 1}px ${HOUR_WIDTH_PX / 2}px)`,
                  backgroundSize: `${HOUR_WIDTH_PX}px 100%, ${HOUR_WIDTH_PX / 2}px 100%`,
                  minHeight: rowHeight,
                }}>
                  {laneAssignments.map(({ booking: b, lane }) => {
                    const leftPct = ((b.startMin - TIME_START_MIN) / TOTAL_MIN) * 100
                    const widthPct = ((b.endMin - b.startMin) / TOTAL_MIN) * 100
                    const st = STATUS_STYLE[b.status] || STATUS_STYLE.confirmed
                    const src = SOURCE_STYLE[b.source] || SOURCE_STYLE.manual
                    const isShort = (b.endMin - b.startMin) < 60
                    const isSelected = selectedId === b.id
                    const laneHeight = (rowHeight - 12) / totalLanes
                    return (
                      <div key={b.id}
                        onClick={() => onSelect(isSelected ? null : b.id)}
                        style={{
                          position: 'absolute',
                          left: `${leftPct}%`, width: `${widthPct}%`,
                          top: 6 + lane * laneHeight,
                          height: laneHeight - 4,
                          background: C.surface, borderRadius: 6,
                          border: `1px solid ${C.line}`,
                          borderLeft: `3px solid ${st.color}`,
                          outline: isSelected ? `2px solid ${C.ink}` : 'none',
                          outlineOffset: -2,
                          padding: '6px 8px', cursor: 'pointer', overflow: 'hidden',
                          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                          boxShadow: '0 1px 2px rgba(60,40,20,.04)',
                          opacity: b.status === 'canceled' ? 0.5 : 1,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(60,40,20,.10)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,40,20,.04)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 500, color: C.ink2 }}>
                            {fmtMin(b.startMin)}–{fmtMin(b.endMin)}
                          </span>
                          <span style={{
                            fontSize: 9, padding: '1px 6px', borderRadius: 3,
                            background: st.bg, color: st.color,
                            border: `1px solid ${st.border}`, flexShrink: 0,
                          }}>{st.ja}</span>
                        </div>
                        <div style={{
                          fontFamily: FONT_SERIF, fontSize: 13, fontWeight: 500, color: C.ink,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          marginBottom: 2,
                        }}>
                          {b.customerName} <span style={{ fontSize: 10, color: C.ink3 }}>様</span>
                        </div>
                        {!isShort && (
                          <>
                            <div style={{
                              fontSize: 10, color: C.ink3,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              marginBottom: 4,
                            }}>{b.menu}</div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <span style={{
                                fontSize: 9, padding: '1px 5px', borderRadius: 3,
                                background: '#fff', color: src.color,
                                border: `1px solid ${src.color}`, fontFamily: FONT_MONO, fontWeight: 500,
                              }}>{src.short}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                  {nowInRange && (
                    <div style={{
                      position: 'absolute', left: nowLeftPx, top: 0, bottom: 0,
                      width: 1, background: C.danger, pointerEvents: 'none', zIndex: 10,
                    }}>
                      <div style={{
                        position: 'absolute', top: -4, left: -4,
                        width: 9, height: 9, background: C.danger, borderRadius: 999,
                      }} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {bookings.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: C.ink3, fontSize: 13 }}>
              本日の予約はありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// === 詳細パネル ===
function DetailPanel(props: {
  booking: Booking
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
}) {
  const { booking, onClose, onStatusChange } = props
  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.confirmed
  const src = SOURCE_STYLE[booking.source] || SOURCE_STYLE.manual
  const otherStatuses = ['confirmed', 'inprogress', 'done', 'canceled'].filter(s => s !== booking.status)

  return (
    <aside style={{
      background: C.surface, borderLeft: `1px solid ${C.lineSoft}`,
      padding: '20px 24px', minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{
          fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 500,
          letterSpacing: '0.06em', color: C.ink,
        }}>予約詳細</div>
        <button onClick={onClose} aria-label="閉じる" style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 6, color: C.ink3,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 0', borderBottom: `1px solid ${C.lineSoft}`,
        marginBottom: 8,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 999,
          background: hashColor(booking.staffId), color: '#fdf6e8',
          display: 'grid', placeItems: 'center',
          fontSize: 16, fontFamily: FONT_SERIF, fontWeight: 500,
          flexShrink: 0,
        }}>{booking.customerName.charAt(0)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 500, color: C.ink,
          }}>
            {booking.customerName} <span style={{ fontSize: 12, color: C.ink3 }}>様</span>
          </div>
          {booking.phone && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.ink3, marginTop: 2 }}>{booking.phone}</div>
          )}
        </div>
      </div>

      <DetailRow label="ステータス">
        <span style={{
          padding: '3px 10px', borderRadius: 4,
          background: st.bg, color: st.color,
          border: `1px solid ${st.border}`, fontSize: 11,
        }}>{st.ja}</span>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {otherStatuses.map(s => (
            <button key={s} onClick={() => onStatusChange(booking.id, s)} style={{
              padding: '4px 10px', height: 26, fontSize: 11,
              borderRadius: 6, border: `1px solid ${C.line}`,
              background: C.surface, color: C.ink2, cursor: 'pointer',
            }}>→ {STATUS_STYLE[s].ja}</button>
          ))}
        </div>
      </DetailRow>
      <DetailRow label="時間">
        <span style={{ fontFamily: FONT_MONO, fontSize: 13 }}>
          {fmtMin(booking.startMin)} – {fmtMin(booking.endMin)}
          <span style={{ color: C.ink3, marginLeft: 8, fontSize: 11 }}>
            ({booking.endMin - booking.startMin}分)
          </span>
        </span>
      </DetailRow>
      <DetailRow label="担当">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 20, height: 20, borderRadius: 999, background: hashColor(booking.staffId),
            color: '#fdf6e8', display: 'grid', placeItems: 'center',
            fontSize: 9, fontWeight: 600,
          }}>{initials(booking.staffName)}</span>
          {booking.staffName}
        </div>
      </DetailRow>
      <DetailRow label="メニュー">
        <span style={{ fontSize: 12 }}>{booking.menu || '—'}</span>
      </DetailRow>
      {booking.price > 0 && (
        <DetailRow label="料金">
          <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 600 }}>
            ¥{booking.price.toLocaleString()}
          </span>
          <span style={{ color: C.ink3, fontSize: 11, marginLeft: 6 }}>税込</span>
        </DetailRow>
      )}
      <DetailRow label="予約経路">
        <span style={{
          padding: '2px 6px', borderRadius: 3,
          background: '#fff', color: src.color,
          border: `1px solid ${src.color}`, fontSize: 10, fontFamily: FONT_MONO,
        }}>{src.short}</span>
        <span style={{ marginLeft: 8, fontSize: 12 }}>{src.ja}</span>
      </DetailRow>
      {booking.memo && (
        <DetailRow label="メモ">
          <div style={{
            background: C.surface2, padding: '8px 10px', borderRadius: 6,
            fontSize: 12, color: C.ink2, lineHeight: 1.5,
          }}>{booking.memo}</div>
        </DetailRow>
      )}

      <div style={{
        display: 'flex', gap: 8, marginTop: 20, paddingTop: 16,
        borderTop: `1px solid ${C.lineSoft}`,
      }}>
        <button style={{ ...ghostBtn, flex: 1 }}>編集</button>
        <button onClick={() => onStatusChange(booking.id, 'inprogress')} style={{ ...primaryBtn, flex: 1 }}>来店受付</button>
      </div>
    </aside>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '86px 1fr',
      padding: '12px 0',
      borderBottom: `1px dotted ${C.lineSoft}`,
      alignItems: 'start',
    }}>
      <div style={{
        fontSize: 10, letterSpacing: '0.12em', color: C.ink3,
        textTransform: 'uppercase', paddingTop: 2,
      }}>{label}</div>
      <div style={{ fontSize: 13, color: C.ink }}>{children}</div>
    </div>
  )
}

// === 新規予約モーダル ===
function NewBookingModal(props: {
  onClose: () => void
  allStaff: StaffInfo[]
  onAdd: (b: Booking) => void
}) {
  const { onClose, allStaff, onAdd } = props
  const [form, setForm] = useState({
    customer: '', phone: '', staffId: allStaff[0]?.id || 'unknown',
    source: 'phone', hour: '10', minute: '00', durMin: 60,
    menu: '', memo: '',
  })

  function submit() {
    if (!form.customer.trim()) {
      alert('お客様名を入力してください')
      return
    }
    const startMin = parseInt(form.hour) * 60 + parseInt(form.minute)
    const staff = allStaff.find(s => s.id === form.staffId)
    const newB: Booking = {
      id: 'manual_' + Date.now(),
      staffId: form.staffId,
      staffName: staff?.name || '未割当',
      startMin, endMin: startMin + form.durMin,
      customerName: form.customer.trim(),
      phone: form.phone.trim(),
      menu: form.menu.trim(),
      price: 0,
      status: 'tentative',
      source: form.source,
      tags: [],
      memo: form.memo.trim(),
    }
    onAdd(newB)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(31,22,18,0.4)',
      display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.surface, borderRadius: 18, padding: 28,
        maxWidth: 520, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 500,
          letterSpacing: '0.06em', color: C.ink, marginBottom: 20,
        }}>新規予約</div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="お客様名"><input value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} style={inputStyle} /></Field>
            <Field label="電話番号"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="担当スタッフ">
              <select value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} style={inputStyle}>
                {allStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="予約経路">
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={inputStyle}>
                <option value="phone">電話</option><option value="web">ウェブ予約</option>
                <option value="walkin">直接来店</option><option value="repeat">リピーター</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="開始 (時)">
              <select value={form.hour} onChange={e => setForm({ ...form, hour: e.target.value })} style={inputStyle}>
                {Array.from({ length: 14 }, (_, i) => i + 8).map(h => <option key={h} value={String(h)}>{h}</option>)}
              </select>
            </Field>
            <Field label="開始 (分)">
              <select value={form.minute} onChange={e => setForm({ ...form, minute: e.target.value })} style={inputStyle}>
                <option value="00">00</option><option value="15">15</option>
                <option value="30">30</option><option value="45">45</option>
              </select>
            </Field>
            <Field label="所要時間 (分)">
              <select value={form.durMin} onChange={e => setForm({ ...form, durMin: parseInt(e.target.value) })} style={inputStyle}>
                {[30, 45, 60, 75, 90, 105, 120, 150, 180].map(m => <option key={m} value={m}>{m}分</option>)}
              </select>
            </Field>
          </div>
          <Field label="メニュー"><input value={form.menu} onChange={e => setForm({ ...form, menu: e.target.value })} style={inputStyle} /></Field>
          <Field label="メモ"><textarea value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} /></Field>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={ghostBtn}>キャンセル</button>
          <button onClick={submit} style={primaryBtn}>仮予約として追加</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 10, letterSpacing: '0.12em', color: C.ink3,
        textTransform: 'uppercase', marginBottom: 4,
      }}>{label}</div>
      {children}
    </div>
  )
}

// === ボタンスタイル ===
const ghostIconBtn: React.CSSProperties = {
  width: 28, height: 28, padding: 0, borderRadius: 6,
  border: `1px solid ${C.line}`, background: C.surface,
  color: C.ink2, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
}
const ghostBtn: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 6,
  border: `1px solid ${C.line}`, background: C.surface,
  color: C.ink2, fontSize: 12, cursor: 'pointer',
  fontFamily: FONT_SANS,
}
const primaryBtn: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 6, border: 'none',
  background: C.ink, color: '#fdf6e8',
  fontSize: 12, fontWeight: 500, cursor: 'pointer',
  fontFamily: FONT_SANS,
}
const selectStyle: React.CSSProperties = {
  padding: '6px 24px 6px 10px', borderRadius: 6,
  border: `1px solid ${C.line}`, background: C.surface,
  fontSize: 11, color: C.ink2, cursor: 'pointer',
  fontFamily: FONT_SANS, appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 16 16' fill='none'><path d='M4 6l4 4 4-4' stroke='%237a7064' stroke-width='1.3' stroke-linecap='round'/></svg>")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 6,
  border: `1px solid ${C.line}`, background: C.surface,
  fontFamily: FONT_SANS, fontSize: 13, color: C.ink, outline: 'none',
}
