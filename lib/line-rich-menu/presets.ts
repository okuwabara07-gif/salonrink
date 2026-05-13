/**
 * LINE Rich Menu Presets, Templates, Layouts
 */

import type { Preset, Template, Layout } from "./types"

// ===============================
// 20 Button Presets
// ===============================

export const PRESETS: Preset[] = [
  // 予約 (Gold)
  {
    id: "reserve",
    label: "予約する",
    category: "予約",
    color: "#b48a55",
    defaultAction: "url",
    urlTemplate: "https://example.com/reserve",
  },
  {
    id: "reserve-change",
    label: "予約変更",
    category: "予約",
    color: "#b48a55",
    defaultAction: "url",
  },
  {
    id: "reserve-cancel",
    label: "予約確認",
    category: "予約",
    color: "#b48a55",
    defaultAction: "url",
  },

  // 情報 (Green)
  {
    id: "menu",
    label: "メニュー",
    category: "情報",
    color: "#2a6b5a",
    defaultAction: "message",
  },
  {
    id: "catalog",
    label: "ヘアカタログ",
    category: "情報",
    color: "#2a6b5a",
    defaultAction: "url",
  },
  {
    id: "staff",
    label: "スタッフ紹介",
    category: "情報",
    color: "#2a6b5a",
    defaultAction: "url",
  },
  {
    id: "price",
    label: "料金表",
    category: "情報",
    color: "#2a6b5a",
    defaultAction: "url",
  },

  // 特典 (Red)
  {
    id: "coupon",
    label: "クーポン",
    category: "特典",
    color: "#a14b3a",
    defaultAction: "message",
  },
  {
    id: "campaign",
    label: "キャンペーン",
    category: "特典",
    color: "#a14b3a",
    defaultAction: "url",
  },
  {
    id: "points",
    label: "ポイント確認",
    category: "特典",
    color: "#a14b3a",
    defaultAction: "postback",
  },
  {
    id: "referral",
    label: "ご紹介",
    category: "特典",
    color: "#a14b3a",
    defaultAction: "url",
  },

  // 店舗 (Blue)
  {
    id: "access",
    label: "アクセス",
    category: "店舗",
    color: "#3a5a7a",
    defaultAction: "url",
  },
  {
    id: "hours",
    label: "営業時間",
    category: "店舗",
    color: "#3a5a7a",
    defaultAction: "postback",
  },
  {
    id: "tel",
    label: "電話する",
    category: "店舗",
    color: "#3a5a7a",
    defaultAction: "phone",
    urlTemplate: "tel:0000000000",
  },
  {
    id: "contact",
    label: "お問い合わせ",
    category: "店舗",
    color: "#3a5a7a",
    defaultAction: "postback",
  },

  // SNS (Purple)
  {
    id: "ig",
    label: "Instagram",
    category: "SNS",
    color: "#7a3a5a",
    defaultAction: "url",
    urlTemplate: "https://instagram.com",
  },
  {
    id: "tiktok",
    label: "TikTok",
    category: "SNS",
    color: "#7a3a5a",
    defaultAction: "url",
    urlTemplate: "https://tiktok.com",
  },
  {
    id: "review",
    label: "口コミを書く",
    category: "SNS",
    color: "#7a3a5a",
    defaultAction: "url",
  },
  {
    id: "line-share",
    label: "友達に共有",
    category: "SNS",
    color: "#7a3a5a",
    defaultAction: "postback",
  },
]

// ===============================
// 7 Templates
// ===============================

export const TEMPLATES: Template[] = [
  {
    id: "hero-feature",
    name: "予約強調",
    layout: "hero-6",
    description: "予約を目立つヒーロー領域に配置した構成",
    tags: ["人気", "予約"],
    defaultSlots: ["reserve", "menu", "coupon", "catalog", "access", "ig", "contact"],
  },
  {
    id: "standard-6",
    name: "スタンダード",
    layout: "3x2",
    description: "予約・メニュー・クーポンを揃えたオーソドックス構成",
    tags: ["定番"],
    defaultSlots: ["reserve", "menu", "coupon", "catalog", "access", "ig"],
  },
  {
    id: "minimal-4",
    name: "ミニマル",
    layout: "2x2",
    description: "最小限に絞った4ボタン構成",
    tags: ["シンプル", "ミニ"],
    defaultSlots: ["reserve", "menu", "coupon", "access"],
  },
  {
    id: "new-customer",
    name: "新規集客特化",
    layout: "3x2",
    description: "初来店向けの情報重視型構成",
    tags: ["集客", "新規"],
    defaultSlots: ["coupon", "catalog", "reserve", "staff", "review", "ig"],
  },
  {
    id: "retention",
    name: "リピーター向け",
    layout: "3x2",
    description: "既存顧客向けの再予約・特典重視型",
    tags: ["リピート"],
    defaultSlots: ["reserve", "reserve-change", "points", "campaign", "referral", "contact"],
  },
  {
    id: "salon-ec",
    name: "サロン＋EC",
    layout: "3x2",
    description: "サロン＋物販を両立した構成",
    tags: ["物販", "メイン"],
    defaultSlots: ["reserve", "menu", "catalog", "coupon", "ig", "contact"],
  },
  {
    id: "single-cta",
    name: "予約特化",
    layout: "1x1",
    description: "予約ボタンのみ。シンプル最強",
    tags: ["特化"],
    defaultSlots: ["reserve"],
  },
]

// ===============================
// 5 Layouts
// ===============================

export const LAYOUTS: Layout[] = [
  {
    id: "hero-6",
    label: "メイン+6",
    grid: "1 hero + 3×2",
    slotCount: 7,
  },
  {
    id: "3x2",
    label: "大 (6マス)",
    grid: "3列×2行",
    slotCount: 6,
  },
  {
    id: "2x2",
    label: "中 (4マス)",
    grid: "2列×2行",
    slotCount: 4,
  },
  {
    id: "2x1",
    label: "小 (2マス)",
    grid: "2列×1行",
    slotCount: 2,
  },
  {
    id: "1x1",
    label: "1ボタン",
    grid: "1列×1行",
    slotCount: 1,
  },
]

// ===============================
// Action Types
// ===============================

export const ACTIONS = [
  { id: "url", label: "URL を開く" },
  { id: "message", label: "リッチメッセージ" },
  { id: "phone", label: "電話" },
  { id: "postback", label: "アクション" },
  { id: "coupon", label: "クーポン配信" },
] as const
