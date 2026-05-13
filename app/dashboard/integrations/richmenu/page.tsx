"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { TEMPLATES, PRESETS, LAYOUTS } from "@/lib/line-rich-menu/presets"
import { RICHMENU_STYLES } from "@/lib/line-rich-menu/styles"
import { GREETING_PRESETS, AVATAR_PRESETS } from "@/lib/line-rich-menu/greetings"
import type { RichMenuState, Slot, Avatar } from "@/lib/line-rich-menu/types"

import TemplateCard from "@/components/line-rich-menu/TemplateCard"
import StyleCard from "@/components/line-rich-menu/StyleCard"
import LayoutSwitch from "@/components/line-rich-menu/LayoutSwitch"
import GridSlot from "@/components/line-rich-menu/GridSlot"
import PresetChip from "@/components/line-rich-menu/PresetChip"
import Preview from "@/components/line-rich-menu/Preview"
import AvatarCircle from "@/components/line-rich-menu/AvatarCircle"

export default function RichMenuPage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [salonName, setSalonName] = useState("サロン名")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<"すべて" | "予約" | "情報" | "特典" | "店舗" | "SNS">(
    "すべて"
  )

  const [state, setState] = useState<RichMenuState>({
    layout: "hero-6",
    slots: Array(7).fill(null),
    focused: null,
    categoryFilter: "すべて",
    activeTemplateId: null,
    titleText: "下のメニューからお選びください。",
    activeGreetingId: "standard",
    avatar: AVATAR_PRESETS[0],
    chatTitle: "サロン名",
    style: RICHMENU_STYLES[0],
  })

  // 初期化：既存設定を取得
  useEffect(() => {
    async function loadData() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // サロン情報取得
      const { data: salon } = await supabase
        .from("salons")
        .select("id, name")
        .eq("owner_user_id", user.id)
        .maybeSingle()

      if (!salon) {
        setLoading(false)
        return
      }

      setSalonId(salon.id)
      setSalonName(salon.name)
      setState((prev) => ({ ...prev, chatTitle: salon.name }))

      // リッチメニュー設定取得
      const { data: config } = await supabase
        .from("rich_menu_configs")
        .select("*")
        .eq("salon_id", salon.id)
        .eq("is_draft", true)
        .order("updated_at", { ascending: false })
        .maybeSingle()

      if (config) {
        const greeting = GREETING_PRESETS.find((g) => g.id === config.greeting_preset_id) || GREETING_PRESETS[0]
        const avatar = AVATAR_PRESETS.find((a) => a.id === config.avatar_id) || AVATAR_PRESETS[0]
        const style = RICHMENU_STYLES.find((s) => s.id === config.style_id) || RICHMENU_STYLES[0]

        setState((prev) => ({
          ...prev,
          layout: config.layout,
          slots: (config.slots || []).slice(0, LAYOUTS.find((l) => l.id === config.layout)?.slotCount || 7),
          titleText: config.greeting_text || greeting.text,
          activeGreetingId: config.greeting_preset_id || "standard",
          avatar,
          chatTitle: config.chat_title || salon.name,
          style,
        }))
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // テンプレート適用
  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    const layout = template.layout
    const slotCount = LAYOUTS.find((l) => l.id === layout)?.slotCount || 7
    const newSlots = template.defaultSlots.map((presetId) => {
      if (!presetId) return null
      const preset = PRESETS.find((p) => p.id === presetId)
      return {
        presetId,
        label: preset?.label || "",
        url: preset?.urlTemplate || "",
        action: preset?.defaultAction,
      } as Slot
    })

    setState((prev) => ({
      ...prev,
      layout,
      slots: newSlots.slice(0, slotCount).concat(Array(slotCount - newSlots.length).fill(null)),
      activeTemplateId: templateId,
    }))
  }

  // レイアウト変更
  const handleLayoutChange = (layout: typeof state.layout) => {
    const slotCount = LAYOUTS.find((l) => l.id === layout)?.slotCount || 7
    const currentSlots = state.slots.filter((s) => s !== null)
    const newSlots = currentSlots.slice(0, slotCount).concat(Array(Math.max(0, slotCount - currentSlots.length)).fill(null))

    setState((prev) => ({
      ...prev,
      layout,
      slots: newSlots,
    }))
  }

  // プリセット配置
  const addPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId)
    if (!preset) return

    const newSlot: Slot = {
      presetId,
      label: preset.label,
      url: preset.urlTemplate || "",
      action: preset.defaultAction,
    }

    // フォーカス中のスロットに配置 or 最初の空きスロットに配置
    const targetIdx =
      state.focused !== null && state.slots[state.focused] === null
        ? state.focused
        : state.slots.findIndex((s) => s === null)

    if (targetIdx === -1) return // 空きスロットなし

    const newSlots = [...state.slots]
    newSlots[targetIdx] = newSlot
    setState((prev) => ({
      ...prev,
      slots: newSlots,
      focused: targetIdx,
    }))
  }

  // スロット削除
  const deleteSlot = (idx: number) => {
    const newSlots = [...state.slots]
    newSlots[idx] = null
    setState((prev) => ({
      ...prev,
      slots: newSlots,
      focused: null,
    }))
  }

  // ドラッグ&ドロップ
  const handleDrop = (idx: number, e: React.DragEvent<HTMLDivElement>) => {
    const presetId = e.dataTransfer.getData("presetId")
    if (!presetId) return

    const preset = PRESETS.find((p) => p.id === presetId)
    if (!preset) return

    const newSlot: Slot = {
      presetId,
      label: preset.label,
      url: preset.urlTemplate || "",
      action: preset.defaultAction,
    }

    const newSlots = [...state.slots]
    newSlots[idx] = newSlot
    setState((prev) => ({
      ...prev,
      slots: newSlots,
      focused: idx,
    }))
  }

  // 下書き保存
  const handleSaveDraft = async () => {
    if (!salonId) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/line/rich-menu/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salon_id: salonId,
          layout: state.layout,
          style_id: state.style.id,
          slots: state.slots.filter((s) => s !== null),
          greeting_text: state.titleText,
          greeting_preset_id: state.activeGreetingId,
          avatar_id: state.avatar.id,
          chat_title: state.chatTitle,
        }),
      })

      if (!res.ok) throw new Error("Save failed")
      setMessage({ ok: true, text: "下書きを保存しました" })
    } catch (err) {
      setMessage({ ok: false, text: `エラー: ${err instanceof Error ? err.message : "unknown"}` })
    } finally {
      setSaving(false)
    }
  }

  // 公開
  const handlePublish = async () => {
    if (!salonId) return

    if (!confirm("このリッチメニューを LINE に公開します。よろしいですか？")) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/line/rich-menu/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salon_id: salonId,
          layout: state.layout,
          style_id: state.style.id,
          slots: state.slots.filter((s) => s !== null),
          greeting_text: state.titleText,
          greeting_preset_id: state.activeGreetingId,
          avatar_id: state.avatar.id,
          chat_title: state.chatTitle,
        }),
      })

      if (!res.ok) throw new Error("Publish failed")
      setMessage({ ok: true, text: "LINE に公開しました！" })
    } catch (err) {
      setMessage({ ok: false, text: `エラー: ${err instanceof Error ? err.message : "unknown"}` })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#888" }}>読み込み中...</p>
      </div>
    )
  }

  const filteredPresets =
    categoryFilter === "すべて" ? PRESETS : PRESETS.filter((p) => p.category === categoryFilter)
  const usedPresetIds = new Set(state.slots.filter((s) => s !== null).map((s) => s!.presetId))
  const currentStyle = state.style
  const slotCount = LAYOUTS.find((l) => l.id === state.layout)?.slotCount || 7

  return (
    <div data-page="rich-menu">
      <main
        style={{
          background: "var(--bg)",
          minHeight: "100vh",
          padding: "clamp(20px, 4vw, 40px)",
          paddingBottom: 100,
        }}
      >
        <div style={{ maxWidth: 1600, margin: "0 auto" }}>
          {/* ヘッダー */}
          <div style={{ marginBottom: "clamp(24px, 4vw, 40px)" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(28px, 5vw, 36px)",
                fontWeight: 400,
                letterSpacing: "0.06em",
                color: "var(--ink)",
                fontFamily: '"Noto Serif JP", serif',
              }}
            >
              LINEリッチメニュー設定
            </h1>
            <p style={{ margin: "8px 0 0 0", fontSize: 13, color: "var(--muted)" }}>
              テンプレートとプリセットで簡単に完成
            </p>
          </div>

          {/* メインコンテンツ */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "clamp(20px, 3vw, 40px)" }}>
            {/* 左：ワークフロー */}
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(32px, 4vw, 48px)" }}>
              {/* Step 1: テンプレート */}
              <section style={{ background: "var(--card)", borderRadius: 8, padding: "clamp(20px, 3vw, 28px)" }}>
                <h2
                  style={{
                    margin: "0 0 clamp(16px, 2vw, 20px) 0",
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    color: "var(--ink)",
                    fontFamily: '"Noto Serif JP", serif',
                  }}
                >
                  01 テンプレートから始める
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                  {TEMPLATES.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      selected={state.activeTemplateId === template.id}
                      onSelect={applyTemplate}
                    />
                  ))}
                </div>
              </section>

              {/* Step 2: スタイル */}
              <section style={{ background: "var(--card)", borderRadius: 8, padding: "clamp(20px, 3vw, 28px)" }}>
                <h2
                  style={{
                    margin: "0 0 clamp(16px, 2vw, 20px) 0",
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    color: "var(--ink)",
                    fontFamily: '"Noto Serif JP", serif',
                  }}
                >
                  02 デザインを選ぶ
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {RICHMENU_STYLES.map((style) => (
                    <StyleCard
                      key={style.id}
                      style={style}
                      selected={state.style.id === style.id}
                      onSelect={(styleId) => {
                        const s = RICHMENU_STYLES.find((st) => st.id === styleId)
                        if (s) setState((prev) => ({ ...prev, style: s }))
                      }}
                    />
                  ))}
                </div>
              </section>

              {/* Step 3: ボタン配置 */}
              <section style={{ background: "var(--card)", borderRadius: 8, padding: "clamp(20px, 3vw, 28px)" }}>
                <h2
                  style={{
                    margin: "0 0 clamp(16px, 2vw, 20px) 0",
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    color: "var(--ink)",
                    fontFamily: '"Noto Serif JP", serif',
                  }}
                >
                  03 ボタンを配置する
                </h2>

                {/* レイアウト切替 */}
                <div style={{ marginBottom: "clamp(16px, 2vw, 20px)" }}>
                  <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "var(--muted)" }}>レイアウト</p>
                  <LayoutSwitch selected={state.layout} onSelect={handleLayoutChange} />
                </div>

                {/* グリッド */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      state.layout === "hero-6"
                        ? "repeat(3, 1fr)"
                        : state.layout === "3x2"
                          ? "repeat(3, 1fr)"
                          : state.layout === "2x2"
                            ? "repeat(2, 1fr)"
                            : state.layout === "2x1"
                              ? "repeat(2, 1fr)"
                              : "1fr",
                    gap: "clamp(12px, 2vw, 16px)",
                  }}
                >
                  {Array(slotCount)
                    .fill(null)
                    .map((_, idx) => (
                      <GridSlot
                        key={idx}
                        slot={state.slots[idx] || null}
                        index={idx}
                        focused={state.focused === idx}
                        onDragOver={() => {}}
                        onDragLeave={() => {}}
                        onDrop={(e) => handleDrop(idx, e)}
                        onClick={() => setState((prev) => ({ ...prev, focused: idx }))}
                        onDelete={() => deleteSlot(idx)}
                      />
                    ))}
                </div>
              </section>

              {/* Step 4: プリセット */}
              <section style={{ background: "var(--card)", borderRadius: 8, padding: "clamp(20px, 3vw, 28px)" }}>
                <h2
                  style={{
                    margin: "0 0 clamp(16px, 2vw, 20px) 0",
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    color: "var(--ink)",
                    fontFamily: '"Noto Serif JP", serif',
                  }}
                >
                  04 プリセットから選ぶ
                </h2>

                {/* カテゴリフィルタ */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {(["すべて", "予約", "情報", "特典", "店舗", "SNS"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 4,
                        border: categoryFilter === cat ? "none" : "1px solid var(--line)",
                        background: categoryFilter === cat ? "var(--ink)" : "transparent",
                        color: categoryFilter === cat ? "var(--bg)" : "var(--ink)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* プリセット一覧 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
                  {filteredPresets.map((preset) => (
                    <PresetChip
                      key={preset.id}
                      preset={preset}
                      used={usedPresetIds.has(preset.id)}
                      onSelect={() => addPreset(preset.id)}
                    />
                  ))}
                </div>
              </section>

              {/* Step 5: あいさつメッセージ */}
              <section style={{ background: "var(--card)", borderRadius: 8, padding: "clamp(20px, 3vw, 28px)" }}>
                <h2
                  style={{
                    margin: "0 0 clamp(16px, 2vw, 20px) 0",
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    color: "var(--ink)",
                    fontFamily: '"Noto Serif JP", serif',
                  }}
                >
                  05 あいさつメッセージ
                </h2>

                {/* テンプレート */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
                  {GREETING_PRESETS.map((greeting) => (
                    <button
                      key={greeting.id}
                      onClick={() => {
                        setState((prev) => ({
                          ...prev,
                          titleText: greeting.text,
                          activeGreetingId: greeting.id,
                        }))
                      }}
                      style={{
                        padding: 12,
                        borderRadius: 6,
                        border: state.activeGreetingId === greeting.id ? "none" : "1px solid var(--line)",
                        background: state.activeGreetingId === greeting.id ? "var(--ink)" : "var(--bg-2)",
                        color: state.activeGreetingId === greeting.id ? "var(--bg)" : "var(--ink)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "left",
                      }}
                    >
                      <p style={{ margin: "0 0 6px 0", fontWeight: 600 }}>{greeting.label}</p>
                      <p style={{ margin: 0, fontSize: 10, opacity: 0.8, lineHeight: 1.4 }}>
                        {greeting.text.substring(0, 40)}...
                      </p>
                    </button>
                  ))}
                </div>

                {/* カスタム編集 */}
                <details style={{ marginBottom: 16 }}>
                  <summary style={{ cursor: "pointer", fontSize: 12, fontWeight: 500, color: "var(--gold)", marginBottom: 8 }}>
                    自由に編集する
                  </summary>
                  <textarea
                    value={state.titleText}
                    onChange={(e) => {
                      setState((prev) => ({
                        ...prev,
                        titleText: e.target.value,
                        activeGreetingId: null,
                      }))
                    }}
                    style={{
                      width: "100%",
                      minHeight: 80,
                      padding: 12,
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      background: "var(--bg-2)",
                      color: "var(--ink)",
                      fontSize: 13,
                      fontFamily: '"Noto Sans JP", sans-serif',
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                  <p style={{ margin: "8px 0 0 0", fontSize: 11, color: "var(--muted)" }}>
                    {state.titleText.length}/200文字
                  </p>
                </details>

                {/* アバター選択 */}
                <div>
                  <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "var(--muted)" }}>アバター</p>
                  <AvatarCircle
                    selected={state.avatar}
                    onSelect={(avatar) => setState((prev) => ({ ...prev, avatar }))}
                  />
                </div>
              </section>

              {/* ボタン */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  style={{
                    padding: "clamp(12px, 2vw, 16px) clamp(20px, 4vw, 28px)",
                    borderRadius: 6,
                    border: "none",
                    background: saving ? "var(--line)" : "var(--ink)",
                    color: saving ? "var(--muted)" : "var(--bg)",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {saving ? "保存中..." : "下書き保存"}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={saving || state.slots.filter((s) => s !== null).length === 0}
                  style={{
                    padding: "clamp(12px, 2vw, 16px) clamp(20px, 4vw, 28px)",
                    borderRadius: 6,
                    border: "none",
                    background: saving || state.slots.filter((s) => s !== null).length === 0 ? "var(--line)" : "var(--gold)",
                    color: "var(--ink)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: saving || state.slots.filter((s) => s !== null).length === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {saving ? "公開中..." : "公開する"}
                </button>
              </div>

              {/* メッセージ */}
              {message && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    background: message.ok ? "rgba(42, 107, 90, 0.1)" : "rgba(179, 74, 58, 0.1)",
                    color: message.ok ? "var(--accent-rm)" : "var(--danger-rm)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  {message.text}
                </div>
              )}
            </div>

            {/* 右：プレビュー（Sticky） */}
            <div
              style={{
                position: "sticky",
                top: "clamp(20px, 4vw, 40px)",
                height: "fit-content",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <Preview state={state} style={currentStyle} />
              <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
                <p style={{ margin: "0 0 4px 0" }}>
                  {state.slots.filter((s) => s !== null).length} / {slotCount}
                </p>
                <p style={{ margin: 0 }}>
                  {state.slots.filter((s) => s !== null).length === 0 ? "ボタンを追加してください" : "プレビュー"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
