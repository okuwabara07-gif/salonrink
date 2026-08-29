'use client'

import React from 'react'
import type { BookingToday } from './DashboardClient'

interface BookingRowProps {
  booking: BookingToday
  isLast: boolean
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  const h = parseInt(d.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Asia/Tokyo' }), 10)
  const m = parseInt(d.toLocaleString('en-US', { minute: '2-digit', timeZone: 'Asia/Tokyo' }), 10)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatDuration(startIso: string, endIso: string): string {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  const minutes = Math.floor((end - start) / 60000)
  return `${minutes}分`
}

export function BookingRow({ booking, isLast }: BookingRowProps) {
  const sourceLabel = booking.source === 'hpb' ? 'HPB' : booking.source === 'line' ? 'LINE' : '手動'
  const sourceClass =
    booking.source === 'hpb'
      ? 'bg-amber-soft text-amber'
      : booking.source === 'line'
        ? 'bg-green-soft text-green-ink'
        : 'bg-bg-alt text-muted'

  return (
    <div className={`flex items-center px-3 py-2.5 ${!isLast ? 'border-b border-border-soft' : ''}`}>
      {/* 時刻ブロック */}
      <div className="w-14 flex-shrink-0">
        <div className="font-mono text-[13.5px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
          {formatTime(booking.start_time)}
        </div>
        <div className="font-mono text-[9.5px] text-faint mt-0.5">
          {formatDuration(booking.start_time, booking.end_time)}
        </div>
      </div>

      {/* 仕切り線 */}
      <div className="w-px h-7 bg-border-primary mx-2.5" />

      {/* 中央コンテンツ */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-ink truncate">{booking.customer_name}</div>
        <div className="text-[10.5px] text-muted truncate">{booking.menu_name || 'メニュー未確定'}</div>
      </div>

      {/* source バッジ */}
      <div
        className={`ml-2 px-1.5 py-0.5 rounded text-[9.5px] font-semibold uppercase ${sourceClass}`}
        style={{ letterSpacing: '0.4px' }}
      >
        {sourceLabel}
      </div>
    </div>
  )
}
