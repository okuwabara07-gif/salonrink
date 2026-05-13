"use client"

import React from "react"
import { LAYOUTS } from "@/lib/line-rich-menu/presets"
import type { LayoutType } from "@/lib/line-rich-menu/types"

interface LayoutSwitchProps {
  selected: LayoutType
  onSelect: (layout: LayoutType) => void
}

export default function LayoutSwitch({ selected, onSelect }: LayoutSwitchProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {LAYOUTS.map((layout) => (
        <button
          key={layout.id}
          onClick={() => onSelect(layout.id)}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: selected === layout.id ? "none" : "1px solid var(--line)",
            background: selected === layout.id ? "var(--ink)" : "var(--card)",
            color: selected === layout.id ? "var(--bg)" : "var(--ink)",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: '"Noto Sans JP", sans-serif',
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            if (selected !== layout.id) {
              el.style.borderColor = "var(--gold)"
              el.style.boxShadow = "0 2px 8px rgba(180, 138, 85, 0.15)"
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = "var(--line)"
            el.style.boxShadow = "none"
          }}
        >
          {layout.label}
        </button>
      ))}
    </div>
  )
}
