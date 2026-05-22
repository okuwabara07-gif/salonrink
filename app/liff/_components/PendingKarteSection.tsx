'use client'

import React from 'react'
import { KarteCard } from './KarteCard'
import { SectionLabel } from './SectionLabel'

export interface KarteListItem {
  id: string
  customer_id: string | null
  customer_name: string
  visit_date: string
  created_at: string
  ai_summary: Record<string, unknown> | null
}

interface PendingKarteSectionProps {
  kartes: KarteListItem[]
  approvedCount: number
  onApprove: (id: string) => void
  onApproveAll: () => void
  onEdit: (id: string) => void
  approvingId: string | null
  approvingAll: boolean
}

export function PendingKarteSection({
  kartes,
  approvedCount,
  onApprove,
  onApproveAll,
  onEdit,
  approvingId,
  approvingAll,
}: PendingKarteSectionProps) {
  const pendingCount = kartes.length

  // 状態 3: そもそも何もない
  if (pendingCount === 0 && approvedCount === 0) {
    return null
  }

  // 状態 2: 完了済み
  if (pendingCount === 0 && approvedCount > 0) {
    return (
      <div className="px-3 mb-4">
        <SectionLabel>承認待ちカルテ</SectionLabel>
        <div
          className="bg-green-soft rounded-xl py-5 px-3 text-center"
          style={{ border: '1px solid rgba(4,134,58,0.3)' }}
        >
          <p className="text-[12px] text-muted">
            <span className="text-green-ink font-semibold">✓</span>{' '}
            承認待ちカルテはすべて処理しました
          </p>
        </div>
      </div>
    )
  }

  // 状態 1: 承認待ちあり
  return (
    <div className="px-3 mb-4">
      <SectionLabel
        trailing={
          <button
            onClick={onApproveAll}
            disabled={approvingAll}
            className="text-[11.5px] text-green-ink font-semibold disabled:opacity-50"
          >
            {approvingAll ? '承認中...' : 'すべて承認'}
          </button>
        }
      >
        承認待ちカルテ
        <span
          className="inline-block ml-1.5 font-mono text-[11px] text-alert bg-alert-soft px-1.5 py-0.5 rounded-full"
        >
          {pendingCount}
        </span>
      </SectionLabel>

      <div>
        {kartes.map((karte) => (
          <KarteCard
            key={karte.id}
            karte={karte}
            onApprove={onApprove}
            onEdit={onEdit}
            loading={approvingId === karte.id || approvingAll}
          />
        ))}
      </div>
    </div>
  )
}
