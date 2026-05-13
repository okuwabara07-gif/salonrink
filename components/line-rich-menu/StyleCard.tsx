"use client"

import React from "react"
import type { Style } from "@/lib/line-rich-menu/types"

interface StyleCardProps {
  style: Style
  selected: boolean
  onSelect: (styleId: string) => void
}

export default function StyleCard({ style, selected, onSelect }: StyleCardProps) {
  return (
    <button
      onClick={() => onSelect(style.id)}
      style={{
        background: "var(--card)",
        border: selected ? "2px solid var(--ink)" : "1px solid var(--line)",
        borderRadius: 8,
        padding: 12,
        cursor: "pointer",
        transition: "all 0.15s ease",
        overflow: "hidden",
        minWidth: 140,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        if (!selected) {
          el.style.borderColor = "var(--gold)"
          el.style.boxShadow = "0 2px 8px rgba(180, 138, 85, 0.15)"
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        if (!selected) {
          el.style.borderColor = "var(--line)"
          el.style.boxShadow = "none"
        }
      }}
    >
      {/* ミニプレビュー（iPhone フレーム） */}
      <div
        style={{
          aspectRatio: "9 / 17",
          background: style.menuBg,
          borderRadius: 6,
          padding: 4,
          marginBottom: 8,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ステータスバー */}
        <div
          style={{
            height: 4,
            background: "rgba(0,0,0,0.1)",
            borderRadius: 1,
            marginBottom: 2,
          }}
        />

        {/* トーク領域 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <div
            style={{
              height: 8,
              background: style.chatBg,
              borderRadius: 1,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              height: 6,
              background: style.chatBg,
              borderRadius: 1,
              width: "80%",
              opacity: 0.4,
            }}
          />
        </div>

        {/* リッチメニュー領域 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1,
            marginTop: "auto",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: style.btnBg,
                border: style.btnBorder ? `0.5px solid ${style.btnBorder}` : "none",
                borderRadius: style.radius / 4,
                aspectRatio: "1",
              }}
            />
          ))}
        </div>
      </div>

      {/* パターン番号 + 名前 */}
      <p
        style={{
          margin: "6px 0 2px 0",
          fontSize: 10,
          fontWeight: 600,
          color: "var(--muted)",
        }}
      >
        {style.code}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13.5,
          fontWeight: 500,
          color: selected ? "var(--ink)" : "var(--ink-2)",
          fontFamily: '"Noto Serif JP", serif',
          letterSpacing: "0.04em",
        }}
      >
        {style.name}
      </p>

      {/* スウォッチ（3色） */}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <div
          style={{
            width: 14,
            height: 14,
            background: style.btnBg,
            border: `0.5px solid ${style.btnBorder || "transparent"}`,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            background: style.btnText,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            background: style.iconColor,
            borderRadius: 2,
          }}
        />
      </div>
    </button>
  )
}
