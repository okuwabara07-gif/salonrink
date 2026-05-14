'use client';

import React from 'react';

interface SparklineProps {
  values: number[];
  w?: number;
  h?: number;
  color?: string;
  fill?: boolean;
  today?: boolean;
}

export function Sparkline({
  values,
  w = 120,
  h = 32,
  color = 'currentColor',
  fill = true,
  today = true,
}: SparklineProps) {
  if (!values || values.length === 0) return null;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pad = 2;
  const step = (w - pad * 2) / (values.length - 1);
  const yOf = (v: number) =>
    h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const pts = values.map((v, i) => `${pad + i * step},${yOf(v)}`).join(' ');
  const area = `M${pad},${h} L ${pts.replace(/ /g, ' L ')} L${w - pad},${h} Z`;
  const last = values.length - 1;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {fill && <path d={area} fill={color} opacity=".10" />}
      <polyline
        fill="none" stroke={color} strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" points={pts}
      />
      {today && <circle cx={pad + last * step} cy={yOf(values[last])} r="2.5" fill={color} />}
    </svg>
  );
}
