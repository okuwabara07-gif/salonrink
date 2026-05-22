'use client'

import React from 'react'

interface SparklineProps {
  series: number[]
  stroke: string
  fill: string
}

export function Sparkline({ series, stroke, fill }: SparklineProps) {
  const W = 110
  const H = 22
  const P = 2

  if (series.length === 0) {
    return <svg width={W} height={H} />
  }

  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min || 1

  const points = series.map((v, i) => {
    const x = P + (i / (series.length - 1)) * (W - P * 2)
    const y = P + (1 - (v - min) / range) * (H - P * 2)
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  const areaPath = `M ${points[0].x.toFixed(2)} ${H} L ${points.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')} L ${points[points.length - 1].x.toFixed(2)} ${H} Z`
  const lastPoint = points[points.length - 1]

  return (
    <svg width={W} height={H}>
      <path d={areaPath} fill={fill} />
      <path d={linePath} stroke={stroke} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <circle cx={lastPoint.x} cy={lastPoint.y} r={2} fill={stroke} />
    </svg>
  )
}
