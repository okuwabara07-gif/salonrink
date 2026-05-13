/**
 * LINE Rich Menu Configuration Types
 */

// ===============================
// Slot / Button Definition
// ===============================

export interface Slot {
  presetId: string
  label: string
  url: string
  action?: string // Override: "url" | "message" | "phone" | "postback" | "coupon"
}

// ===============================
// Preset (20 types)
// ===============================

export interface Preset {
  id: string
  label: string
  category: "予約" | "情報" | "特典" | "店舗" | "SNS" | "all"
  color: string
  defaultAction: "url" | "message" | "phone" | "postback"
  urlTemplate?: string
  icon?: string
}

// ===============================
// Template (7 types)
// ===============================

export interface Template {
  id: string
  name: string
  layout: LayoutType
  description?: string
  tags?: string[]
  defaultSlots: (string | null)[] // preset IDs or null
}

// ===============================
// Layout
// ===============================

export type LayoutType = "hero-6" | "3x2" | "2x2" | "2x1" | "1x1"

export interface Layout {
  id: LayoutType
  label: string
  grid: string // e.g. "3x2", "1 hero + 3x2"
  slotCount: number
}

// ===============================
// Style (10 types)
// ===============================

export interface StyleColor {
  menuBg: string
  chatBg: string
  btnBg: string
  btnBorder: string
  btnText: string
  iconColor: string
}

export interface StyleHero {
  bg: string
  border: string
  text: string
  btnBg: string
  btnBorder: string
  btnText: string
  iconColor: string
}

export interface Style {
  id: string
  code: string
  name: string
  menuBg: string
  chatBg: string
  btnBg: string
  btnBorder: string
  btnText: string
  iconColor: string
  radius: number
  gap: number
  hero: StyleHero
  decoration?: "botanical" | "marble" | "wave" | "pinkbotanical" | "goldmarble" | "glassblur" | "neon"
  boxShadow?: string
  backdropFilter?: string
}

// ===============================
// Greeting (8 types)
// ===============================

export interface Greeting {
  id: string
  tone: string
  label: string
  text: string
}

// ===============================
// Avatar (6 types)
// ===============================

export interface Avatar {
  id: string
  type: "letter" | "letter-dark" | "scissors" | "flower" | "leaf" | "diamond"
  label: string
  bgColor: string
  textColor?: string
  icon?: string
}

// ===============================
// Main State
// ===============================

export interface RichMenuState {
  layout: LayoutType
  slots: (Slot | null)[]
  focused: number | null
  categoryFilter: "すべて" | "予約" | "情報" | "特典" | "店舗" | "SNS"
  activeTemplateId: string | null
  titleText: string
  activeGreetingId: string | null
  avatar: Avatar
  chatTitle: string
  style: Style
}

// ===============================
// API Request/Response
// ===============================

export interface RichMenuConfig {
  id?: string
  salon_id: string
  layout: LayoutType
  style_id: string
  slots: Slot[]
  greeting_text?: string
  greeting_preset_id?: string
  avatar_id: string
  is_draft: boolean
  published_at?: string
  line_rich_menu_id?: string
  line_published_at?: string
  chat_title?: string
  created_at?: string
  updated_at?: string
}

export interface SaveDraftRequest {
  layout: LayoutType
  style_id: string
  slots: Slot[]
  greeting_text?: string
  greeting_preset_id?: string
  avatar_id: string
  chat_title?: string
}

export interface PublishRequest extends SaveDraftRequest {
  // Same as draft, will be published to LINE
}

// ===============================
// LINE Messaging API Types
// ===============================

export interface LineRichMenuArea {
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  action: LineAction
}

export interface LineAction {
  type: "uri" | "postback" | "message" | "richmenuswitch"
  uri?: string
  postbackData?: string
  text?: string
}

export interface LineRichMenuCreateRequest {
  size: {
    width: number
    height: number
  }
  selected: boolean
  name: string
  areas: LineRichMenuArea[]
}
