# Handoff: LINEリッチメニュー設定画面 リデザイン

## 概要

サロン管理SaaSの「LINEリッチメニュー設定」画面を、**手入力中心 → テンプレート＋プリセット選択中心** にリデザインしたものです。

**目的：** 顧客（サロン店舗オーナー）が、ボタンごとに「ラベル」「アクション」「URL」を毎回手入力する手間をなくし、選ぶだけでリッチメニューが完成する体験を提供する。

---

## 添付ファイルについて

このフォルダ内の `.html` / `.jsx` ファイルは **HTML製のデザインリファレンス（プロトタイプ）** です。本番コードとしてそのままコピーするものではありません。

**実装タスク：** 既存コードベースの環境（React / Vue / Next.js など）と既存の設計パターン（コンポーネント、ステート管理、スタイリング）に合わせて、これらのデザインを **再実装** してください。コードベースがまだない場合は、最も適切なフレームワークを選択して実装してください。

---

## フィデリティ

**ハイファイ（hifi）：** 色・タイポグラフィ・スペーシング・インタラクションがすべて確定したピクセルパーフェクトなモックアップです。コードベースの既存ライブラリやパターンを用いて、ビジュアル的に忠実に再現してください。

---

## 画面構成

単一ページ。左サイドバー＋メイン作業領域＋右側プレビュー（sticky）の3カラム構成。

### サイドバー（240px幅）
- ブランド名「中身 / SALON OS」（明朝体ロゴ）
- ナビ：ホーム／予約／顧客／**連携**（active）／その他
- 下部：店舗名、ユーザー名、ログアウトボタン

### メイン作業領域（5ステップ構成）

ユーザーは上から順に進む想定ですが、どの順でも編集可能。

| Step | 名前 | 内容 |
|---|---|---|
| 01 | テンプレートから始める | 7つの推奨プリセットから1クリック適用 |
| 02 | デザインを選ぶ | 10種のビジュアルスタイル |
| 03 | ボタンを配置する | レイアウト切替＋ドラッグ&ドロップ／クリック配置 |
| 04 | プリセットから選ぶ | カテゴリ別のボタンライブラリ（20種） |
| 05 | あいさつメッセージ | 8種テンプレート＋アバター選択＋自由編集 |

### 右側プレビュー
- iPhoneフレーム内にLINEトーク画面 + リッチメニューを表示
- ステータスバー／ヘッダー（戻る・アバター・店舗名・メニュー）／トーク領域（あいさつ吹き出し）／リッチメニュー／入力バー
- 上部に「LINE／画像書き出し」タブ
- 下部に下書きステータス表示

---

## 主要コンポーネント仕様

### 1. テンプレートカード（TemplateCard）

7つのテンプレートが3列グリッドで表示。

各カードに含まれるもの：
- テンプレート名（明朝体, 17px, letter-spacing 0.08em）
- 説明テキスト（11.5px, color: var(--muted)）
- タグ（右上、10px, padding 2px 7px, タグ例: 人気／シンプル／集客／リピート／物販／ミニ／メイン+6）
- レイアウトプレビュー（実際のグリッド構成をミニ表示、ボタンラベル付き）

選択時：背景 `var(--ink)`、文字色 `#f3ede1`

**テンプレート一覧：**

| id | 名前 | layout | ボタン構成 |
|---|---|---|---|
| hero-feature | 予約強調 | hero-6 | reserve(hero), menu, coupon, catalog, access, ig, contact |
| standard-6 | スタンダード | 3x2 | reserve, menu, coupon, catalog, access, ig |
| minimal-4 | ミニマル | 2x2 | reserve, menu, coupon, access |
| new-customer | 新規集客特化 | 3x2 | coupon, catalog, reserve, staff, review, ig |
| retention | リピーター向け | 3x2 | reserve, reserve-change, points, campaign, referral, contact |
| salon-ec | サロン＋EC | 3x2 | reserve, menu, catalog, coupon, ig, contact |
| single-cta | 予約特化 | 1x1 | reserve |

### 2. ビジュアルスタイルカード（StyleCard）

10のスタイルをミニフォンプレビュー付きカードで表示。

各カードに含まれるもの：
- ミニフォン（aspect-ratio 9/17、背景まで含めた縮小プレビュー）
- パターン番号（"パターン①"〜"⑩"）
- スタイル名（明朝体, 13.5px）
- 説明テキスト
- スウォッチ（3色、14px × 14px）

選択時：2pxボーダー（var(--ink)）＋下部ラベル領域が反転

**スタイル一覧（完全な仕様）：**

```js
[
  {
    id: "minimal", code: "①", name: "上品ミニマル",
    menuBg: "#ffffff", chatBg: "#ececec",
    btnBg: "#ffffff", btnBorder: "#e6e0d4", btnText: "#2a2024", iconColor: "#7a6f64",
    radius: 4, gap: 6,
    hero: { bg: "#fbf7ee", border: "#e6dfd0", text: "#2a2024", iconColor: "#8a7d72" },
    decoration: null,
  },
  {
    id: "botanical", code: "②", name: "ナチュラルボタニカル",
    menuBg: "linear-gradient(135deg, #f5edd9 0%, #ebe1c5 100%)", chatBg: "#cabfa3",
    btnBg: "#faf3e2", btnBorder: "#dfd4b6", btnText: "#3a3528", iconColor: "#7a705a",
    radius: 8, gap: 8,
    hero: { bg: "#9aae8e", border: "#9aae8e", text: "#fff", iconColor: "#fff" },
    decoration: "botanical", // SVG: 葉のイラスト右上
  },
  {
    id: "luxury", code: "③", name: "モダンラグジュアリー",
    menuBg: "linear-gradient(160deg, #1a1418 0%, #2a2228 50%, #1a1418 100%)", chatBg: "#3a3038",
    btnBg: "#1f1a1f", btnBorder: "#3a3038", btnText: "#e8d8b8", iconColor: "#c8a87a",
    radius: 4, gap: 4,
    hero: { bg: "#2a2228", border: "#3a3038", text: "#e8d8b8", iconColor: "#c8a87a" },
    decoration: "marble", // 大理石風radial-gradient
  },
  {
    id: "soft-round", code: "④", name: "やさしい丸み",
    menuBg: "#fdf2ee", chatBg: "#f5e6df",
    btnBg: "#fbe9e0", btnBorder: "transparent", btnText: "#7a4a3a", iconColor: "#c87a5a",
    radius: 16, gap: 8,
    hero: { bg: "#f0c8b8", border: "transparent", text: "#7a4a3a", iconColor: "#7a4a3a" },
    decoration: null,
    boxShadow: "0 2px 4px rgba(200,140,110,0.15)",
  },
  {
    id: "ai-future", code: "⑤", name: "AI・未来感",
    menuBg: "linear-gradient(160deg, #e8e0fa 0%, #d0c8f0 50%, #f0e0e8 100%)", chatBg: "#d8d0ec",
    btnBg: "rgba(255,255,255,0.55)", btnBorder: "rgba(255,255,255,0.7)",
    btnText: "#3a2f5a", iconColor: "#7a5fc8",
    radius: 14, gap: 7,
    hero: { bg: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.8)", text: "#3a2f5a", iconColor: "#7a5fc8" },
    decoration: "wave", // 波線SVG
    backdropFilter: "blur(6px)",
  },
  {
    id: "mono", code: "⑥", name: "シンプルモノトーン",
    menuBg: "#f5f5f5", chatBg: "#e8e8e8",
    btnBg: "#ffffff", btnBorder: "#e0e0e0", btnText: "#2a2a2a", iconColor: "#5a5a5a",
    radius: 6, gap: 6,
    hero: { bg: "#ffffff", border: "#e0e0e0", text: "#2a2a2a", iconColor: "#5a5a5a" },
  },
  {
    id: "feminine-pink", code: "⑦", name: "フェミニンピンク",
    menuBg: "linear-gradient(180deg, #fce8e8 0%, #f8d8d8 100%)", chatBg: "#fde4e4",
    btnBg: "#fff0ee", btnBorder: "#fad8d2", btnText: "#a04a5a", iconColor: "#d07a8a",
    radius: 14, gap: 7,
    hero: { bg: "linear-gradient(135deg, #f4c4c4 0%, #ecaab0 100%)", border: "transparent", text: "#7a3a4a" },
    decoration: "pinkbotanical",
  },
  {
    id: "gold-marble", code: "⑧", name: "高級感ゴールド",
    menuBg: "linear-gradient(140deg, #f4ecdf 0%, #ebe0c8 50%, #f0e4d0 100%)", chatBg: "#e8dfc8",
    btnBg: "#faf3e3", btnBorder: "#d4b878", btnText: "#8a6a3a", iconColor: "#b4904a",
    radius: 8, gap: 6,
    hero: { bg: "#1a1418", border: "#c8a87a", text: "#e8d8b8", iconColor: "#c8a87a" },
    decoration: "goldmarble",
  },
  {
    id: "glass", code: "⑨", name: "ガラスモーフィズム",
    menuBg: "linear-gradient(160deg, #e0e8fa 0%, #d4d0f4 50%, #e8d8f0 100%)", chatBg: "#dfe4f4",
    btnBg: "rgba(255,255,255,0.45)", btnBorder: "rgba(255,255,255,0.6)",
    btnText: "#4a4a7a", iconColor: "#6a7ab8",
    radius: 18, gap: 8,
    hero: { bg: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.7)", text: "#4a4a7a" },
    decoration: "glassblur",
    backdropFilter: "blur(6px)",
  },
  {
    id: "night", code: "⑩", name: "ナイトモード",
    menuBg: "linear-gradient(160deg, #0a0e1a 0%, #14182a 50%, #0a0e1a 100%)", chatBg: "#1a1e30",
    btnBg: "#14182a", btnBorder: "#2a2f48", btnText: "#ffffff", iconColor: "#a98fe8",
    radius: 10, gap: 6,
    hero: { bg: "linear-gradient(135deg, #1a1e3a 0%, #14182a 100%)", border: "#8a7fd8", text: "#ffffff", iconColor: "#c8b8f8" },
    decoration: "neon",
    boxShadow: "0 0 0 1px {border}, 0 4px 12px rgba(168,143,232,0.1)",
  },
]
```

### 3. レイアウト切替（LayoutSwitch）

5種のレイアウトを横並びボタンで切替。

| 値 | ラベル | グリッド | スロット数 |
|---|---|---|---|
| hero-6 | メイン+6 | 1ヒーロー + 3×2 | 7 |
| 3x2 | 大 (6マス) | 3列×2行 | 6 |
| 2x2 | 中 (4マス) | 2列×2行 | 4 |
| 2x1 | 小 (2マス) | 2列×1行 | 2 |
| 1x1 | 1ボタン | 1列×1行 | 1 |

`hero-6` のスロット0は横長のヒーロー（aspect-ratio 3/0.7）、スロット1-6は2×3グリッド。
ヒーローボタンには「24時間いつでも簡単予約」のサブテキストと「›」マークが付く。

### 4. グリッドエディタ（GridSlot）

レイアウトに従ったグリッドで各スロットを表示。
- **配置済みスロット：** プリセットアイコン（カラー付き）＋ラベル、右上に「×」削除ボタン
- **空スロット：** 「＋」アイコン＋「プリセットを選択」テキスト、ボーダーが破線、パルスアニメーション

動作：
- **ドラッグオーバー：** 背景が `var(--gold-soft)` に、ボーダー実線に
- **クリック：** フォーカス → 詳細編集パネル（ラベル／アクション／URL）を下部に表示
- **ドロップ：** プリセットIDを `dataTransfer` から取得して配置

### 5. プリセットチップ（PresetChip）

20種のボタンプリセットライブラリ。カテゴリフィルタ（すべて／予約／情報／特典／店舗／SNS）付き。

| id | label | category | color | アクション既定 |
|---|---|---|---|---|
| reserve | 予約する | 予約 | #b48a55 | URL |
| reserve-change | 予約変更 | 予約 | #b48a55 | URL |
| reserve-cancel | 予約確認 | 予約 | #b48a55 | URL |
| menu | メニュー | 情報 | #2a6b5a | リッチメッセージ |
| catalog | ヘアカタログ | 情報 | #2a6b5a | URL |
| staff | スタッフ紹介 | 情報 | #2a6b5a | URL |
| price | 料金表 | 情報 | #2a6b5a | URL |
| coupon | クーポン | 特典 | #a14b3a | リッチメッセージ |
| campaign | キャンペーン | 特典 | #a14b3a | URL |
| points | ポイント確認 | 特典 | #a14b3a | アクション |
| referral | ご紹介 | 特典 | #a14b3a | URL |
| access | アクセス | 店舗 | #3a5a7a | URL |
| hours | 営業時間 | 店舗 | #3a5a7a | アクション |
| tel | 電話する | 店舗 | #3a5a7a | 電話 |
| contact | お問い合わせ | 店舗 | #3a5a7a | アクション |
| ig | Instagram | SNS | #7a3a5a | URL |
| tiktok | TikTok | SNS | #7a3a5a | URL |
| review | 口コミを書く | SNS | #7a3a5a | URL |
| line-share | 友達に共有 | SNS | #7a3a5a | アクション |

各チップの構造：
- 32×32 アイコンボックス（背景は色+18% opacity、アイコンは塗りつぶし色）
- ラベル（13px, weight 500）
- ヒント（10.5px, muted）
- 使用中は opacity 0.55 + 「使用中」バッジ

クリック → 最初の空きスロット or フォーカス中スロットに配置。
ドラッグ → 任意のスロットに配置。

### 6. プリセット詳細パネル（スロットフォーカス時）

スロットをクリックすると下部に展開：
- アイコン + 「ボタン {N+1} の詳細」見出し
- ラベル入力
- アクション セレクト（URL / リッチメッセージ / 電話 / アクション / クーポン配信）
- URL/設定値入力（プレースホルダーはプリセットの `urlTemplate`）

### 7. あいさつメッセージプリセット

8種のトーン別テンプレート（grid auto-fill 220px）：

| id | tone | label | text |
|---|---|---|---|
| standard | 丁寧 | スタンダード | いつもありがとうございます。\n下のメニューからお選びください。 |
| welcome-new | 新規向け | はじめまして | はじめまして！ご登録ありがとうございます。\n下のメニューからお気軽にどうぞ。 |
| casual | カジュアル | やわらかい | こんにちは！\n下のメニューからどうぞ♪ |
| reserve-push | 予約促進 | 予約しやすく | ご利用ありがとうございます。\n下のメニューから24時間ご予約いただけます。 |
| campaign | 告知 | キャンペーン中 | 今月の特別クーポン配布中！\n下のメニュー「クーポン」よりご確認ください。 |
| seasonal-spring | 季節 | 春の挨拶 | 新しい季節、新しい自分へ。\n下のメニューから春のスタイルをお選びください。 |
| thanks-return | リピーター | ご来店感謝 | 本日はご来店ありがとうございました。\n次回のご予約は下のメニューから♪ |
| minimal | 簡潔 | ミニマル | 下のメニューからお選びください。 |

選択時：背景 ink、文字色 cream。
下に `<details>` で「自由に編集する」（textarea, 3行）を畳んで配置。

### 8. アバタープリセット

6種：
- letter (K, 金背景 #d9bf95, 黒文字)
- letter-dark (K, 黒背景, 金文字)
- scissors / flower / leaf / diamond（SVGアイコン + カラー背景）

クリックで選択、選択中は2pxボーダー。

---

## デザイントークン

### カラー（CSS変数）

```css
:root {
  --bg: #f3ede1;          /* メインBG（クリーム）*/
  --bg-2: #ebe3d3;        /* セカンダリBG */
  --card: #fbf7ee;        /* カードBG */
  --ink: #1a1418;         /* メインテキスト・ボタンBG */
  --ink-2: #3a2f33;       /* セカンダリテキスト */
  --muted: #8a7d72;       /* ミュート */
  --line: #d9cfbc;        /* ボーダー細 */
  --line-2: #c7bca6;      /* ボーダー濃 */
  --gold: #b48a55;        /* アクセント（金）*/
  --gold-soft: #d9bf95;   /* アクセント（薄金）*/
  --accent: #2a6b5a;      /* アクセント（緑）*/
  --sidebar: #15101a;     /* サイドバーBG */
  --sidebar-active: #2a1f2d;
  --danger: #b34a3a;
}
```

### タイポグラフィ

- 見出し / セリフ：**Noto Serif JP**（400 / 500 / 600 / 700）
- 本文：**Noto Sans JP**（400 / 500 / 600 / 700）
- 数値・コード：**JetBrains Mono**（400 / 500）

font-feature-settings: "palt"（日本語の詰め組）
-webkit-font-smoothing: antialiased

スケール：
- 見出し H1: 36px / 明朝 / letter-spacing 0.06em
- セクション見出し H2: 18px / 明朝 / letter-spacing 0.1em
- ボディ: 13.5px
- ラベル: 12px / muted / letter-spacing 0.08em
- マイクロ（ヒント等）: 11-11.5px

### スペーシング

スケール：4, 6, 8, 10, 12, 14, 16, 18, 22, 28, 36, 48, 64

### ボーダー半径

- ボタン・入力: 4px
- カード・セクション: 6-8px
- フォン: 28px（外）、22px（中ベゼル）、18px（画面）
- スタイルごとのリッチメニューボタン: 4 / 6 / 8 / 10 / 14 / 16 / 18

### シャドウ

- プレビューフォン: `0 18px 40px -20px rgba(0,0,0,0.25)`
- ホバー上昇: `transform: translateY(-1px)`

---

## インタラクション仕様

| 動作 | トリガー | 効果 |
|---|---|---|
| テンプレート適用 | カードクリック | レイアウト・スロット全置換、`activeTemplateId` セット |
| スタイル変更 | スタイルカードクリック | `style` ステート更新 → プレビュー全体即時変更 |
| プリセット配置（クリック） | チップクリック | フォーカス中の空きスロット or 先頭の空きスロットに配置 |
| プリセット配置（ドラッグ） | チップを任意スロットにドロップ | スロットに配置（既存は上書き）|
| スロット削除 | スロット右上「×」 | 該当スロットを null に |
| スロットフォーカス | スロットクリック | 詳細編集パネル展開 |
| カテゴリフィルタ | カテゴリチップクリック | プリセット一覧をフィルタ |
| あいさつテンプレ適用 | テンプレカードクリック | `titleText` 更新、プレビュー即時反映 |
| 自由編集 | textarea変更 | `activeGreetingId` を null に、文字数カウント更新 |
| 空スロットのパルス | 常時 | `@keyframes pulse` でゴールド色のリング 1.8s ループ |

### CSSアニメーション

```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(180, 138, 85, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(180, 138, 85, 0); }
}
```

ホバートランジション：`transition: all 0.15s ease`

---

## ステート設計

```ts
interface State {
  layout: "hero-6" | "3x2" | "2x2" | "2x1" | "1x1";
  slots: (Slot | null)[];  // 長さはレイアウトのslot数
  focused: number | null;  // フォーカス中スロットindex
  categoryFilter: "すべて" | "予約" | "情報" | "特典" | "店舗" | "SNS";
  activeTemplateId: string | null;
  titleText: string;  // あいさつ文
  activeGreetingId: string | null;
  avatar: AvatarPreset;
  chatTitle: string;  // 店舗名
  style: RichMenuStyle;  // 10種のスタイル
}

interface Slot {
  presetId: string;     // PRESETから参照
  label: string;        // 表示ラベル（プリセット既定 or カスタム）
  url: string;          // URLまたは設定値
  action?: string;      // オーバーライド時のみ
}
```

派生値：
- `displaySlots`: 現在のレイアウトのslot数に合わせて `slots` をトリム/null詰めしたもの
- `usedPresetIds`: 現在使用中のプリセットID集合
- `filledCount`: 配置済みスロット数

---

## API連携（実装時の想定）

実装時は以下のエンドポイントが必要：

- `GET /api/line/rich-menu` — 現在の設定取得
- `POST /api/line/rich-menu/draft` — 下書き保存
- `POST /api/line/rich-menu/publish` — 公開（LINE Messaging API のリッチメニュー作成・適用）
- `GET /api/line/rich-menu/preview/:id` — 共有URL生成

LINE Messaging API のリッチメニュー仕様：
- size: 2500×1686px（大）/ 2500×843px（中）/ 1200×810px（小）
- areas: 各タップ可能領域の bounds（x, y, width, height） + action
- action タイプ: `uri` / `message` / `richmenuswitch` / `postback`

---

## アクセシビリティ

- すべてのインタラクティブ要素は `<button>` で実装
- カラーコントラスト：本文 7:1 以上を維持
- フォーカスリング：`outline: 1px solid var(--ink)` を text-input に設定
- ドラッグ操作はキーボードでも代替（クリックで配置可能）

---

## ファイル一覧

このフォルダには以下のファイルが含まれます：

- `リッチメニュー設定.html` — エントリーポイント（CSS変数、フォント読み込み、Reactルート）
- `data.jsx` — 全プリセット・テンプレート・スタイル・あいさつ文・アバターのデータ定義
- `components.jsx` — 再利用コンポーネント（Sidebar / TemplateCard / StyleCard / PresetChip / GridSlot / LayoutSwitch / Preview / AvatarCircle）
- `app.jsx` — メインアプリ（ステート管理 + レイアウト + イベントハンドラ）

ファイル内のコメントと CSS 変数を参考に、コードベースのデザインシステムへマッピングして実装してください。
