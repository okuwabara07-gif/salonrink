'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// 時間軸定数
const TIME_START_MIN = 10 * 60 // 10:00
const TIME_END_MIN = 20 * 60   // 20:00
const TOTAL_MIN = TIME_END_MIN - TIME_START_MIN
const HOUR_WIDTH_PX = 160
const STAFF_COL_WIDTH_PX = 196
const ROW_HEIGHT_PX = 76

// デザイントークン
const COLORS = {
  bg: '#f4ede1',
  bgTint: '#efe6d4',
  surface: '#fefcf7',
  surface2: '#f9f3e7',
  line: '#e2d6bd',
  lineSoft: '#ece2cb',
  ink: '#1f1612',
  ink2: '#4a4239',
  ink3: '#7a7064',
  ink4: '#aaa094',
  accent: '#5a6b3f',
  accentInk: '#3a4628',
  accentSoft: '#eaeed8',
  danger: '#a85555',
  warn: '#b08840',
  info: '#4a6b80',
}

const STATUS_STYLE: Record<string, { ja: string; color: string; bg: string; border: string }> = {
  confirmed:  { ja: '確定',   color: '#5a7a52', bg: '#eaf1e1', border: '#bcc9a8' },
  tentative:  { ja: '仮予約', color: '#a08036', bg: '#f6efde', border: '#d9c89a' },
  inprogress: { ja: '来店中', color: '#4a6b80', bg: '#e3ecf3', border: '#a8c2d2' },
  done:       { ja: '完了',   color: '#6b6357', bg: '#eee9df', border: '#cabfaa' },
  canceled:   { ja: '見送り', color: '#a85555', bg: '#f3e3e3', border: '#d9aeae' },
}

const SOURCE_STYLE: Record<string, { ja: string; short: string; color: string }> = {
  web:       { ja: 'ウェブ予約',     short: 'WEB', color: '#5a7a8f' },
  phone:     { ja: '電話',           short: 'TEL', color: '#8a6e4d' },
  walkin:    { ja: '直接来店',       short: '店頭', color: '#7a8f5a' },
  repeat:    { ja: 'リピーター',     short: 'RPT', color: '#a3727f' },
  hpb:       { ja: 'HotPepper',      short: 'HPB', color: '#c84a4a' },
  hotpepper: { ja: 'HotPepper',      short: 'HPB', color: '#c84a4a' },
  line:      { ja: 'LINE',           short: 'LINE',color: '#06c755' },
  manual:    { ja: '手動',           short: '手動', color: '#7a7064' },
}

// スタッフカラーパレット(staff_idのhashで決定)
const STAFF_COLORS = ['#7a8f5a', '#a6794d', '#6e7fa3', '#a3727f', '#9a9285', '#8a7a5a']

function hashStaffColor(staffId: string): string {
  let sum = 0
  for (let i = 0; i < staffId.length; i++) sum += staffId.charCodeAt(i)
  return STAFF_COLORS[sum % STAFF_COLORS.length]
}

function initials(name: string): string {
  if (!name) return '—'
  const trimmed = name.trim()
  if (trimmed.length === 0) return '—'
  return trimmed.slice(0, 2)
}

function fmtTimeFromMin(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function dateToMinutesFromMidnight(isoStr: string): number {
  const d = new Date(isoStr)
  return d.getHours() * 60 + d.getMinutes()
}

function fmtTimeFromIso(isoStr: string): string {
  const d = new Date(isoStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface Booking {
  id: string
  staffId: string
  staffName: string
  startMin: number
  endMin: number
  customerName: string
  menu: string
  status: string
  source: string
  startIso: string
  endIso: string
  rawData?: any
}

interface StaffInfo {
  id: string
  name: string
  count: number
  totalMin: number
}

export default function BookingPage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [nowMin, setNowMin] = useState<number>(() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  })

  // 現在時刻を1分ごとに更新
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setNowMin(n.getHours() * 60 + n.getMinutes())
    }
    const id = setInterval(tick, 60000)
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
      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle()
      if (!salon) {
        setLoading(false)
        return
      }
      setSalonId(salon.id)
      await fetchBookings(salon.id)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchBookings(id: string) {
    setLoading(true)
    const supabase = await createClient()
    const today = new Date()
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0)

    let hpbData: any[] = []
    try {
      const r = await supabase
        .from('hpb_reservations')
        .select('*')
        .eq('salon_id', id)
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
        .eq('salon_id', id)
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
      const startMin = dateToMinutesFromMidnight(r.start_time)
      const endMin = r.end_time ? dateToMinutesFromMidnight(r.end_time) : startMin + 60
      const staffId = (r.raw_data && r.raw_data.staff_id) || 'unknown'
      all.push({
        id: 'hpb_' + r.id,
        staffId,
        staffName: staffId === 'unknown' ? '未割当' : `スタッフ ${staffId.slice(-4)}`,
        startMin,
        endMin,
        customerName: r.customer_name || 'ゲスト',
        menu: r.menu_name || '(メニュー未取得)',
        status: r.status || 'confirmed',
        source: 'hpb',
        startIso: r.start_time,
        endIso: r.end_time || r.start_time,
        rawData: r.raw_data,
      })
    }

    for (const r of resvData) {
      if (!r.datetime) continue
      const startMin = dateToMinutesFromMidnight(r.datetime)
      const endMin = startMin + 60
      all.push({
        id: 'resv_' + r.id,
        staffId: r.staff_id || 'unknown',
        staffName: '未割当',
        startMin,
        endMin,
        customerName: r.customer_name || 'ゲスト',
        menu: r.menu || '',
        status: r.status || 'confirmed',
        source: r.source || 'manual',
        startIso: r.datetime,
        endIso: r.datetime,
      })
    }

    setBookings(all.sort((a, b) => a.startMin - b.startMin))
    setLoading(false)
  }

  // スタッフ集計
  const staffList = useMemo<StaffInfo[]>(() => {
    const map = new Map<string, StaffInfo>()
    for (const b of bookings) {
      if (!map.has(b.staffId)) {
        map.set(b.staffId, { id: b.staffId, name: b.staffName, count: 0, totalMin: 0 })
      }
      const s = map.get(b.staffId)!
      s.count += 1
      s.totalMin += (b.endMin - b.startMin)
    }
    // スタッフがいない場合のフォールバック
    if (map.size === 0) {
      map.set('unknown', { id: 'unknown', name: 'スタッフ未割当', count: 0, totalMin: 0 })
    }
    return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id))
  }, [bookings])

  // 時間軸の hour 配列
  const hours = useMemo(() => {
    const arr: number[] = []
    for (let t = TIME_START_MIN; t < TIME_END_MIN; t += 60) arr.push(t)
    return arr
  }, [])

  const selectedBooking = bookings.find(b => b.id === selectedId)
  const nowInRange = nowMin >= TIME_START_MIN && nowMin <= TIME_END_MIN
  const nowLeftPx = ((nowMin - TIME_START_MIN) / 60) * HOUR_WIDTH_PX

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: COLORS.ink3 }}>
        読み込み中...
      </div>
    )
  }

  return (
    <main style={{
      background: COLORS.bg,
      minHeight: '100vh',
      fontFamily: '"Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif',
      color: COLORS.ink,
      fontFeatureSettings: '"palt"',
    }}>
      {/* コントロールバー */}
      <div style={{
        padding: '20px 28px 16px',
        borderBottom: `1px solid ${COLORS.lineSoft}`,
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.16em', color: COLORS.ink3, textTransform: 'uppercase', marginBottom: 4 }}>
          RESERVATIONS
        </div>
        <h1 style={{
          fontFamily: '"Noto Serif JP", serif',
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: '0.06em',
          color: COLORS.ink,
          margin: 0,
        }}>
          予約管理
        </h1>
        <div style={{ fontSize: 12, color: COLORS.ink3, marginTop: 6 }}>
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedBooking ? '1fr 380px' : '1fr',
        gap: 0,
        transition: 'grid-template-columns 0.2s ease',
      }}>
        {/* タイムライン */}
        <div style={{ padding: '20px 28px' }}>
          <div style={{
            background: COLORS.surface,
            borderRadius: 18,
            border: `1px solid ${COLORS.lineSoft}`,
            boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 6px 22px -10px rgba(60,40,20,.10)',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: STAFF_COL_WIDTH_PX + hours.length * HOUR_WIDTH_PX }}>
                {/* ヘッダー行: 時間軸 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `${STAFF_COL_WIDTH_PX}px 1fr`,
                  borderBottom: `1px solid ${COLORS.line}`,
                  background: COLORS.surface2,
                }}>
                  <div style={{
                    padding: '12px 16px',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    color: COLORS.ink3,
                    textTransform: 'uppercase',
                    borderRight: `1px solid ${COLORS.line}`,
                  }}>
                    時間
                  </div>
                  <div style={{ display: 'flex' }}>
                    {hours.map(h => (
                      <div key={h} style={{
                        width: HOUR_WIDTH_PX,
                        padding: '10px 12px',
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 12,
                        fontWeight: 500,
                        color: COLORS.ink2,
                        borderRight: `1px solid ${COLORS.lineSoft}`,
                      }}>
                        {fmtTimeFromMin(h)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* スタッフ行 */}
                {staffList.map(staff => {
                  const rowBookings = bookings.filter(b => b.staffId === staff.id)
                  return (
                    <div key={staff.id} style={{
                      display: 'grid',
                      gridTemplateColumns: `${STAFF_COL_WIDTH_PX}px 1fr`,
                      borderBottom: `1px solid ${COLORS.lineSoft}`,
                      minHeight: ROW_HEIGHT_PX,
                    }}>
                      {/* スタッフ列 */}
                      <div style={{
                        padding: '12px 16px',
                        borderRight: `1px solid ${COLORS.line}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: COLORS.surface,
                      }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 999,
                          background: hashStaffColor(staff.id),
                          color: '#fdf6e8',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: '"Noto Serif JP", serif',
                          flexShrink: 0,
                        }}>
                          {initials(staff.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: '"Noto Serif JP", serif',
                            fontSize: 13,
                            fontWeight: 500,
                            letterSpacing: '0.04em',
                            color: COLORS.ink,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {staff.name}
                          </div>
                          <div style={{
                            fontSize: 10,
                            color: COLORS.ink3,
                            fontFamily: '"JetBrains Mono", monospace',
                            marginTop: 2,
                          }}>
                            {staff.count}件 / {(staff.totalMin / 60).toFixed(1)}h
                          </div>
                        </div>
                      </div>
                      {/* 予約カード配置エリア */}
                      <div style={{
                        position: 'relative',
                        background: `repeating-linear-gradient(to right, transparent 0 ${HOUR_WIDTH_PX - 1}px, ${COLORS.lineSoft} ${HOUR_WIDTH_PX - 1}px ${HOUR_WIDTH_PX}px), repeating-linear-gradient(to right, transparent 0 ${HOUR_WIDTH_PX / 2 - 1}px, ${COLORS.lineSoft}66 ${HOUR_WIDTH_PX / 2 - 1}px ${HOUR_WIDTH_PX / 2}px)`,
                        backgroundSize: `${HOUR_WIDTH_PX}px 100%, ${HOUR_WIDTH_PX / 2}px 100%`,
                        minHeight: ROW_HEIGHT_PX,
                      }}>
                        {rowBookings.map(b => {
                          const leftPct = ((b.startMin - TIME_START_MIN) / TOTAL_MIN) * 100
                          const widthPct = ((b.endMin - b.startMin) / TOTAL_MIN) * 100
                          const st = STATUS_STYLE[b.status] || STATUS_STYLE.confirmed
                          const src = SOURCE_STYLE[b.source] || SOURCE_STYLE.manual
                          const isShort = (b.endMin - b.startMin) < 60
                          const isSelected = selectedId === b.id
                          return (
                            <div
                              key={b.id}
                              onClick={() => setSelectedId(isSelected ? null : b.id)}
                              style={{
                                position: 'absolute',
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                top: 6,
                                bottom: 6,
                                background: COLORS.surface,
                                borderRadius: 6,
                                border: `1px solid ${COLORS.line}`,
                                borderLeft: `3px solid ${st.color}`,
                                outline: isSelected ? `2px solid ${COLORS.ink}` : 'none',
                                outlineOffset: -2,
                                padding: '6px 8px',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                                boxShadow: '0 1px 2px rgba(60,40,20,.04)',
                                opacity: b.status === 'canceled' ? 0.5 : 1,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(60,40,20,.10)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,40,20,.04)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <span style={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: 10,
                                  fontWeight: 500,
                                  color: COLORS.ink2,
                                }}>
                                  {fmtTimeFromMin(b.startMin)}–{fmtTimeFromMin(b.endMin)}
                                </span>
                                <span style={{
                                  fontSize: 9,
                                  padding: '1px 6px',
                                  borderRadius: 3,
                                  background: st.bg,
                                  color: st.color,
                                  border: `1px solid ${st.border}`,
                                  flexShrink: 0,
                                }}>
                                  {st.ja}
                                </span>
                              </div>
                              <div style={{
                                fontFamily: '"Noto Serif JP", serif',
                                fontSize: 13,
                                fontWeight: 500,
                                color: COLORS.ink,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginBottom: 2,
                              }}>
                                {b.customerName} <span style={{ fontSize: 10, color: COLORS.ink3 }}>様</span>
                              </div>
                              {!isShort && (
                                <>
                                  <div style={{
                                    fontSize: 10,
                                    color: COLORS.ink3,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    marginBottom: 4,
                                  }}>
                                    {b.menu}
                                  </div>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    <span style={{
                                      fontSize: 9,
                                      padding: '1px 5px',
                                      borderRadius: 3,
                                      background: '#fff',
                                      color: src.color,
                                      border: `1px solid ${src.color}`,
                                      fontFamily: '"JetBrains Mono", monospace',
                                      fontWeight: 500,
                                    }}>
                                      {src.short}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        })}
                        {/* 現在時刻ライン */}
                        {nowInRange && (
                          <div style={{
                            position: 'absolute',
                            left: nowLeftPx,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: COLORS.danger,
                            pointerEvents: 'none',
                            zIndex: 10,
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: -8,
                              left: -4,
                              width: 9,
                              height: 9,
                              background: COLORS.danger,
                              borderRadius: 999,
                            }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {bookings.length === 0 && (
                  <div style={{
                    padding: 60,
                    textAlign: 'center',
                    color: COLORS.ink3,
                    fontSize: 13,
                  }}>
                    本日の予約はありません
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 詳細パネル */}
        {selectedBooking && (() => {
          const st = STATUS_STYLE[selectedBooking.status] || STATUS_STYLE.confirmed
          const src = SOURCE_STYLE[selectedBooking.source] || SOURCE_STYLE.manual
          return (
            <aside style={{
              background: COLORS.surface,
              borderLeft: `1px solid ${COLORS.lineSoft}`,
              padding: '20px 24px',
              minHeight: '100vh',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{
                  fontFamily: '"Noto Serif JP", serif',
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  color: COLORS.ink,
                }}>
                  予約詳細
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="閉じる"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 6,
                    color: COLORS.ink3,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* 顧客カード */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 0',
                borderBottom: `1px solid ${COLORS.lineSoft}`,
                marginBottom: 16,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: hashStaffColor(selectedBooking.staffId),
                  color: '#fdf6e8',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 16,
                  fontFamily: '"Noto Serif JP", serif',
                  fontWeight: 500,
                  flexShrink: 0,
                }}>
                  {selectedBooking.customerName.charAt(0)}
                </div>
                <div>
                  <div style={{
                    fontFamily: '"Noto Serif JP", serif',
                    fontSize: 16,
                    fontWeight: 500,
                    color: COLORS.ink,
                  }}>
                    {selectedBooking.customerName} <span style={{ fontSize: 12, color: COLORS.ink3 }}>様</span>
                  </div>
                </div>
              </div>

              {/* フィールド行 */}
              {[
                { label: 'ステータス', value: (
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 4,
                    background: st.bg,
                    color: st.color,
                    border: `1px solid ${st.border}`,
                    fontSize: 11,
                  }}>{st.ja}</span>
                )},
                { label: '時間', value: (
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                    {fmtTimeFromMin(selectedBooking.startMin)} – {fmtTimeFromMin(selectedBooking.endMin)}
                    <span style={{ color: COLORS.ink3, marginLeft: 8, fontSize: 11 }}>
                      ({selectedBooking.endMin - selectedBooking.startMin}分)
                    </span>
                  </span>
                )},
                { label: '担当', value: <span>{selectedBooking.staffName}</span> },
                { label: 'メニュー', value: <span style={{ fontSize: 12 }}>{selectedBooking.menu}</span> },
                { label: '予約経路', value: (
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: 3,
                    background: '#fff',
                    color: src.color,
                    border: `1px solid ${src.color}`,
                    fontSize: 10,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}>{src.short} {src.ja}</span>
                )},
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '86px 1fr',
                  padding: '12px 0',
                  borderBottom: i < 4 ? `1px dotted ${COLORS.lineSoft}` : 'none',
                  alignItems: 'start',
                }}>
                  <div style={{
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    color: COLORS.ink3,
                    textTransform: 'uppercase',
                    paddingTop: 2,
                  }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.ink }}>
                    {row.value}
                  </div>
                </div>
              ))}
            </aside>
          )
        })()}
      </div>
    </main>
  )
}
