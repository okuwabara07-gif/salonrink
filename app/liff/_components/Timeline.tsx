'use client'

import React from 'react'

interface BookingToday {
  id: string
  time: string
  start_time: string
  end_time: string
  customer_name: string
  menu_name: string | null
  price: number | null
  source: string
}

interface TimelineProps {
  bookings: BookingToday[]
}

const TOTAL_MIN = 10 * 60
const START_HOUR = 9

export function Timeline({ bookings }: TimelineProps) {
  const ticks = [9, 11, 13, 15, 17, 19]

  const toMinutes = (isoString: string): number => {
    const d = new Date(isoString)
    const h = d.getUTCHours() + 9
    const m = d.getUTCMinutes()
    return ((h + 24) % 24) * 60 + m
  }

  const getBandColor = (source: string): string => {
    if (source === 'hpb') return 'bg-amber'
    if (source === 'line') return 'bg-green'
    return 'bg-faint'
  }

  return (
    <div className="bg-surface border border-border-primary rounded-xl px-3 pt-3 pb-2 mb-3" style={{ minHeight: 60 }}>
      {/* バンド領域 */}
      <div className="relative" style={{ height: 18, marginBottom: 8 }}>
        {bookings.map((b) => {
          const startMin = toMinutes(b.start_time)
          const endMin = toMinutes(b.end_time)
          const startOffset = startMin - START_HOUR * 60
          const duration = endMin - startMin

          if (startOffset < 0 || startOffset >= TOTAL_MIN || duration <= 0) return null

          const left = (startOffset / TOTAL_MIN) * 100
          const width = (Math.min(duration, TOTAL_MIN - startOffset) / TOTAL_MIN) * 100
          const colorClass = getBandColor(b.source)

          return (
            <div
              key={b.id}
              className={`absolute rounded-[3px] ${colorClass}`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: 3,
                height: 12,
                opacity: 0.85,
              }}
              title={`${b.customer_name} ${b.menu_name || ''}`}
            />
          )
        })}
      </div>

      {/* 時間軸 */}
      <div className="relative" style={{ height: 14 }}>
        {ticks.map((h) => {
          const left = ((h - START_HOUR) * 60 / TOTAL_MIN) * 100
          return (
            <div
              key={h}
              className="absolute"
              style={{
                left: `${left}%`,
                top: 0,
              }}
            >
              <div className="w-px h-2 bg-hairline" />
              <span className="absolute font-mono text-[8px] text-faint" style={{ top: 8, left: -6 }}>
                {h}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
