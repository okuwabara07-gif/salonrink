'use client'

import React from 'react'
import { Sparkline } from './Sparkline'

interface KpiCardV2Props {
  label: string
  value: string
  series: number[]
  trend: string
  trendUp: boolean
  sub: string
  primary?: boolean
}

export function KpiCardV2({ label, value, series, trend, trendUp, sub, primary = false }: KpiCardV2Props) {
  if (primary) {
    return (
      <div className="bg-ink rounded-xl px-3 pt-3 pb-2.5 min-h-[96px] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase text-white/60" style={{ letterSpacing: '0.6px' }}>
              {label}
            </p>
            <p className="font-mono text-[21px] font-semibold text-white mt-1" style={{ letterSpacing: '-0.5px' }}>
              {value}
            </p>
          </div>
          <Sparkline series={series} stroke="#ffffff" fill="rgba(255,255,255,0.18)" />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-[10.5px] font-semibold" style={{ color: trendUp ? '#7ce0a4' : '#f6a98e' }}>
            {trend}
          </span>
          <span className="font-mono text-[10px] text-white/50">{sub}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border-primary rounded-xl px-3 pt-3 pb-2.5 min-h-[96px] flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase text-muted" style={{ letterSpacing: '0.6px' }}>
            {label}
          </p>
          <p className="font-mono text-[21px] font-semibold text-ink mt-1" style={{ letterSpacing: '-0.5px' }}>
            {value}
          </p>
        </div>
        <Sparkline series={series} stroke="#04863a" fill="rgba(4,134,58,0.18)" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="font-mono text-[10.5px] font-semibold" style={{ color: trendUp ? '#04863a' : '#D85A30' }}>
          {trend}
        </span>
        <span className="font-mono text-[10px] text-faint">{sub}</span>
      </div>
    </div>
  )
}
