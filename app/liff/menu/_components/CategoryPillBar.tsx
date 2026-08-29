'use client'

import React from 'react'

interface CategoryPillBarProps {
  categories: { name: string; count: number }[]
  activeCategory: string
  onSelect: (category: string) => void
}

export function CategoryPillBar({
  categories,
  activeCategory,
  onSelect,
}: CategoryPillBarProps) {
  return (
    <div className="bg-cream px-3 pt-2.5 pb-1.5 flex gap-1.5 overflow-x-auto">
      {categories.map(({ name, count }) => {
        const active = name === activeCategory
        return (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all text-[12px] whitespace-nowrap border ${
              active
                ? 'bg-ink text-white border-ink font-semibold'
                : 'bg-surface text-ink border-border-primary font-medium'
            }`}
          >
            <span className="font-serif">{name}</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-px rounded-full ${
                active ? 'bg-white/15 text-white' : 'bg-bg-alt text-faint'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
