'use client'

/**
 * app/liff/_components/DashboardClient.tsx
 *
 * LIFF ダッシュボード本体
 * - KPI 3カード（月間売上 + 新規予約 + リピート率）
 * - 「今日の予約」セクション
 * - BottomNav 表示
 */

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { BottomNav } from './BottomNav'
import { KpiCardV2 } from './KpiCardV2'
import { UnmatchedCard } from './UnmatchedCard'
import { SectionLabel } from './SectionLabel'
import { Timeline } from './Timeline'
import { BookingRow } from './BookingRow'
import { PendingKarteSection } from './PendingKarteSection'
import type { KarteListItem } from './PendingKarteSection'
import type { ApiResponse } from '@/lib/menus/schema'
import type { KpiTrend } from '@/lib/kpi'

interface KpiData {
  revenue: KpiTrend
  newBookings: KpiTrend
  repeatRate: {
    current: number
    unit: string
  }
  salon: {
    name: string
  }
  user: {
    name: string
    initial: string
  }
}

export interface BookingToday {
  id: string
  time: string
  start_time: string
  end_time: string
  customer_name: string
  menu_name: string | null
  price: number | null
  source: string
}

interface DashboardClientProps {
  user: User
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingToday[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [unmatchedCount, setUnmatchedCount] = useState(0)
  const [pendingKartes, setPendingKartes] = useState<KarteListItem[]>([])
  const [approvedCount, setApprovedCount] = useState(0)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [approvingAll, setApprovingAll] = useState(false)
  const [kartesLoading, setKartesLoading] = useState(false)
  const [kartesError, setKartesError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        setBookingsLoading(true)
        setBookingsError(null)

        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        // Fetch KPI
        const kpiResponse = await fetch(`/api/kpi?year=${year}&month=${month}`)
        const kpiResult: ApiResponse<KpiData> = await kpiResponse.json()

        if (!kpiResponse.ok || kpiResult.error) {
          throw new Error(kpiResult.error || 'Failed to fetch KPI')
        }

        if (kpiResult.data) {
          setKpi(kpiResult.data)
        }

        // Fetch today's bookings
        const bookingsResponse = await fetch('/api/bookings/today')
        const bookingsJson: ApiResponse<BookingToday[]> = await bookingsResponse.json()

        if (!bookingsResponse.ok || bookingsJson.error) {
          setBookingsError(bookingsJson.error || '予約データの取得に失敗しました')
        } else if (bookingsJson.data) {
          setBookings(bookingsJson.data)
        }

        // Fetch unmatched count
        const unmatchedResponse = await fetch('/api/menus/unmatched-count')
        const unmatchedJson: ApiResponse<{ count: number }> = await unmatchedResponse.json()

        if (unmatchedResponse.ok && unmatchedJson.data) {
          setUnmatchedCount(unmatchedJson.data.count)
        }

        // Fetch pending kartes
        setKartesLoading(true)
        try {
          const kartesResponse = await fetch('/api/dashboard/kartes/pending')
          const kartesJson: ApiResponse<KarteListItem[]> = await kartesResponse.json()

          if (!kartesResponse.ok) {
            setKartesError(kartesJson.error || 'カルテデータの取得に失敗しました')
          } else if (kartesJson.data) {
            setPendingKartes(kartesJson.data)
          }
        } catch (err) {
          console.error('[DashboardClient] kartes fetch error:', err)
          setKartesError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
          setKartesLoading(false)
        }
      } catch (err) {
        console.error('[DashboardClient] fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
        setBookingsLoading(false)
      }
    }

    fetchData()
  }, [user.id])

  const handleApprove = async (id: string) => {
    setApprovingId(id)
    try {
      const response = await fetch(`/api/dashboard/kartes/${id}/approve`, {
        method: 'PATCH',
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Failed to approve')
      }
      setPendingKartes((prev) => prev.filter((k) => k.id !== id))
      setApprovedCount((prev) => prev + 1)
    } catch (err) {
      console.error('[DashboardClient] approve error:', err)
      alert(err instanceof Error ? err.message : '承認に失敗しました')
    } finally {
      setApprovingId(null)
    }
  }

  const handleApproveAll = async () => {
    if (pendingKartes.length === 0) return
    if (!confirm(`${pendingKartes.length}件のカルテをすべて承認しますか?`)) return

    setApprovingAll(true)
    try {
      const response = await fetch('/api/dashboard/kartes/approve-all', {
        method: 'POST',
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Failed to approve all')
      }
      const count = json.data?.approved_count ?? pendingKartes.length
      setApprovedCount((prev) => prev + count)
      setPendingKartes([])
    } catch (err) {
      console.error('[DashboardClient] approve-all error:', err)
      alert(err instanceof Error ? err.message : '一括承認に失敗しました')
    } finally {
      setApprovingAll(false)
    }
  }

  const handleEdit = (id: string) => {
    alert('カルテ編集機能は今後実装予定です(カルテ ID: ' + id + ')')
  }

  // ヘッダー用データを生成
  const salonName = kpi?.salon.name || 'サロン'
  const userName = kpi?.user.name || 'オーナー'
  const userInitial = kpi?.user.initial || '?'

  // 日付フォーマット: YYYY.MM.DD · 曜日
  const now = new Date()
  const jstDate = now.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
  const dayOfWeek = now.toLocaleDateString('ja-JP', {
    weekday: 'long',
    timeZone: 'Asia/Tokyo'
  })
  const dateLabel = `${jstDate} · ${dayOfWeek}`

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <header className="bg-cream px-4 pt-4 pb-3 border-b border-border-soft">
        {/* 上段: サロン名 + アバター */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="font-serif text-[19px] font-medium text-ink" style={{ letterSpacing: '0.4px' }}>
              {salonName}
            </h1>
            <p className="text-[11px] text-muted mt-px">
              ようこそ、{userName}さん
            </p>
          </div>
          <div className="w-[38px] h-[38px] rounded-full bg-bg-alt border border-border-primary flex items-center justify-center font-serif text-[14px] text-ink">
            {userInitial}
          </div>
        </div>

        {/* 下段: 日付バッジ */}
        <div className="mt-1.5 text-[10.5px] text-faint font-mono uppercase" style={{ letterSpacing: '0.4px' }}>
          {dateLabel}
        </div>
      </header>

      {/* コンテンツエリア */}
      <div className="space-y-6 px-4 py-6">

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      {/* KPI セクション */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-accent border-t-accent-soft rounded-full" />
            </div>
            <p className="mt-4 text-sm text-ink-3">読み込み中...</p>
          </div>
        </div>
      ) : kpi ? (
        <div className="px-3 pb-4">
          <SectionLabel trailing="過去 7日">今月のサマリー</SectionLabel>

          <div className="grid grid-cols-2 gap-2">
            <KpiCardV2
              label="売上"
              value={formatRevenue(kpi.revenue.current)}
              series={kpi.revenue.series || []}
              trend={formatTrend(kpi.revenue.current, kpi.revenue.previousMonth)}
              trendUp={kpi.revenue.trend === 'up'}
              sub={`前月 ${formatRevenue(kpi.revenue.previousMonth)}`}
              primary
            />
            <KpiCardV2
              label="新規"
              value={`${kpi.newBookings.current}件`}
              series={kpi.newBookings.series || []}
              trend={formatTrendNumber(kpi.newBookings.current, kpi.newBookings.previousMonth)}
              trendUp={kpi.newBookings.trend === 'up'}
              sub={`前月 ${kpi.newBookings.previousMonth}件`}
            />
            <KpiCardV2
              label="リピート率"
              value={`${kpi.repeatRate.current}${kpi.repeatRate.unit}`}
              series={[]}
              trend="—"
              trendUp={false}
              sub="90日平均"
            />
            <UnmatchedCard count={unmatchedCount} />
          </div>
        </div>
      ) : null}

      {/* 今日の予約セクション */}
      <div>
        <SectionLabel trailing={`${bookings.length}件`}>今日の予約</SectionLabel>
        {bookingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <div className="w-6 h-6 border-3 border-accent border-t-accent-soft rounded-full" />
              </div>
              <p className="mt-2 text-sm text-ink-3">読み込み中...</p>
            </div>
          </div>
        ) : bookingsError ? (
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
            {bookingsError}
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-ink-3 text-center py-8">本日の予約はありません</p>
        ) : (
          <div>
            <Timeline bookings={bookings} />
            <div className="bg-surface border border-border-primary rounded-xl overflow-hidden">
              {bookings.map((booking, i) => (
                <BookingRow key={booking.id} booking={booking} isLast={i === bookings.length - 1} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 承認待ちカルテセクション */}
      {kartesError && (
        <div className="px-3">
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
            {kartesError}
          </div>
        </div>
      )}
      {!kartesError && (
        <PendingKarteSection
          kartes={pendingKartes}
          approvedCount={approvedCount}
          onApprove={handleApprove}
          onApproveAll={handleApproveAll}
          onEdit={handleEdit}
          approvingId={approvingId}
          approvingAll={approvingAll}
        />
      )}

      {/* ボトムナビ */}
      <BottomNav />
      </div>
    </div>
  )
}

function formatRevenue(amount: number): string {
  if (amount >= 1000000) {
    return `¥${(amount / 1000000).toFixed(2)}M`
  }
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`
  }
  return `¥${amount.toLocaleString()}`
}

function formatTrend(current: number, previous: number): string {
  if (previous === 0) return '—'
  const pct = ((current - previous) / previous) * 100
  const arrow = pct >= 0 ? '↑' : '↓'
  return `${arrow} ${Math.abs(pct).toFixed(1)}%`
}

function formatTrendNumber(current: number, previous: number): string {
  const diff = current - previous
  const arrow = diff >= 0 ? '↑' : '↓'
  return `${arrow} ${Math.abs(diff)}`
}
