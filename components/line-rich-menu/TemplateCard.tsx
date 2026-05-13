"use client"

import React from "react"
import type { Template } from "@/lib/line-rich-menu/types"
import { PRESETS } from "@/lib/line-rich-menu/presets"

interface TemplateCardProps {
  template: Template
  selected: boolean
  onSelect: (templateId: string) => void
}

export default function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={() => onSelect(template.id)}
      style={{
        background: selected ? "var(--ink)" : "var(--card)",
        color: selected ? "var(--bg)" : "var(--ink)",
        borderRadius: 8,
        border: `2px solid ${selected ? "var(--ink)" : "var(--line)"}`,
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        textAlign: "left",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
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
      {/* ヘッダー */}
      <div style={{ marginBottom: 12 }}>
        <h3
          style={{
            margin: "0 0 4px 0",
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "0.08em",
            fontFamily: '"Noto Serif JP", serif',
          }}
        >
          {template.name}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 11.5,
            color: selected ? "rgba(255,255,255,0.7)" : "var(--muted)",
          }}
        >
          {template.description}
        </p>
      </div>

      {/* タグ */}
      {template.tags && template.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {template.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                padding: "2px 7px",
                borderRadius: 4,
                background: selected ? "rgba(255,255,255,0.2)" : "var(--bg-2)",
                color: selected ? "rgba(255,255,255,0.8)" : "var(--muted)",
                whiteSpace: "nowrap",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ミニプレビュー（グリッド可視化） */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: template.layout === "hero-6" ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
            gap: 2,
            width: "100%",
            fontSize: 8,
          }}
        >
          {template.defaultSlots.map((presetId, idx) => {
            const preset = presetId ? PRESETS.find((p) => p.id === presetId) : null
            return (
              <div
                key={idx}
                style={{
                  background: preset?.color || "var(--line)",
                  color: "#fff",
                  padding: 4,
                  borderRadius: 3,
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                }}
              >
                {preset?.label ? preset.label.substring(0, 4) : "—"}
              </div>
            )
          })}
        </div>
      </div>
    </button>
  )
}
