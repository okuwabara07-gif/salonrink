"use client"

import React from "react"
import { AVATAR_PRESETS } from "@/lib/line-rich-menu/greetings"
import type { Avatar } from "@/lib/line-rich-menu/types"

interface AvatarCircleProps {
  selected: Avatar
  onSelect: (avatar: Avatar) => void
}

export default function AvatarCircle({ selected, onSelect }: AvatarCircleProps) {
  const getAvatarContent = (avatar: Avatar) => {
    if (avatar.type === "letter") {
      return (
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: avatar.textColor || "var(--ink)",
          }}
        >
          K
        </div>
      )
    }
    if (avatar.type === "letter-dark") {
      return (
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: avatar.textColor || "var(--gold-soft)",
          }}
        >
          K
        </div>
      )
    }
    // SVG icons (simplified representations)
    return (
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        {avatar.type === "scissors"
          ? "✂️"
          : avatar.type === "flower"
            ? "🌸"
            : avatar.type === "leaf"
              ? "🍃"
              : avatar.type === "diamond"
                ? "💎"
                : "○"}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {AVATAR_PRESETS.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: avatar.bgColor,
            border: selected.id === avatar.id ? "2px solid var(--ink)" : "2px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            if (selected.id !== avatar.id) {
              el.style.boxShadow = "0 2px 8px rgba(180, 138, 85, 0.25)"
              el.style.transform = "scale(1.05)"
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = "none"
            el.style.transform = "scale(1)"
          }}
        >
          {getAvatarContent(avatar)}
        </button>
      ))}
    </div>
  )
}
