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
import { KpiCard } from './KpiCard'
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

interface BookingToday {
  id: string
  time: string
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

      {/* KPI カード */}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            label="月間売上"
            value={`¥${kpi.revenue.current.toLocaleString()}`}
            previous={kpi.revenue.previousMonth}
            trend={kpi.revenue.trend}
            unit="¥"
          />
          <KpiCard
            label="新規予約"
            value={`${kpi.newBookings.current}`}
            previous={kpi.newBookings.previousMonth}
            trend={kpi.newBookings.trend}
            unit="件"
          />
          <KpiCard
            label="リピート率"
            value={`${kpi.repeatRate.current.toFixed(1)}%`}
            trend="flat"
            unit="%"
          />
        </div>
      ) : null}

      {/* 今日の予約セクション */}
      <div>
        <h2 className="text-lg font-serif font-medium text-ink mb-4">今日の予約</h2>
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
          <div className="space-y-3">
            {bookings.map((booking) => {
              const sourceStyles = {
                hpb: 'bg-blue-100 text-blue-800',
                line: 'bg-green-100 text-green-800',
                manual: 'bg-gray-100 text-gray-800',
              }
              const sourceLabel = {
                hpb: 'HPB',
                line: 'LINE',
                manual: '手動',
              }
              const sourceStyle = sourceStyles[booking.source as keyof typeof sourceStyles] || 'bg-gray-100 text-gray-800'
              const label = sourceLabel[booking.source as keyof typeof sourceLabel] || booking.source

              return (
                <div
                  key={booking.id}
                  className="bg-card border border-line rounded-lg p-4 flex items-start gap-4"
                >
                  <div className="flex-1">
                    <div className="text-lg font-mono font-semibold text-ink mb-1">
                      {booking.time}
                    </div>
                    <div className="text-sm text-ink mb-1">
                      {booking.customer_name}
                    </div>
                    <div className="text-sm text-ink-3 mb-2">
                      {booking.menu_name || 'メニュー未確定'}
                    </div>
                    {booking.price !== null && (
                      <div className="text-sm font-mono text-ink-2">
                        ¥{booking.price.toLocaleString()}
                      </div>
                    )}
                    {booking.price === null && booking.menu_name && (
                      <div className="text-sm text-ink-3">---</div>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-500 whitespace-nowrap ${sourceStyle}`}>
                    {label}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ボトムナビ */}
      <BottomNav />
      </div>
    </div>
  )
}
