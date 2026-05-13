/**
 * LINE Rich Menu Greeting & Avatar Presets
 */

import type { Greeting, Avatar } from "./types"

// ===============================
// 8 Greeting Presets
// ===============================

export const GREETING_PRESETS: Greeting[] = [
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
]

// ===============================
// 6 Avatar Presets
// ===============================

export const AVATAR_PRESETS: Avatar[] = [
  {
    id: "letter",
    type: "letter",
    label: "イニシャル（金）",
    bgColor: "#d9bf95",
    textColor: "#1a1418",
  },
  {
    id: "letter-dark",
    type: "letter-dark",
    label: "イニシャル（黒）",
    bgColor: "#1a1418",
    textColor: "#d9bf95",
  },
  {
    id: "scissors",
    type: "scissors",
    label: "ハサミ",
    bgColor: "#b48a55",
  },
  {
    id: "flower",
    type: "flower",
    label: "花",
    bgColor: "#9aae8e",
  },
  {
    id: "leaf",
    type: "leaf",
    label: "葉",
    bgColor: "#2a6b5a",
  },
  {
    id: "diamond",
    type: "diamond",
    label: "ダイヤ",
    bgColor: "#d07a8a",
  },
]

// ===============================
// Avatar Icon SVG Paths (for icons)
// ===============================

export const AVATAR_ICON_PATHS: Record<string, string> = {
  scissors:
    "M10 4c-.83 0-1.54.5-1.88 1.23H5.5C4.12 5.23 3 6.35 3 7.73s1.12 2.5 2.5 2.5h2.62c.34.73 1.05 1.23 1.88 1.23s1.54-.5 1.88-1.23H18.5c1.38 0 2.5-1.12 2.5-2.5S19.88 5.23 18.5 5.23h-2.62C11.54 4.5 10.83 4 10 4zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z",
  flower:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z",
  leaf: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4-8c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z",
  diamond:
    "M12 2l5 5 5 5-5 5-5 5-5-5-5-5 5-5 5-5zm0 4l-3 3 3 3 3-3-3-3zm0 8l-3 3 3 3 3-3-3-3z",
}
