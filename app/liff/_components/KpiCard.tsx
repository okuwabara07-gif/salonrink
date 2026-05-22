'use client'

/**
 * app/liff/_components/KpiCard.tsx
 *
 * KPI カードコンポーネント
 * - 数値表示
 * - 前月比トレンド（矢印 + パーセンテージ）
 */

import type { ReactNode } from 'react'
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react'

interface KpiCardProps {
  label: string
  value: ReactNode
  previous?: number
  trend?: 'up' | 'down' | 'flat'
  unit: string
}

export function KpiCard({ label, value, previous, trend }: KpiCardProps) {
  const calculateChange = (): { percentage: number; color: string } | null => {
    if (previous === undefined || trend === 'flat') return null

    const current = typeof value === 'string' ? parseFloat(value.replace(/[^\d.]/g, '')) : 0
    if (previous === 0) return null

    const percentage = Math.round(((current - previous) / previous) * 100)
    const color = trend === 'up' ? 'text-accent' : 'text-danger'

    return { percentage, color }
  }

  const change = calculateChange()

  return (
    <div className="p-4 bg-card border border-line-soft rounded-lg">
      <p className="text-xs text-ink-3 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-serif font-medium text-ink leading-tight">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 ${change.color}`}>
            {trend === 'up' && <IconTrendingUp size={16} stroke={2} />}
            {trend === 'down' && <IconTrendingDown size={16} stroke={2} />}
            <span className="text-sm font-mono font-medium">{change.percentage > 0 ? '+' : ''}{change.percentage}%</span>
          </div>
        )}
        {trend === 'flat' && (
          <div className="text-ink-3">
            <IconMinus size={16} stroke={2} />
          </div>
        )}
      </div>
      {previous !== undefined && previous > 0 && (
        <p className="text-xs text-ink-4 mt-2 leading-tight">
          前月: ¥{previous.toLocaleString()}
        </p>
      )}
    </div>
  )
}
