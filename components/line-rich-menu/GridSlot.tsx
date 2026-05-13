"use client"

import React from "react"
import type { Slot } from "@/lib/line-rich-menu/types"
import { PRESETS } from "@/lib/line-rich-menu/presets"
import Icon from "./Icon"

interface GridSlotProps {
  slot: Slot | null
  index: number
  focused: boolean
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onClick: () => void
  onDelete: () => void
}

export default function GridSlot({
  slot,
  index,
  focused,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onDelete,
}: GridSlotProps) {
  const preset = slot ? PRESETS.find((p) => p.id === slot.presetId) : null
  const isEmpty = !slot
  const [isDragging, setIsDragging] = React.useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        e.currentTarget.style.background = "var(--gold-soft)"
        e.currentTarget.style.borderStyle = "solid"
        setIsDragging(true)
        onDragOver(e)
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.background = isEmpty ? "transparent" : "var(--card)"
        e.currentTarget.style.borderStyle = isEmpty ? "dashed" : "solid"
        setIsDragging(false)
        onDragLeave(e)
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.currentTarget.style.background = isEmpty ? "transparent" : "var(--card)"
        e.currentTarget.style.borderStyle = isEmpty ? "dashed" : "solid"
        setIsDragging(false)
        onDrop(e)
      }}
      onClick={onClick}
      style={{
        position: "relative",
        borderRadius: 8,
        padding: 12,
        border: isEmpty ? "2px dashed var(--gold)" : `2px solid var(--line)`,
        background: isDragging ? "var(--gold-soft)" : isEmpty ? "transparent" : "var(--card)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        minHeight: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        outline: focused ? `2px solid var(--ink)` : "none",
        outlineOffset: "-2px",
      }}
    >
      {isEmpty ? (
        <>
          {/* 空スロット */}
          <div
            style={{
              fontSize: 24,
              animation: "rich-menu-pulse 1.8s ease-in-out infinite",
            }}
          >
            +
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "var(--muted)",
              fontFamily: '"Noto Sans JP", sans-serif',
              textAlign: "center",
            }}
          >
            プリセットを選択
          </p>
        </>
      ) : (
        <>
          {/* 配置済みスロット */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              background: `${preset?.color || "var(--muted)"}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon id={preset?.id || "reserve"} size={16} color={preset?.color} />
          </div>

          <div style={{ textAlign: "center", flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 500,
                color: "var(--ink)",
                fontFamily: '"Noto Sans JP", sans-serif',
              }}
            >
              {slot.label}
            </p>
          </div>

          {/* 削除ボタン */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              background: "rgba(0,0,0,0.05)",
              border: "none",
              width: 20,
              height: 20,
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "var(--muted)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = "rgba(0,0,0,0.1)"
              el.style.color = "var(--ink)"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = "rgba(0,0,0,0.05)"
              el.style.color = "var(--muted)"
            }}
          >
            ×
          </button>
        </>
      )}
    </div>
  )
}
