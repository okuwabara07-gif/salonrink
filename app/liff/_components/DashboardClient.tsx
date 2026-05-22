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
}

interface DashboardClientProps {
  user: User
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKpi = async () => {
      try {
        setLoading(true)
        setError(null)

        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        const response = await fetch(`/api/kpi?year=${year}&month=${month}`)
        const result: ApiResponse<KpiData> = await response.json()

        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to fetch KPI')
        }

        if (result.data) {
          setKpi(result.data)
        }
      } catch (err) {
        console.error('[DashboardClient] fetch KPI error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchKpi()
  }, [user.id])

  return (
    <div className="space-y-6 px-4 py-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-serif font-medium text-ink">ダッシュボード</h1>
        <p className="text-sm text-ink-3 mt-1">
          {new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

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
        <p className="text-sm text-ink-3">Coming soon...</p>
      </div>

      {/* ボトムナビ */}
      <BottomNav />
    </div>
  )
}
