'use client'

import React from 'react'

interface MenuCardBProps {
  menu: {
    id: string
    name: string
    price: number
    duration: number
    category: string | null
  }
  reorderMode?: boolean
  onEdit: () => void
}

function formatYen(n: number): string {
  return '¥' + n.toLocaleString()
}

export function MenuCardB({
  menu,
  reorderMode = false,
  onEdit,
}: MenuCardBProps) {
  return (
    <button
      onClick={reorderMode ? undefined : onEdit}
      className={`text-left bg-surface border border-border-primary rounded-xl p-3 min-h-[132px] flex flex-col gap-1.5 ${
        reorderMode ? 'cursor-grab' : 'cursor-pointer'
      }`}
    >
      {/* バッジ群(現状は空、将来 HPB / 人気) */}
      <div className="flex gap-1 flex-wrap min-h-4" />

      {/* メニュー名 */}
      <div className="text-[13px] font-medium text-ink leading-[1.35] line-clamp-2 min-h-9">
        {menu.name}
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* 価格 + 所要時間 */}
      <div className="flex items-baseline justify-between gap-1">
        <span
          className="font-mono text-[16px] font-semibold text-ink"
          style={{ letterSpacing: '-0.3px' }}
        >
          {formatYen(menu.price)}
        </span>
        <span className="font-mono text-[10.5px] text-muted">
          {menu.duration}分
        </span>
      </div>
    </button>
  )
}
