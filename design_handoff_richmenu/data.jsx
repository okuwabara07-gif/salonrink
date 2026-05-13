// =======================================================
// プリセットボタン（よく使う機能を1クリックで配置）
// =======================================================
// 各プリセットは: id, label, icon (SVG path), category, color, defaultAction, hint
const PRESETS = [
  // 予約系
  { id: "reserve", label: "予約する", category: "予約", color: "#b48a55",
    icon: "M3 5h14M3 10h14M3 15h14M6 2v3M14 2v3",
    hint: "予約システムにリンク", action: "URL", urlTemplate: "https://reserve.example.com" },
  { id: "reserve-change", label: "予約変更", category: "予約", color: "#b48a55",
    icon: "M3 10a7 7 0 0 1 12-5l2 2M17 10a7 7 0 0 1-12 5l-2-2M15 3v4h-4M5 17v-4h4",
    hint: "予約変更ページへ", action: "URL" },
  { id: "reserve-cancel", label: "予約確認", category: "予約", color: "#b48a55",
    icon: "M4 4h12v12H4zM7 9l2 2 4-4",
    hint: "マイ予約の確認", action: "URL" },

  // メニュー・カタログ
  { id: "menu", label: "メニュー", category: "情報", color: "#2a6b5a",
    icon: "M3 5h14M3 10h14M3 15h10",
    hint: "施術メニュー一覧", action: "リッチメッセージ" },
  { id: "catalog", label: "ヘアカタログ", category: "情報", color: "#2a6b5a",
    icon: "M4 3h12v14H4zM7 7h6M7 11h6",
    hint: "スタイル写真集", action: "URL" },
  { id: "staff", label: "スタッフ紹介", category: "情報", color: "#2a6b5a",
    icon: "M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 17c0-3 3-5 7-5s7 2 7 5",
    hint: "スタイリスト一覧", action: "URL" },
  { id: "price", label: "料金表", category: "情報", color: "#2a6b5a",
    icon: "M10 2v16M5 6h7a3 3 0 0 1 0 6H5h8",
    hint: "価格一覧", action: "URL" },

  // 集客・特典
  { id: "coupon", label: "クーポン", category: "特典", color: "#a14b3a",
    icon: "M3 7l4-4h6l4 4v6l-4 4H7l-4-4zM10 7v6M7 10h6",
    hint: "今月のクーポン", action: "リッチメッセージ" },
  { id: "campaign", label: "キャンペーン", category: "特典", color: "#a14b3a",
    icon: "M4 10l3-6 6 3-3 6zM7 13l-3 4M11 7l5 1",
    hint: "期間限定の告知", action: "URL" },
  { id: "points", label: "ポイント確認", category: "特典", color: "#a14b3a",
    icon: "M10 2l2.5 5 5.5.8-4 4 1 5.5L10 14.8 5 17.3l1-5.5-4-4 5.5-.8z",
    hint: "ポイント残高", action: "アクション" },
  { id: "referral", label: "ご紹介", category: "特典", color: "#a14b3a",
    icon: "M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM10 17c-3 0-5-2-5-5h10c0 3-2 5-5 5z",
    hint: "友達紹介プログラム", action: "URL" },

  // 店舗情報
  { id: "access", label: "アクセス", category: "店舗", color: "#3a5a7a",
    icon: "M10 2C6.7 2 4 4.7 4 8c0 4 6 10 6 10s6-6 6-10c0-3.3-2.7-6-6-6zM10 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
    hint: "地図・住所", action: "URL" },
  { id: "hours", label: "営業時間", category: "店舗", color: "#3a5a7a",
    icon: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM10 6v4l3 2",
    hint: "本日の営業時間", action: "アクション" },
  { id: "tel", label: "電話する", category: "店舗", color: "#3a5a7a",
    icon: "M4 4c0 7 5 12 12 12l1-3-4-2-2 2c-2-1-3-2-4-4l2-2-2-4z",
    hint: "電話発信", action: "電話" },
  { id: "contact", label: "お問い合わせ", category: "店舗", color: "#3a5a7a",
    icon: "M3 5l7 5 7-5M3 5v10h14V5",
    hint: "チャットで問合せ", action: "アクション" },

  // 外部リンク
  { id: "ig", label: "Instagram", category: "SNS", color: "#7a3a5a",
    icon: "M4 4h12v12H4zM10 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM14 5.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1z",
    hint: "公式インスタ", action: "URL" },
  { id: "tiktok", label: "TikTok", category: "SNS", color: "#7a3a5a",
    icon: "M11 3v9a3 3 0 1 1-3-3M11 3c0 2 2 4 4 4",
    hint: "公式TikTok", action: "URL" },
  { id: "review", label: "口コミを書く", category: "SNS", color: "#7a3a5a",
    icon: "M10 2l2.5 5 5.5.8-4 4 1 5.5L10 14.8 5 17.3l1-5.5-4-4 5.5-.8z",
    hint: "Googleレビュー", action: "URL" },
  { id: "line-share", label: "友達に共有", category: "SNS", color: "#7a3a5a",
    icon: "M14 8a3 3 0 1 0-6 0v2M5 10h10v7H5zM10 13v2",
    hint: "シェアアクション", action: "アクション" },
];

// =======================================================
// テンプレート（プリセットを並べたセット）
// =======================================================
const TEMPLATES = [
  {
    id: "hero-feature",
    name: "予約強調",
    slots: 7,
    layout: "hero-6",
    description: "メイン予約ボタン+6機能",
    tag: "メイン+6",
    buttons: ["reserve", "menu", "coupon", "catalog", "access", "ig", "contact"],
  },
  {
    id: "standard-6",
    name: "スタンダード",
    slots: 6,
    layout: "3x2",
    description: "美容室で最も使われる構成",
    tag: "人気",
    buttons: ["reserve", "menu", "coupon", "catalog", "access", "ig"],
  },
  {
    id: "minimal-4",
    name: "ミニマル",
    slots: 4,
    layout: "2x2",
    description: "重要な4機能だけに絞った構成",
    tag: "シンプル",
    buttons: ["reserve", "menu", "coupon", "access"],
  },
  {
    id: "new-customer",
    name: "新規集客特化",
    slots: 6,
    layout: "3x2",
    description: "クーポン・カタログを前面に",
    tag: "集客",
    buttons: ["coupon", "catalog", "reserve", "staff", "review", "ig"],
  },
  {
    id: "retention",
    name: "リピーター向け",
    slots: 6,
    layout: "3x2",
    description: "予約・特典中心の常連向け",
    tag: "リピート",
    buttons: ["reserve", "reserve-change", "points", "campaign", "referral", "contact"],
  },
  {
    id: "salon-ec",
    name: "サロン＋EC",
    slots: 6,
    layout: "3x2",
    description: "物販も扱うサロン向け",
    tag: "物販",
    buttons: ["reserve", "menu", "catalog", "coupon", "ig", "contact"],
  },
  {
    id: "single-cta",
    name: "予約特化",
    slots: 1,
    layout: "1x1",
    description: "予約導線だけに集中",
    tag: "ミニ",
    buttons: ["reserve"],
  },
];

// レイアウト定義 (slot count, gridTemplate)
const LAYOUTS = {
  "3x2": { cols: 3, rows: 2, slots: 6 },
  "2x2": { cols: 2, rows: 2, slots: 4 },
  "2x1": { cols: 2, rows: 1, slots: 2 },
  "1x1": { cols: 1, rows: 1, slots: 1 },
  "hero-6": { cols: 3, rows: 2, slots: 7, hero: true }, // slot 0 = hero (wide), 1-6 = grid
};

// アクション種別
const ACTIONS = ["URL", "リッチメッセージ", "電話", "アクション", "クーポン配信"];

// =======================================================
// あいさつメッセージ プリセット
// =======================================================
const GREETING_PRESETS = [
  {
    id: "standard",
    tone: "丁寧",
    label: "スタンダード",
    text: "いつもありがとうございます。\n下のメニューからお選びください。",
  },
  {
    id: "welcome-new",
    tone: "新規向け",
    label: "はじめまして",
    text: "はじめまして！ご登録ありがとうございます。\n下のメニューからお気軽にどうぞ。",
  },
  {
    id: "casual",
    tone: "カジュアル",
    label: "やわらかい",
    text: "こんにちは！\n下のメニューからどうぞ♪",
  },
  {
    id: "reserve-push",
    tone: "予約促進",
    label: "予約しやすく",
    text: "ご利用ありがとうございます。\n下のメニューから24時間ご予約いただけます。",
  },
  {
    id: "campaign",
    tone: "告知",
    label: "キャンペーン中",
    text: "今月の特別クーポン配布中！\n下のメニュー「クーポン」よりご確認ください。",
  },
  {
    id: "seasonal-spring",
    tone: "季節",
    label: "春の挨拶",
    text: "新しい季節、新しい自分へ。\n下のメニューから春のスタイルをお選びください。",
  },
  {
    id: "thanks-return",
    tone: "リピーター",
    label: "ご来店感謝",
    text: "本日はご来店ありがとうございました。\n次回のご予約は下のメニューから♪",
  },
  {
    id: "minimal",
    tone: "簡潔",
    label: "ミニマル",
    text: "下のメニューからお選びください。",
  },
];

// =======================================================
// アバター プリセット
// =======================================================
const AVATAR_PRESETS = [
  { id: "letter", type: "letter", value: "K", bg: "#d9bf95", color: "#1a1418", label: "イニシャル" },
  { id: "letter-dark", type: "letter", value: "K", bg: "#1a1418", color: "#d9bf95", label: "イニシャル（黒）" },
  { id: "scissors", type: "icon", value: "scissors", bg: "#b48a55", color: "#fff", label: "ハサミ" },
  { id: "flower", type: "icon", value: "flower", bg: "#a14b3a", color: "#fff", label: "フラワー" },
  { id: "leaf", type: "icon", value: "leaf", bg: "#2a6b5a", color: "#fff", label: "リーフ" },
  { id: "diamond", type: "icon", value: "diamond", bg: "#3a5a7a", color: "#fff", label: "ダイヤ" },
];

const AVATAR_ICON_PATHS = {
  scissors: "M5 5l10 10M5 15L15 5M7 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0z",
  flower: "M10 10m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0M10 8V4M10 16v-4M14 10h4M2 10h4M13 7l3-3M4 16l3-3M13 13l3 3M4 4l3 3",
  leaf: "M4 16C4 8 12 4 16 4c0 8-4 12-12 12zM4 16l8-8",
  diamond: "M10 3l5 5-5 9-5-9z",
};

window.PRESETS = PRESETS;
window.TEMPLATES = TEMPLATES;
window.LAYOUTS = LAYOUTS;
window.ACTIONS = ACTIONS;
window.GREETING_PRESETS = GREETING_PRESETS;
window.AVATAR_PRESETS = AVATAR_PRESETS;
window.AVATAR_ICON_PATHS = AVATAR_ICON_PATHS;

// =======================================================
// ビジュアルスタイル（5パターン）
// =======================================================
const RICHMENU_STYLES = [
  {
    id: "minimal",
    code: "①",
    name: "上品ミニマル",
    description: "白基調・線アイコン",
    menuBg: "#ffffff",
    chatBg: "#ececec",
    btnBg: "#ffffff",
    btnBorder: "#e6e0d4",
    btnText: "#2a2024",
    iconColor: "#7a6f64",
    radius: 4,
    gap: 6,
    hero: { bg: "#fbf7ee", border: "#e6dfd0", text: "#2a2024", iconColor: "#8a7d72" },
    decoration: null,
    swatches: ["#ffffff", "#fbf7ee", "#2a2024"],
  },
  {
    id: "botanical",
    code: "②",
    name: "ナチュラルボタニカル",
    description: "セージ＋ボタニカル",
    menuBg: "linear-gradient(135deg, #f5edd9 0%, #ebe1c5 100%)",
    chatBg: "#cabfa3",
    btnBg: "#faf3e2",
    btnBorder: "#dfd4b6",
    btnText: "#3a3528",
    iconColor: "#7a705a",
    radius: 8,
    gap: 8,
    hero: { bg: "#9aae8e", border: "#9aae8e", text: "#fff", iconColor: "#fff" },
    decoration: "botanical",
    swatches: ["#9aae8e", "#f5edd9", "#3a3528"],
  },
  {
    id: "luxury",
    code: "③",
    name: "モダンラグジュアリー",
    description: "ブラック＋ゴールド",
    menuBg: "linear-gradient(160deg, #1a1418 0%, #2a2228 50%, #1a1418 100%)",
    chatBg: "#3a3038",
    btnBg: "#1f1a1f",
    btnBorder: "#3a3038",
    btnText: "#e8d8b8",
    iconColor: "#c8a87a",
    radius: 4,
    gap: 4,
    hero: { bg: "#2a2228", border: "#3a3038", text: "#e8d8b8", iconColor: "#c8a87a" },
    decoration: "marble",
    swatches: ["#1a1418", "#c8a87a", "#e8d8b8"],
  },
  {
    id: "soft-round",
    code: "④",
    name: "やさしい丸み",
    description: "ピーチ＋大きな角丸",
    menuBg: "#fdf2ee",
    chatBg: "#f5e6df",
    btnBg: "#fbe9e0",
    btnBorder: "transparent",
    btnText: "#7a4a3a",
    iconColor: "#c87a5a",
    radius: 16,
    gap: 8,
    hero: { bg: "#f0c8b8", border: "transparent", text: "#7a4a3a", iconColor: "#7a4a3a" },
    decoration: null,
    swatches: ["#f0c8b8", "#fbe9e0", "#7a4a3a"],
  },
  {
    id: "ai-future",
    code: "⑤",
    name: "AI・未来感",
    description: "ラベンダーグラデ",
    menuBg: "linear-gradient(160deg, #e8e0fa 0%, #d0c8f0 50%, #f0e0e8 100%)",
    chatBg: "#d8d0ec",
    btnBg: "rgba(255,255,255,0.55)",
    btnBorder: "rgba(255,255,255,0.7)",
    btnText: "#3a2f5a",
    iconColor: "#7a5fc8",
    radius: 14,
    gap: 7,
    hero: { bg: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.8)", text: "#3a2f5a", iconColor: "#7a5fc8" },
    decoration: "wave",
    swatches: ["#a98fe0", "#e8e0fa", "#3a2f5a"],
  },
  {
    id: "mono",
    code: "⑥",
    name: "シンプルモノトーン",
    description: "グレー基調・無彩色",
    menuBg: "#f5f5f5",
    chatBg: "#e8e8e8",
    btnBg: "#ffffff",
    btnBorder: "#e0e0e0",
    btnText: "#2a2a2a",
    iconColor: "#5a5a5a",
    radius: 6,
    gap: 6,
    hero: { bg: "#ffffff", border: "#e0e0e0", text: "#2a2a2a", iconColor: "#5a5a5a" },
    decoration: null,
    swatches: ["#ffffff", "#e0e0e0", "#2a2a2a"],
  },
  {
    id: "feminine-pink",
    code: "⑦",
    name: "フェミニンピンク",
    description: "ピンク＋ボタニカル",
    menuBg: "linear-gradient(180deg, #fce8e8 0%, #f8d8d8 100%)",
    chatBg: "#fde4e4",
    btnBg: "#fff0ee",
    btnBorder: "#fad8d2",
    btnText: "#a04a5a",
    iconColor: "#d07a8a",
    radius: 14,
    gap: 7,
    hero: { bg: "linear-gradient(135deg, #f4c4c4 0%, #ecaab0 100%)", border: "transparent", text: "#7a3a4a", iconColor: "#7a3a4a" },
    decoration: "pinkbotanical",
    swatches: ["#ecaab0", "#fce8e8", "#7a3a4a"],
  },
  {
    id: "gold-marble",
    code: "⑧",
    name: "高級感ゴールド",
    description: "大理石＋ゴールド線",
    menuBg: "linear-gradient(140deg, #f4ecdf 0%, #ebe0c8 50%, #f0e4d0 100%)",
    chatBg: "#e8dfc8",
    btnBg: "#faf3e3",
    btnBorder: "#d4b878",
    btnText: "#8a6a3a",
    iconColor: "#b4904a",
    radius: 8,
    gap: 6,
    hero: { bg: "#1a1418", border: "#c8a87a", text: "#e8d8b8", iconColor: "#c8a87a" },
    decoration: "goldmarble",
    swatches: ["#1a1418", "#c8a87a", "#f4ecdf"],
  },
  {
    id: "glass",
    code: "⑨",
    name: "ガラスモーフィズム",
    description: "フロスト＋スカイ",
    menuBg: "linear-gradient(160deg, #e0e8fa 0%, #d4d0f4 50%, #e8d8f0 100%)",
    chatBg: "#dfe4f4",
    btnBg: "rgba(255,255,255,0.45)",
    btnBorder: "rgba(255,255,255,0.6)",
    btnText: "#4a4a7a",
    iconColor: "#6a7ab8",
    radius: 18,
    gap: 8,
    hero: { bg: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.7)", text: "#4a4a7a", iconColor: "#6a7ab8" },
    decoration: "glassblur",
    swatches: ["#a8b8e8", "#e0e8fa", "#4a4a7a"],
  },
  {
    id: "night",
    code: "⑩",
    name: "ナイトモード",
    description: "ダーク＋ネオン",
    menuBg: "linear-gradient(160deg, #0a0e1a 0%, #14182a 50%, #0a0e1a 100%)",
    chatBg: "#1a1e30",
    btnBg: "#14182a",
    btnBorder: "#2a2f48",
    btnText: "#ffffff",
    iconColor: "#a98fe8",
    radius: 10,
    gap: 6,
    hero: { bg: "linear-gradient(135deg, #1a1e3a 0%, #14182a 100%)", border: "#8a7fd8", text: "#ffffff", iconColor: "#c8b8f8" },
    decoration: "neon",
    swatches: ["#0a0e1a", "#a98fe8", "#5fc8e8"],
  },
];

window.RICHMENU_STYLES = RICHMENU_STYLES;
