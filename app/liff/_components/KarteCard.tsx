'use client'

import React from 'react'

interface KarteCardProps {
  karte: {
    id: string
    customer_name: string
    visit_date: string
    created_at: string
    ai_summary: Record<string, unknown> | null
  }
  onApprove: (id: string) => void
  onEdit: (id: string) => void
  loading?: boolean
}

function formatVisitDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00+09:00')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}/${day}`
}

function extractSummaryText(summary: Record<string, unknown> | null): string {
  if (!summary) return 'AI サマリーはまだ生成されていません'

  const keys = ['summary', 'hair_condition', 'main_points', 'description']
  for (const key of keys) {
    const val = summary[key]
    if (typeof val === 'string' && val.length > 0) return val
  }

  const firstString = Object.values(summary).find(
    (v) => typeof v === 'string' && (v as string).length > 0
  )
  return (
    (firstString as string) || JSON.stringify(summary).slice(0, 100)
  )
}

export function KarteCard({
  karte,
  onApprove,
  onEdit,
  loading = false,
}: KarteCardProps) {
  const summaryText = extractSummaryText(karte.ai_summary)

  return (
    <div
      className="bg-surface border border-border-primary rounded-xl px-3 py-3 mb-2"
      style={{ borderLeft: '3px solid #D85A30' }}
    >
      {/* ヘッダー: 顧客名 + 訪問日 */}
      <div className="flex items-start justify-between mb-2">
        <div className="text-[13px] font-semibold text-ink">
          {karte.customer_name}
        </div>
        <div className="font-mono text-[10px] text-faint">
          {formatVisitDate(karte.visit_date)} 来店
        </div>
      </div>

      {/* AI サマリ */}
      <p className="text-[11.5px] text-muted leading-[1.5] mb-3 line-clamp-3">
        {summaryText}
      </p>

      {/* ボタン横並び */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onApprove(karte.id)}
          disabled={loading}
          className="flex-1 bg-green text-white text-[12px] font-semibold rounded-md px-2.5 py-1.5 disabled:opacity-50"
        >
          {loading ? '承認中...' : '✓ 承認'}
        </button>
        <button
          onClick={() => onEdit(karte.id)}
          disabled={loading}
          className="flex-1 bg-transparent border border-border-primary text-ink text-[12px] rounded-md px-2.5 py-1.5 disabled:opacity-50"
        >
          編集
        </button>
      </div>
    </div>
  )
}
