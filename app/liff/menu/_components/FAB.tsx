'use client'

import React from 'react'

interface FABProps {
  onClick: () => void
  label: string
}

export function FAB({ onClick, label }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 z-30 flex items-center gap-2 bg-green text-white px-5 py-3 rounded-full shadow-lg font-medium text-[13px]"
      style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
    >
      <span className="text-[16px] leading-none">＋</span>
      {label}
    </button>
  )
}
