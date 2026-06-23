# Handoff: SalonRink Landing Page (salonrink.com 改定)

## Overview

**SalonRink** は、美容室向けのAIカルテSaaS（Beauty CRM for Salons）。
このパッケージは salonrink.com のリニューアル版ランディングページの **デザインリファレンス** です。

主要な訴求軸：
- 「AI × カルテ × LINE」で美容室のカウンセリング・カルテ業務を支援
- LINEだけで完結する顧客体験
- 初期費用 ¥3,000（SNS共有で無料）／最短契約期間なし
- ベータ版として先着サロン募集中

ページ構成（上から順に）：
1. **Nav** — 固定ヘッダー（ロゴ／ナビゲーション／LINE CTA）
2. **Hero** — フルブリードのメインビジュアル＋見出し＋LINEチャットモック
3. **CounterStrip** — 「ベータ版として運用中・先着サロン募集」帯
4. **Problem** — サロン現場の課題（メイン1枚 + サブ2枚 + CTA）
5. **Solution / Features** — 機能紹介（bento layout）
6. **Steps** — 導入の3ステップ
7. **Plans / Pricing** — 料金プラン
8. **Compare** — 他サービスとの比較表
9. **Cases** — 導入事例
10. **VIDEO TOUR** — 「90秒で分かる、SalonRink。」動画 + 「担当者によるオンラインデモを予約」CTA
11. **ROI Calculator** — 売上シミュレーター
12. **FAQ**
13. **Lead Banner / Footer CTA**
14. **Footer**

---

## About the Design Files

このバンドル内の `index.html` / `styles.css` / `parts/*.jsx` などは **HTMLで作られたデザインリファレンス（プロトタイプ）** です。
最終的な見た目と挙動を示すためのモックであり、**そのまま本番コードとして配信することを意図したものではありません**。

タスクは、これらのデザインを **対象コードベースの既存環境（Next.js / Astro / Nuxt / WordPress テーマ等）** で再構築することです。
既存のフレームワーク／コンポーネントライブラリ／CSS設計（Tailwind, CSS Modules, styled-components 等）を尊重しつつ、ピクセル忠実に再現してください。

もしリポジトリがまだない場合は、SEO とパフォーマンスを考慮して **Next.js (App Router) + Tailwind CSS** または **Astro** を推奨します。

### 動作確認方法
ローカルで開く場合：
```bash
cd design_handoff_salonrink_lp
python3 -m http.server 8080
# → http://localhost:8080
```
（Babelスタンダロンを使っているため `file://` 直接開きでは動きません。）

---

## Fidelity

**High-fidelity (hifi)**

色・タイポグラフィ・余白・アニメーションは最終形です。
ピクセル忠実に再現してください。
ただし **本番実装では Babel スタンダロンは使わない** こと（パフォーマンス上の理由）。
JSXは事前ビルド（Vite / Next.js / Astro 等）してください。

---

## Design Tokens

`styles.css` の `:root` に CSS 変数として定義されています。すべてここから抜粋。

### Colors（ライトモード — デフォルト）
| トークン | 値 | 用途 |
|---|---|---|
| `--c-bg` | `#faf6f1` | ページ背景（クリームベージュ） |
| `--c-bg-2` | `#f3ece1` | セクション背景（やや濃いベージュ） |
| `--c-bg-card` | `#ffffff` | カード／パネル背景 |
| `--c-fg` | `#1f1a14` | 本文最濃 |
| `--c-fg-2` | `#3a322a` | 本文濃 |
| `--c-fg-3` | `#6b6256` | 本文中（補助テキスト） |
| `--c-fg-4` | `#a39888` | 本文淡（プレースホルダ等） |
| `--c-border` | `#e8ddcc` | 通常ボーダー |
| `--c-border-2` | `#f0e6d6` | 弱ボーダー |
| `--c-accent` | `#c8a366` | アクセント（金茶） |
| `--c-accent-2` | `#b08a4a` | アクセント濃（hover/active） |
| `--c-accent-soft` | `#f3e7d2` | アクセント極淡背景 |
| `--c-on-accent` | `#ffffff` | アクセント上の文字 |
| `--c-danger` | `#b85450` | エラー／警告 |

### Colors（ダークモード — `[data-theme="dark"]`）
| トークン | 値 |
|---|---|
| `--c-bg` | `#1a1612` |
| `--c-bg-2` | `#221c16` |
| `--c-bg-card` | `#221c16` |
| `--c-fg` | `#f5ede0` |
| `--c-fg-2` | `#d8cdb9` |
| `--c-fg-3` | `#9d927f` |
| `--c-fg-4` | `#6b6253` |
| `--c-border` | `#322a21` |
| `--c-border-2` | `#28221b` |
| `--c-accent-soft` | `#2d2415` |

### Accent variations（`[data-accent="..."]`）
- `line` → `--c-accent: #06c755` （LINEグリーン）
- `mono` → `--c-accent: #1f1a14` （モノトーン）

### Typography
| トークン | 値 |
|---|---|
| `--f-display` | `"Shippori Mincho", "Noto Serif JP", serif` |
| `--f-body` | `"Noto Sans JP", system-ui, sans-serif` |
| `--f-num` | `"Cormorant Garamond", "Shippori Mincho", serif` |

Google Fonts インポート：
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Shippori+Mincho:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
```

### Type scale
| クラス | 値 |
|---|---|
| `.h1` | `clamp(34px, 8vw, 64px)` / weight 500 / `--f-display` |
| `.h2` | `clamp(26px, 5.4vw, 44px)` / weight 500 / `--f-display` |
| `.h3` | `clamp(18px, 2.8vw, 22px)` / weight 500 / `--f-display` |
| `.lede` | `clamp(14px, 2.1vw, 16px)` / line-height 1.95 |
| `.eyebrow` | 13px / letter-spacing 0.32em / uppercase / `--f-num` |
| `.num` | `--f-num` / weight 500 / `font-feature-settings: "tnum","lnum"` |

### Radius
| トークン | 値 |
|---|---|
| `--r-md` | 12px |
| `--r-lg` | 18px |
| `--r-xl` | 24px |

### Layout
| トークン | 値 |
|---|---|
| `--max-w` | 1200px |
| `--pad-x` | 20px |
| `--section-y` | 80px（comfortable） |

Density variants：`compact: 56px` / `comfortable: 80px` / `spacious: 120px`

### Buttons
- `.btn` — height 52px (lg) / 42px (sm) / radius 999px / weight 600
- `.btn-primary` — bg `--c-accent` / text `--c-on-accent`
- `.btn-line` — LINE風 緑ボタン（`<span class="btn-line-icon">L</span>` を内包）
- `.btn-ghost` — 透明背景＋ボーダー

---

## Screens / Sections の詳細

### 1. Nav（`parts/hero.jsx` 内 `Nav`）
- 固定（`position: sticky; top: 0`）／背景は `color-mix(--c-bg 86%, transparent)` ＋ `backdrop-filter: blur(14px)`
- 左：ロゴ「SalonRink.com」（.com部分は `--f-num` のイタリック金茶）
- 中央：ナビゲーションリンク（768px以上で表示）— 機能 / 導入 / プラン / 料金 / FAQ
- 右：「LINEでデモを見る」ボタン（btn-line, sm）

### 2. Hero（`parts/hero.jsx` 内 `Hero`）
- フルブリード `<img class="hero-bg-img" src="assets/hero-main.png">`
- 左に重ねて：eyebrow / h1 / lede / 3つの checkrow / プライマリCTA + ゴーストCTA
- 右：iPhoneベゼル風コンテナ内にLINEチャットモック（`ChatMockMini`）
  - 5ステップで順次 `setStep(i)` してメッセージ／チップ／AIまとめカードがフェードイン
- h1のハイライト語は `<span className="hero-headline-mark">` で下線風マーカー（`--c-accent` の半透明）

#### Hero variants（`heroIdx` で切り替え）
0. 「ちゃんと、向き合える。その**カウンセリング**、AIがそっと支えます。」
1. 「美容師とお客様を、一生でつなぐ。」
2. 「いつもの、その先へ。」

### 3. CounterStrip
- 中央寄せの細い帯
- `.pulse-dot`（脈打つドット）+「現在 ベータ版として運用中・先着サロン募集」

### 4. Problem（`parts/middle.jsx`）
- メインカード `.prob-main`：左にh3＋本文、右に画像（4:5）／900px以上で2カラム
- サブカード `.prob-sub` ×2：同様の構成・小サイズ
- 下部CTA `.prob-cta`：金茶のテキストリンク調

### 5. Features / Solution
- bento layout `.feat-bento`
- グリッド型の `.feat-cell`（タイトル＋説明＋アイコン）

### 6. Steps
- 3カードの横並び（`.step-card`）
- 各カードに左上の番号バッジ（`--f-num`、円形）

### 7. Plans
- `.plan` カード ×複数
- 月額表示は `--f-num` のラージサイズ
- 強調プランは `.plan--featured` などで枠を強める

### 8. Compare table
- `.compare-wrap` / `.compare-table`
- ヘッダーは `--f-display`、SalonRink列だけ強調背景

### 9. Cases
- `.case` カード（画像＋タグ＋h3＋数値KPI ×2）
- 数値は `--c-accent-2`（金茶濃）

### 10. VIDEO TOUR — `parts/extra.jsx` 内
- eyebrow「VIDEO TOUR」
- h2「90秒で分かる、SalonRink。」
- `.video-frame`（aspect-ratio 16/9, radius `--r-xl`, bg `#1a1612`）に `<video src="assets/video-tour.mp4" autoPlay muted loop playsInline>`
- 下に中央寄せ `.btn-ghost`「担当者によるオンラインデモを予約 →」

### 11. ROI Calculator
- `.roi-card`：左に入力スライダー、右に大きな結果表示
- 入力：客数／単価／リピート率
- 大数値は `--f-num` clamp(48px, 10vw, 84px) / `--c-accent-2`

### 12. FAQ
- アコーディオン（`<details>` ベース）

### 13. Lead Banner（フッター直前）
- `.lead-banner`：暗背景（`--c-fg`）＋クリーム文字
- h3 + LINE CTA

### 14. Footer
- 4列リンク + ロゴ + コピーライト

---

## Interactions & Behavior

### アニメーション
- **FadeUp**（`parts/shared.jsx`）：IntersectionObserver で entry 時に `opacity 0→1 / translateY(16px→0)` over 700ms。`delay` プロップ対応。
- **AnimatedNum**：数値カウントアップ。
- **ChatMockMini**：マウント後 600ms から 5段階で順次表示（各 700-900ms間隔）。
- **pulse-dot**：CSS `@keyframes pulse` で 2s ループ。
- **.btn:active**：`transform: scale(0.98)`。

### CTA
すべてのCTAボタンの `onClick` は最終的に **公式LINE友だち追加URL** に飛ばす想定。
モックでは `onCta` プロップを通じて `app.jsx` の共通ハンドラへ。
本番では環境変数 `NEXT_PUBLIC_LINE_URL` 等で管理推奨。

### レスポンシブ
- 主要ブレークポイント：768px（ナビ表示）／900px（split / prob-main の2カラム化）
- モバイルファースト
- Hero画像：モバイルでは下にグラデーションでフェード、デスクトップでは左→右にフェード

### Tweaks（プロトタイプ専用）
`tweaks-panel.jsx` はデザイン検証用の在席ツール（ライト／ダーク、フォント、密度、アクセントカラー切替）。
**本番には不要** なので移植時は削除してください。

---

## State Management

このページは静的LPで、サーバー状態はほぼ持ちません。本番で必要になりそうな state：

| 用途 | 推奨 |
|---|---|
| FAQ アコーディオン | ローカルstate / `<details>` |
| ROI スライダー | コンポーネント内 `useState` |
| LINE CTA URL | 環境変数 |
| Hero variant | 不要（1つに固定でOK） |
| ダークモード切替 | 不要（Tweaksはプロトタイプ専用） |

データ取得が必要な可能性：
- **導入事例（Cases）** を CMS 化したい場合 → microCMS / Contentful / Notion API 等
- **FAQ** を CMS 化したい場合 → 同上

---

## Assets

すべて `assets/` ディレクトリにあります。

| ファイル | 用途 |
|---|---|
| `hero-main.png` | Heroのフルブリード背景（美容室の風景） |
| `video-tour.mp4` | VIDEO TOUR セクションの動画（10.6MB／要圧縮） |
| `dashboard-demo.mp4` | ダッシュボードのデモ動画 |
| `ba-before.png` / `ba-after.png` | ビフォーアフター画像 |
| `icon-brain.png` / `icon-folder.png` / `icon-chart.png` / `icon-lock.png` | 機能セクション用アイコン |

### 本番化での注意
- `video-tour.mp4` は **約10.6MB** あります。HandBrake等で **3〜5MB** に圧縮することを推奨（720p / CRF 28 程度）。
- すべての画像は **next/image** または **astro:assets** 経由で配信し、適切なサイズ／フォーマット（WebP/AVIF）に変換してください。
- 動画はLCPに影響するので `preload="metadata"` ＋ `poster` 属性を必ず設定。

### アイコン
インラインSVGの `Icon` コンポーネント（`parts/shared.jsx` 内）が独自定義されています。
本番では **lucide-react** や **heroicons** に置き換え可能。同等の名前と stroke パターンを採用しています。

---

## Files in this bundle

| パス | 役割 |
|---|---|
| `index.html` | エントリ。Google Fonts読込＋スクリプトの順序定義 |
| `styles.css` | 全スタイル（CSS変数＋コンポーネントクラス）。約1500行 |
| `app.jsx` | ルート React コンポーネント（プロトタイプ用、ファイル末尾） |
| `parts/shared.jsx` | `Icon` / `FadeUp` / `AnimatedNum` 等の共通コンポーネント |
| `parts/hero.jsx` | `Nav` / `Hero` / `ChatMockMini` / `CounterStrip` |
| `parts/middle.jsx` | Problem / Solution セクション |
| `parts/lower.jsx` | Steps / Plans / Compare |
| `parts/bottom.jsx` | Cases / FAQ / Footer |
| `parts/extra.jsx` | VIDEO TOUR / ROI / Lead Banner |
| `parts/app.jsx` | セクションの組み立て |
| `tweaks-panel.jsx` | **プロトタイプ専用**。本番には不要 |
| `image-slot.js` | **プロトタイプ専用**。画像差し替え用Web Component。本番には不要 |
| `assets/` | 画像・動画 |

---

## 推奨実装ステップ

1. **デザイントークンの移植**
   - `styles.css` の `:root` 変数を Tailwind の `theme.extend` または CSS変数として再定義
   - フォントを `next/font` 経由でセルフホスト（CLS対策）

2. **共通コンポーネントの実装**
   - `Button` / `Container` / `Section` / `Eyebrow` / `H1〜H3` / `Card` / `Checkrow`
   - `FadeUp` は `framer-motion` の `whileInView` で代替可能

3. **セクションごとに上から実装**
   - Nav → Hero → CounterStrip → Problem → ... → Footer の順
   - Hero の `ChatMockMini` だけは少し作り込みが必要（5ステップの逐次表示）

4. **アセットの最適化**
   - 動画を圧縮（10MB → 3-5MB）
   - 画像をWebP/AVIF化

5. **CTA URL の環境変数化**
   - `NEXT_PUBLIC_LINE_URL` 等で本番／検証を切替

6. **計測**
   - Google Tag Manager / GA4 / Microsoft Clarity 等の埋め込み
   - CTAクリックイベントを発火

7. **SEO**
   - `<title>` / `<meta description>` / OGP / 構造化データ（Organization, Product）
   - sitemap.xml / robots.txt

---

## 連絡事項

- **ブランド名表記**：「SalonRink」（小文字 r ではなく **R**。RinkはRink ＝ つながりの輪、を意図）
- **トーン**：上品・落ち着き・編集的（editorial）。情報過多にしない。
- **NG**：派手なグラデーション／絵文字／カジュアルすぎる文体
- **OK**：明朝体の見出し／余白を活かしたレイアウト／ベージュ × 金茶のパレット

何か不明点があれば、デザインリファレンス（このバンドル）の該当ファイル名と行番号を指定して質問してください。
