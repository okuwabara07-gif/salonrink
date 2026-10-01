'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import DetailPanel from './DetailPanel'
import {
  normalizeTodayResult,
  toRowView,
  OVERDUE_WEEKS,
  REWARD_POINTS,
  type Chip,
  type PassTodayResult,
  type PassTodayRow,
  type RowView,
} from './todayModel'

const C = {
  text: '#1F2A37',
  text2: '#3B4656',
  sub: '#56606E',
  weak: '#7A8494',
  primary: '#2F6FC4',
  primaryGrad: 'linear-gradient(90deg,#3C82D6,#2F6FC4)',
  input: '#F1F5FA',
  line: '#E1E8F0',
  line2: '#DDE5EF',
  line3: '#E3E9F1',
  point: '#E0503A',
  reserve: '#E0803A',
  over: '#9A6200',
  bonus: '#5E9270',
  lineGreen: '#06C755',
  shadowCard: '0 8px 24px rgba(40,70,120,.08)',
  shadowRow: '0 3px 10px rgba(40,70,120,.10)',
}

const REFRESH_MS = 30_000
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
const AVATARS = [
  'linear-gradient(160deg,#C9A791,#8E6A58)',
  'linear-gradient(160deg,#B99482,#7C5646)',
  'linear-gradient(160deg,#D2B3A0,#9A7462)',
]

type FilterKey = 'all' | 'done' | 'res' | 'unlinked' | 'redeem' | 'over'

async function fetchToday(salonId: string, date: string): Promise<PassTodayResult | { error: string }> {
  const { data, error } = await createClient().rpc('pass_today', { p_salon_id: salonId, p_date: date })
  if (error) return { error: error.message }
  return normalizeTodayResult(data)
}

function jstToday(): string {
  const d = new Date(Date.now() + 9 * 3600 * 1000)
  return d.toISOString().slice(0, 10)
}

function shiftDate(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function dateTitle(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`)
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日（${WEEKDAYS[d.getUTCDay()]}）`
}

function hhmm(d: Date): string {
  const j = new Date(d.getTime() + 9 * 3600 * 1000)
  return `${j.getUTCHours()}:${String(j.getUTCMinutes()).padStart(2, '0')}`
}

const PATHS: Record<string, ReactNode> = {
  home: (
    <>
      <path d="M3 10.8 12 3.5l9 7.3" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H9.8v-5.6a2.2 2.2 0 0 1 4.4 0V21h3.3a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  pass: <path d="M12 3.5c3 2.2 5.5 3 8 3v5.2c0 4.3-3.3 7.4-8 8.8-4.7-1.4-8-4.5-8-8.8V6.5c2.5 0 5-.8 8-3z" />,
  cal: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  link: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.3 11 15.7 7M8.3 13l7.4 4" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  line: <path d="M12 4c-5 0-8.5 3.2-8.5 7 0 3.4 2.8 6.1 6.7 6.8L10 21l3.5-3.1c4.2-.4 7-3.2 7-6.9 0-3.8-3.5-7-8.5-7z" />,
  clip: (
    <>
      <rect x="5" y="4.5" width="14" height="17" rx="2.5" />
      <path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 13.5h7M8.5 17h4.5" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11.5" rx="1.5" />
      <path d="M3 9h18M12 9v11.5M12 9C10.5 5.5 7 5 7 7.2 7 9 12 9 12 9zm0 0c1.5-3.5 5-4 5-1.8C17 9 12 9 12 9z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.3 12.2 2.5 2.5 4.9-5" />
    </>
  ),
  chevL: <path d="m14.5 6-6 6 6 6" />,
  chevR: <path d="m9.5 6 6 6-6 6" />,
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 19.5h1.5M19 14h1.5" />
    </>
  ),
}

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  )
}

const NAV: { icon: string; label: string; href: string; active?: boolean; isNew?: boolean }[] = [
  { icon: 'home', label: 'ホーム', href: '/dashboard' },
  { icon: 'pass', label: '本日のPASS', href: '/salon/today', active: true, isNew: true },
  { icon: 'cal', label: '予約', href: '/dashboard/booking' },
  { icon: 'users', label: '顧客', href: '/dashboard/customers' },
  { icon: 'mail', label: 'DM配信', href: '/dashboard/messages' },
  { icon: 'link', label: '連携', href: '/dashboard/integrations' },
  { icon: 'gear', label: '設定', href: '/dashboard/settings' },
]

const STATUS: Record<RowView['status'], { t: string; icon: string; fg: string }> = {
  done: { t: '来店済', icon: 'check', fg: C.primary },
  res: { t: '予約', icon: 'clock', fg: C.reserve },
  over: { t: '来店周期超過', icon: 'clock', fg: C.over },
  cancel: { t: 'キャンセル', icon: 'clock', fg: C.weak },
}

const TONE: Record<RowView['tone'], { bg: string; bd: string; op: number }> = {
  normal: { bg: '#FFFFFF', bd: C.line, op: 1 },
  done: { bg: '#FFFFFF', bd: C.line, op: 0.85 },
  over: { bg: '#FFF8E1', bd: '#F0DC9A', op: 1 },
  sync: { bg: '#F3F5F8', bd: '#DDE3EA', op: 1 },
}

const GRID_CSS = `
.pt-shell{grid-template-columns:250px minmax(0,1fr)}
.pt-grid{grid-template-columns:88px minmax(0,1.5fr) minmax(0,1fr) 60px minmax(0,1.4fr) minmax(0,1.1fr) 104px 112px 80px}
@media (max-width:1439px){
  .pt-shell{grid-template-columns:220px minmax(0,1fr)}
  .pt-grid{grid-template-columns:76px minmax(0,1.5fr) minmax(0,1fr) 50px minmax(0,1.2fr) minmax(0,1.1fr) 92px 104px 64px}
}
`

function Pill({ chip, radius = '6px', lh = '22px', size = '12.5px' }: { chip: Chip; radius?: string; lh?: string; size?: string }) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 700,
        padding: '0 9px',
        lineHeight: lh,
        borderRadius: radius,
        whiteSpace: 'nowrap',
        background: chip.bg,
        color: chip.fg,
      }}
    >
      {chip.t}
    </span>
  )
}

export default function TodayBoard({ salonId, salonName }: { salonId: string; salonName: string }) {
  const [date, setDate] = useState(jstToday)
  const [rows, setRows] = useState<PassTodayRow[] | null>(null)
  const [syncedAt, setSyncedAt] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<{ id: string; qr: boolean } | null>(null)
  const closePanel = useCallback(() => setOpen(null), [])
  const openRow = open ? (rows ?? []).find((r) => r.reservation_id === open.id) ?? null : null

  const changeDate = (next: string) => {
    setRows(null)
    setDate(next)
  }

  useEffect(() => {
    let cancelled = false
    const tick = () =>
      fetchToday(salonId, date).then((res) => {
        if (cancelled) return
        if ('error' in res) {
          setError(res.error)
          return
        }
        setRows(res.rows)
        setSyncedAt(res.syncedAt)
        setFetchedAt(new Date())
        setError(null)
      })
    void tick()
    const id = setInterval(() => void tick(), REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [salonId, date])

  const views = useMemo(() => (rows ?? []).map(toRowView), [rows])

  const counts = useMemo(() => {
    const done = views.filter((v) => v.isDone).length
    return {
      all: views.length,
      done,
      res: views.length - done,
      unlinked: views.filter((v) => v.isUnlinked).length,
      redeem: views.filter((v) => v.isRedeemable).length,
      over: views.filter((v) => v.isOver).length,
      linked: views.filter((v) => v.line).length,
    }
  }, [views])

  const unlinkedNames = views.filter((v) => v.isUnlinked).map((v) => v.name)

  const shown = views.filter((v) => {
    if (query && !v.name.includes(query)) return false
    switch (filter) {
      case 'done':
        return v.isDone
      case 'res':
        return !v.isDone
      case 'unlinked':
        return v.isUnlinked
      case 'redeem':
        return v.isRedeemable
      case 'over':
        return v.isOver
      default:
        return true
    }
  })

  const filters: [FilterKey, string, number][] = [
    ['all', 'すべて', counts.all],
    ['done', '来店済み', counts.done],
    ['res', '予約', counts.res],
    ['unlinked', '未連携', counts.unlinked],
    ['redeem', '交換可', counts.redeem],
    ['over', '来店周期超過', counts.over],
  ]

  const syncLabel = syncedAt
    ? `${hhmm(new Date(syncedAt))} 同期済み`
    : fetchedAt
      ? `${hhmm(fetchedAt)} 取得`
      : '読み込み中'

  return (
    <div
      className="pt-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        background: 'linear-gradient(135deg,#F7FAFE,#EEF4FB)',
        fontFamily: 'var(--sans)',
        fontSize: '14px',
        lineHeight: 1.6,
        color: C.text,
      }}
    >
      <style>{GRID_CSS}</style>

      <aside
        style={{
          padding: '34px 18px 24px',
          background: 'linear-gradient(180deg,#FFFFFF,#F3F7FC)',
          borderRight: `1px solid ${C.line3}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '26px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '40px', fontWeight: 500, lineHeight: 1.1 }}>
            SalonRink
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#2A3544' }}>{salonName}</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '52px',
                padding: '0 14px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 700,
                textDecoration: 'none',
                background: n.active ? C.primaryGrad : 'transparent',
                color: n.active ? '#fff' : C.text,
                boxShadow: n.active ? '0 6px 16px rgba(47,111,196,.3)' : 'none',
              }}
            >
              <span style={{ display: 'flex', flex: 'none' }}>
                <Icon name={n.icon} />
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>{n.label}</span>
              {n.isNew && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#fff',
                    background: '#3C82D6',
                    borderRadius: '999px',
                    padding: '0 7px',
                  }}
                >
                  NEW
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      <main style={{ minWidth: 0, padding: '30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 900, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              本日の来店
            </h1>
            <span style={{ fontSize: '17px', color: C.text2, whiteSpace: 'nowrap' }}>{dateTitle(date)}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(
                [
                  ['chevL', -1, '前の日'],
                  ['chevR', 1, '次の日'],
                ] as const
              ).map(([icon, delta, label]) => (
                <button
                  key={icon}
                  type="button"
                  aria-label={label}
                  onClick={() => changeDate(shiftDate(date, delta))}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: C.input,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.weak,
                    boxShadow: '0 2px 6px rgba(40,70,120,.1)',
                    cursor: 'pointer',
                  }}
                >
                  <Icon name={icon} />
                </button>
              ))}
            </div>
            {date !== jstToday() && (
              <button
                type="button"
                onClick={() => changeDate(jstToday())}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: C.primary,
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                今日に戻る
              </button>
            )}
            <label
              style={{
                marginLeft: 'auto',
                flex: 1,
                maxWidth: '320px',
                minWidth: '150px',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 18px',
                borderRadius: '999px',
                background: C.input,
                color: C.weak,
                boxShadow: '0 2px 8px rgba(40,70,120,.08)',
              }}
            >
              <span style={{ display: 'flex', flex: 'none' }}>
                <Icon name="search" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="お客様名で検索"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13.5px',
                  color: C.text,
                  width: '100%',
                }}
              />
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: C.text2 }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: error ? C.reserve : C.bonus,
              }}
            />
            <b style={{ color: error ? '#A0522D' : '#4F7E60' }}>{syncLabel}</b>
            <span>· 30秒ごとに自動更新</span>
            {error && <span style={{ color: '#A0522D' }}>（取得できませんでした：{error}）</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '16px' }}>
          <Kpi
            icon="users"
            bg="linear-gradient(120deg,#FFF6F6,#FDE6E6)"
            bd="#F8DADA"
            icBg="#FDE3E3"
            icFg="#E0605A"
            label="本日の来店"
            value={counts.all}
            unit="名"
            sub={`来店済み ${counts.done}名　予約 ${counts.res}名`}
          />
          <Kpi
            icon="line"
            bg="linear-gradient(120deg,#F3FBF6,#DDF3E6)"
            bd="#CFEBDA"
            icBg="#D5F1E0"
            icFg="#1FA85A"
            label="LINE会員"
            value={counts.linked}
            unit="名"
            sub={
              counts.unlinked
                ? `未登録 ${counts.unlinked}名（${unlinkedNames.slice(0, 2).join('、')}${counts.unlinked > 2 ? ' ほか' : ''}）`
                : '未登録 0名'
            }
          />
          <Kpi
            icon="clip"
            bg="linear-gradient(120deg,#F5F9FE,#E3EDFA)"
            bd="#D6E3F5"
            icBg="#DCE8F8"
            icFg={C.primary}
            label="今日の注目"
            value={counts.redeem + counts.over + counts.unlinked}
            unit="件"
            list={[
              ['交換可', counts.redeem],
              ['来店周期超過', counts.over],
              ['未連携', counts.unlinked],
            ]}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {filters.map(([key, label, count]) => {
            const on = filter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={on}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  padding: '0 18px',
                  borderRadius: '999px',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: on ? C.primaryGrad : '#FFFFFF',
                  color: on ? '#fff' : C.text,
                  boxShadow: '0 2px 8px rgba(40,70,120,.08)',
                }}
              >
                <span>{label}</span>
                <span
                  style={{
                    minWidth: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    background: on ? '#fff' : '#E8EEF6',
                    color: on ? C.primary : C.text,
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            className="pt-grid"
            style={{
              display: 'grid',
              gap: '10px',
              padding: '0 16px 2px',
              fontSize: '13px',
              fontWeight: 700,
              color: C.text2,
            }}
          >
            <span>時間</span>
            <span>お客様</span>
            <span>本日のメニュー</span>
            <span>前回</span>
            <span>前回の薬剤</span>
            <span>今回のご希望</span>
            <span>ポイント</span>
            <span>ステータス</span>
            <span style={{ textAlign: 'center' }}>操作</span>
          </div>
          {rows === null && !error && <Empty text="読み込み中…" />}
          {rows !== null && shown.length === 0 && <Empty text="該当するご予約はありません" />}
          {shown.map((v, i) => (
            <Row
              key={v.id}
              v={v}
              avatar={AVATARS[i % AVATARS.length]}
              onDetail={() => setOpen({ id: v.id, qr: false })}
              onQr={() => setOpen({ id: v.id, qr: true })}
            />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) repeat(3,minmax(0,1fr))', gap: '14px' }}>
          <div
            style={{
              background: '#fff',
              border: `1px solid ${C.line}`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(40,70,120,.06)',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: '96px',
                alignSelf: 'stretch',
                background: 'linear-gradient(160deg,#E8D5C8,#C9AE9A)',
                flex: 'none',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1, padding: '12px 0' }}>
              <strong style={{ fontSize: '15px', lineHeight: 1.5 }}>
                未連携のお客様へ
                <br />
                LINE会員のご案内
              </strong>
              <span style={{ fontSize: '13px', color: C.text2 }}>QRを表示して簡単にご案内できます</span>
            </div>
            <span style={{ display: 'flex', flex: 'none', paddingRight: '12px' }}>
              <Icon name="qr" />
            </span>
          </div>
          <Foot icon="gift" icBg="#FDEDE4" icFg="#E0703A" label="交換可能なお客様" value={String(counts.redeem)} unit="名" vFg={C.point} sub={`${Math.min(...REWARD_POINTS)}P以上の方`} />
          <Foot
            icon="clock"
            icBg="#FCEBB4"
            icFg={C.over}
            label="来店周期超過のお客様"
            value={String(counts.over)}
            unit="名"
            vFg={C.over}
            sub={`${OVERDUE_WEEKS}週以上経過`}
          />
          {/* TODO(design): 今月の登録率は pass_today が返さないため未表示 */}
          <Foot icon="users" icBg="#FFF1DC" icFg="#C8923A" label="今月の登録率" value="—" unit="" vFg={C.point} sub="目標 90%" />
        </div>
        <span style={{ fontSize: '13px', color: C.text2 }}>
          前回の薬剤は店側のみ表示。お客様のLINEには色名だけが表示されます。
        </span>
      </main>

      {openRow && (
        <DetailPanel
          key={openRow.reservation_id}
          row={openRow}
          salonId={salonId}
          date={date}
          showQr={open?.qr ?? false}
          onClose={closePanel}
        />
      )}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '28px 16px',
        borderRadius: '14px',
        background: '#fff',
        border: `1.5px solid ${C.line}`,
        color: C.sub,
        fontSize: '15px',
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  )
}

function Kpi(props: {
  icon: string
  bg: string
  bd: string
  icBg: string
  icFg: string
  label: string
  value: number
  unit: string
  sub?: string
  list?: [string, number][]
}) {
  return (
    <div
      style={{
        background: props.bg,
        border: `1px solid ${props.bd}`,
        borderRadius: '18px',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        boxShadow: C.shadowCard,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: props.icBg,
          color: props.icFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <Icon name={props.icon} size={28} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 'max-content', flex: '1 0 auto' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap' }}>{props.label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '36px', fontWeight: 900, color: '#1E2B3C', lineHeight: 1.15 }}>{props.value}</span>
          <span style={{ fontSize: '16px', fontWeight: 700 }}>{props.unit}</span>
        </div>
        {props.sub && (
          <span style={{ fontSize: '14px', color: C.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {props.sub}
          </span>
        )}
      </div>
      {props.list && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 1 150px', minWidth: 0 }}>
          {props.list.map(([t, c]) => (
            <div
              key={t}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                background: 'rgba(255,255,255,.75)',
                borderRadius: '8px',
                padding: '3px 12px',
              }}
            >
              <span>{t}</span>
              <b style={{ color: '#2A3544' }}>{c}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Foot(props: {
  icon: string
  icBg: string
  icFg: string
  label: string
  value: string
  unit: string
  vFg: string
  sub: string
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${C.line}`,
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 4px 12px rgba(40,70,120,.06)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: props.icBg,
          color: props.icFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <Icon name={props.icon} size={28} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {props.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
          <span style={{ fontSize: '28px', fontWeight: 900, color: props.vFg, lineHeight: 1.2 }}>{props.value}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: props.vFg }}>{props.unit}</span>
        </div>
        <span style={{ fontSize: '12.5px', color: C.text2 }}>{props.sub}</span>
      </div>
    </div>
  )
}

function Row({
  v,
  avatar,
  onDetail,
  onQr,
}: {
  v: RowView
  avatar: string
  onDetail: () => void
  onQr: () => void
}) {
  const tone = TONE[v.tone]
  const st = STATUS[v.status]
  return (
    <div
      className="pt-grid"
      style={{
        display: 'grid',
        gap: '10px',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: '14px',
        background: tone.bg,
        border: `1.5px solid ${tone.bd}`,
        opacity: tone.op,
        boxShadow: C.shadowRow,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '22px', fontWeight: 700, color: v.status === 'over' ? C.over : C.primary, lineHeight: 1.2 }}>
          {v.time}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 700,
            color: st.fg,
            whiteSpace: 'nowrap',
          }}
        >
          <Icon name={st.icon} size={14} />
          {st.t}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: avatar,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '15px',
          }}
        >
          {v.initial}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '17px', whiteSpace: 'nowrap' }}>{v.name}</strong>
            {v.visits && <span style={{ fontSize: '13px', color: C.text2, whiteSpace: 'nowrap' }}>{v.visits}</span>}
            {v.line && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  color: '#fff',
                  background: C.lineGreen,
                  borderRadius: '999px',
                  padding: '0 7px',
                  lineHeight: '17px',
                }}
              >
                LINE
              </span>
            )}
          </div>
          {v.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {v.tags.map((t) => (
                <Pill key={t.t} chip={t} />
              ))}
            </div>
          )}
        </div>
      </div>

      <span style={{ fontSize: '15px', lineHeight: 1.5, fontWeight: 500, color: v.menuGray ? '#6E625A' : C.text }}>
        {v.menu}
      </span>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1.45,
          borderLeft: `1px solid ${C.line}`,
          borderRight: `1px solid ${C.line}`,
        }}
      >
        <span style={{ fontSize: '15px' }}>{v.prev}</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: v.weeksOver ? C.over : C.text }}>{v.weeks}</span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 500,
          lineHeight: 1.5,
          color: v.chemEmpty ? C.sub : C.text,
          minWidth: 0,
        }}
      >
        {v.chem.map((c, i) => (
          <span key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
        <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.5 }}>{v.wish}</span>
        {v.wishSub && <span style={{ fontSize: '13.5px', color: C.text2, lineHeight: 1.5 }}>{v.wishSub}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: '16px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            color: v.ptsTone === 'point' ? C.point : v.ptsTone === 'muted' ? '#6E625A' : C.text2,
          }}
        >
          {v.pts}
        </span>
        {v.given && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#E0703A' }}>
            <Icon name="gift" size={14} />
            付与済
          </span>
        )}
        {v.ptags.map((p) => (
          <Pill key={p.t} chip={p} radius="999px" lh="24px" size="13px" />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {v.gift && (
          <span style={{ display: 'flex', color: '#E0903A' }}>
            <Icon name="gift" />
          </span>
        )}
        {v.chip && <Pill chip={v.chip} radius="999px" lh="28px" size="13px" />}
        {v.qr && (
          <button
            type="button"
            onClick={onQr}
            style={{
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(180deg,#4A90E2,#2F6FC4)',
              borderRadius: '12px',
              padding: '0 12px',
              minHeight: '44px',
              border: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 10px rgba(47,111,196,.3)',
            }}
          >
            登録QRを表示
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onDetail}
        style={{
          cursor: 'pointer',
          minHeight: '44px',
          borderRadius: '12px',
          background: '#fff',
          border: `1px solid ${C.line2}`,
          fontSize: '14px',
          fontWeight: 700,
          color: C.text,
          boxShadow: '0 3px 8px rgba(40,70,120,.08)',
        }}
      >
        詳細
      </button>
    </div>
  )
}
