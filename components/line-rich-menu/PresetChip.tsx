"use client"

import React from "react"
import type { Preset } from "@/lib/line-rich-menu/types"
import Icon from "./Icon"

interface PresetChipProps {
  preset: Preset
  used: boolean
  onSelect: (presetId: string) => void
  draggable?: boolean
}

export default function PresetChip({ preset, used, onSelect, draggable = true }: PresetChipProps) {
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("presetId", preset.id)
  }

  return (
    <button
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={() => onSelect(preset.id)}
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: 8,
        padding: 12,
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        opacity: used ? 0.55 : 1,
        minWidth: 120,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        if (!used) {
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
      {/* アイコン + 使用中バッジ */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 4,
            background: `${preset.color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon id={preset.id} size={16} color={preset.color} />
        </div>

        {used && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              background: "var(--gold)",
              color: "var(--ink)",
              padding: "2px 6px",
              borderRadius: 3,
              whiteSpace: "nowrap",
              marginLeft: "auto",
            }}
          >
            使用中
          </span>
        )}
      </div>

      {/* ラベル */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 500,
          color: "var(--ink)",
          fontFamily: '"Noto Sans JP", sans-serif',
        }}
      >
        {preset.label}
      </p>

      {/* ヒント */}
      <p
        style={{
          margin: 0,
          fontSize: 10.5,
          color: "var(--muted)",
          fontFamily: '"Noto Sans JP", sans-serif',
        }}
      >
        {preset.category}
      </p>
    </button>
  )
}
