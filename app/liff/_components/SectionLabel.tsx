'use client'

import React, { ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
  trailing?: ReactNode
}

export function SectionLabel({ children, trailing }: SectionLabelProps) {
  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <h2 className="font-serif text-[13px] font-medium text-ink" style={{ letterSpacing: '0.6px' }}>
        {children}
      </h2>
      {trailing && (
        <span className="font-mono text-[10.5px] text-faint">
          {trailing}
        </span>
      )}
    </div>
  )
}
