"use client"

import React from "react"
import type { RichMenuState, Slot, Style } from "@/lib/line-rich-menu/types"
import { PRESETS } from "@/lib/line-rich-menu/presets"

interface PreviewProps {
  state: RichMenuState
  style: Style
}

export default function Preview({ state, style }: PreviewProps) {
  const getGridCols = (layout: string) => {
    if (layout === "hero-6") return "repeat(3, 1fr)"
    if (layout === "3x2") return "repeat(3, 1fr)"
    if (layout === "2x2") return "repeat(2, 1fr)"
    if (layout === "2x1") return "repeat(2, 1fr)"
    return "1fr"
  }

  const displaySlots = state.slots.slice(0, state.slots.length)

  return (
    <div
      style={{
        background: "var(--bg)",
        borderRadius: 28,
        padding: 8,
        width: 280,
        aspectRatio: "9 / 19.5",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 18px 40px -20px rgba(0,0,0,0.25)",
      }}
    >
      {/* iPhone フレーム外側 */}
      <div
        style={{
          flex: 1,
          background: style.menuBg,
          borderRadius: 22,
          padding: 8,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* ステータスバー */}
        <div
          style={{
            height: 8,
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: 8,
            paddingRight: 8,
            fontSize: 6,
            color: style.btnText,
          }}
        >
          <span>9:41</span>
          <span>📶</span>
        </div>

        {/* ナビゲーション */}
        <div
          style={{
            height: 28,
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 8,
            paddingRight: 8,
            marginBottom: 8,
            borderBottom: `0.5px solid ${style.btnBorder || "rgba(0,0,0,0.1)"}`,
          }}
        >
          <span style={{ fontSize: 10, color: style.btnText }}>←</span>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--gold)",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            K
          </div>
          <span style={{ fontSize: 9, color: style.btnText, flex: 1 }}>
            {state.chatTitle || "サロン名"}
          </span>
          <span style={{ fontSize: 10, color: style.btnText }}>⋮</span>
        </div>

        {/* トーク領域 */}
        <div
          style={{
            flex: 1,
            background: style.chatBg,
            borderRadius: 8,
            padding: 8,
            marginBottom: 8,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 6,
          }}
        >
          {/* アバター + メッセージ */}
          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: state.avatar.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                color: state.avatar.textColor || "var(--ink)",
                flexShrink: 0,
              }}
            >
              K
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.4)",
                borderRadius: 6,
                padding: "6px 8px",
                fontSize: 9,
                lineHeight: "1.3",
                color: style.btnText,
                maxWidth: "calc(100% - 36px)",
                wordBreak: "break-word",
              }}
            >
              {state.titleText}
            </div>
          </div>
        </div>

        {/* 入力バー */}
        <div
          style={{
            height: 24,
            background: "rgba(0,0,0,0.05)",
            borderRadius: 4,
            marginBottom: 8,
            padding: "0 6px",
            display: "flex",
            alignItems: "center",
            fontSize: 8,
            color: style.btnText,
          }}
        >
          ✎ メッセージを入力
        </div>

        {/* リッチメニュー */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: getGridCols(state.layout),
            gap: style.gap / 8,
            padding: 4,
            background: "rgba(0,0,0,0.02)",
            borderRadius: 6,
          }}
        >
          {displaySlots.map((slot, idx) => {
            const preset = slot ? PRESETS.find((p) => p.id === slot.presetId) : null
            return (
              <div
                key={idx}
                style={{
                  background: slot ? style.btnBg : "rgba(0,0,0,0.05)",
                  border: slot ? `0.5px solid ${style.btnBorder || "transparent"}` : "none",
                  borderRadius: style.radius / 4,
                  padding: "4px 2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 7,
                  fontWeight: 500,
                  color: slot ? style.btnText : "rgba(0,0,0,0.2)",
                  textAlign: "center",
                  minHeight: 24,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {slot ? slot.label : ""}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
