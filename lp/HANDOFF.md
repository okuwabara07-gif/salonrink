# SalonRink.com — リデザイン実装 指示書 (HANDOFF.md)

> 対象: Claude Code（または別の実装担当）
> 目的: 現行 salonrink.com に、本モックアップの新デザイン10セクションを反映する
> 作成日: 2026.05.23 / 作成: SalonRink Design Team

---

## 0. プロジェクト要約

現行 salonrink.com を **新デザイン10セクション**（添付LP画像準拠）に置き換える。
添付画像になかったセクション（VIDEO TOUR / INTEGRATIONS / PLANS / FAQ / 最終CTA）は **既存実装を維持** し、ビジュアル言語のみ新トーンに揃える。

### 主要メッセージの転換
- **旧**: 顧客向けの「専属コンシェルジュ」表現
- **新**: サロンオーナー / スタッフ向けの **業務支援ツール** としての立ち位置
- **新**: 「LINEを置き換えない、LINEに**乗せる**」

---

## 1. ファイル構成

```
lp/
├── index.html                  ← セクション一覧（実装時は不要）
├── HANDOFF.md                  ← この文書
├── COPY_DICTIONARY.md          ← コピー辞書
├── shared/
│   └── tokens.css              ← デザイントークン（全セクション共有）
├── 01_hero.html
├── 02_problem.html
├── 03_solution.html
├── 04_for_everyone.html
├── 05_in_action.html
├── 06_ai_karte.html
├── 07_numbers.html
├── 08_case.html
├── 09_onboarding.html
└── 10_compare.html
```

各 `NN_xxx.html` は独立で開ける完結ファイル。底部にレビュー用の `<div class="sr-meta">` ブロックがあるが、**本実装では削除**してよい。

---

## 2. デザイントークン

`lp/shared/tokens.css` に全変数を集約。Next.js / Tailwind 構成なら、これを `globals.css` または `tokens.css` として取り込み、必要に応じて Tailwind theme に展開する。

### Colors
| 役割 | 変数 | 値 |
|---|---|---|
| 主要テキスト | `--ink` | `#0f1614` |
| 副テキスト | `--ink-2` | `#3a4340` |
| 補助テキスト | `--ink-3` | `#6b746f` |
| 白背景 | `--bg` | `#ffffff` |
| 交互背景 | `--bg-tint` | `#f6f9f6` |
| 入れ子背景 | `--bg-soft` | `#f0f4f0` |
| 境界線 | `--line` | `#e6ebe7` |
| **アクセント** | `--accent` | `#06C755`（LINE green） |
| アクセント濃 | `--accent-dk` | `#05a648` |
| アクセント淡 | `--accent-soft` | `#e6f7ec` |
| アクセント文字 | `--accent-ink` | `#054d22` |
| コーラル | `--coral` | `#D85A30` |
| コーラル淡 | `--coral-soft` | `#fbe9e1` |

### Typography
- **見出し / Serif**: `"Noto Serif JP"` Weight 500-700
- **本文 / Sans**: `"Noto Sans JP"` Weight 400-700
- **数字・タグ / Mono**: `"JetBrains Mono"` Weight 400-600

`<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">`

### Radius / Shadow
- `--radius-sm: 10px / --radius: 14px / --radius-lg: 22px / --radius-xl: 28px`
- `--shadow-sm`（カード）/ `--shadow-md`（強調）/ `--shadow-lg`（モーダル）

---

## 3. セクション別 実装方針

### 共通
- すべてのセクションは `<section id="...">` 単位で実装し、ページ全体の縦並びとする
- 各セクション内のレイアウトは **CSS Grid + Flexbox** で構築
- アイコンは **inline SVG** で実装（外部依存ゼロ）
- 全セクション、ブレイクポイント `980px` で 1カラムに落とす
- アニメーション: スクロール時の fade-in（IntersectionObserver）程度を推奨。過度な装飾は避ける

### 01_hero.html — ファーストビュー
- 左カラム: コピー + 3 stat card + チェック3項目 + CTA2つ
- 右カラム: iPhoneモック（LINEトーク画面）+ フローティング吹き出し3つ
- **モバイル**: 縦並び（画像 → コピー → CTA の順）
- ナビは `position: sticky` + `backdrop-filter: blur`
- LINE トーク部分は実装時に **実画像差替推奨** (`/images/hero/line-chat.png` 等)

### 02_problem.html
- 3カラムのカードグリッド + 下部に共感バンド
- カード内の demo（チャット風 / リスト風）は装飾なので簡略化可
- 「あなたのサロンにも、こんなお悩みは？」バンドは4項目チェックリスト

### 03_solution.html
- 2カラム（左: いつものLINE / 右: SalonRink）+ 中央矢印
- 各カラム内に機能タグ + 説明（4項目）
- モバイル時、矢印は90度回転

### 04_for_everyone.html
- 3カラム（顧客 / スタッフ / オーナー）
- 各カードトップに大数字 + ピル
- オーナーカード内のミニiPhone モックは保持

### 05_in_action.html
- 縦タイムライン（中央線 + 左右交互配置）
- 4シーン: 朝サマリー / 予約 / カルテ呼出 / 配信提案
- iPhoneモックは各シーン固有のUI（テンプレ化推奨）

### 06_ai_karte.html
- 2カラム + 中央 `AI` ピル
- 左: チャット履歴スクロール / 右: 構造化されたカルテカード
- 下部に3つの機能カード（横並び）

### 07_numbers.html
- 3カラム（+28% / +18% / −42%）
- 中央カードのみ `featured` で強調
- 各カード内にミニチャート（折れ線 / 棒 / 時間アイコン）

### 08_case.html
- 大カード1枚（写真 + コメント + Before/After + 4指標 + タイムライン）
- 写真は実装時に実画像差替（`/images/case/lumiere.jpg`）
- 4指標バーは均等 grid

### 09_onboarding.html
- 4ステップ横並び（背後にコネクタ線）
- 下部CTA帯（背景グラデ + アクセントボーダー）

### 10_compare.html
- 3列比較表（予約SaaS / **SalonRink** / CRM）
- 中央列のみ `featured` 背景 + ピル
- モバイル時はカード型に折り畳み

---

## 4. 既存セクションとの統合

新セクションの挿入順（推奨）:

```
[Hero 01]
[Problem 02]
[Solution 03]
[FOR EVERYONE 04]
[VIDEO TOUR]              ← 現行維持
[IN ACTION 05]
[AI KARTE 06]
[NUMBERS 07]
[CASE 01 08]
[INTEGRATIONS]            ← 現行維持
[ONBOARDING 09]
[COMPARE 10]
[PLANS]                   ← 現行維持・コピー調整
[FAQ]                     ← 現行維持・コピー調整
[START FREE / CTA]        ← Section 09 / 10 と CSS統一
[Footer]                  ← 現行維持
```

### 既存セクションの調整事項
- **PLANS / FAQ**: コピーから「専属コンシェルジュ」表現を排除し、`COPY_DICTIONARY.md` の置換表に従う
- **VIDEO TOUR / INTEGRATIONS**: 背景色を `--bg` / `--bg-tint` 交互に揃える
- **START FREE**: Section 09 末尾の CTA 帯と同デザインに統一

---

## 5. 実装スタック想定

- **Next.js (App Router) + TypeScript**
- 各セクションを `app/_sections/Hero.tsx` 〜 `Compare.tsx` として分離
- 画像は `next/image` で最適化
- フォントは `next/font/google` で読み込み（self-hosted推奨）

### コンポーネント階層案

```
app/
├── page.tsx              ← セクションを並べるだけ
├── _sections/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── Problem.tsx
│   ├── Solution.tsx
│   ├── ForEveryone.tsx
│   ├── InAction.tsx
│   ├── AiKarte.tsx
│   ├── Numbers.tsx
│   ├── Case.tsx
│   ├── Onboarding.tsx
│   ├── Compare.tsx
│   └── Footer.tsx
├── _components/
│   ├── Eyebrow.tsx       ← .sr-eyebrow 相当
│   ├── SectionHead.tsx
│   ├── Button.tsx        ← .sr-btn 相当
│   ├── StatCard.tsx
│   ├── PhoneMock.tsx     ← 共通の iPhone モックフレーム
│   └── ChatBubble.tsx
└── globals.css           ← tokens.css をここに取り込む
```

---

## 6. 画像 / アセット指示

すべての画像はモックでは CSS グラデーションのプレースホルダー。
実装時に下記の差替が必要:

| パス | 用途 | サイズ目安 |
|---|---|---|
| `/images/hero/line-chat.png` | Hero 右カラム LINEトーク（実画面でも可） | 320×660 |
| `/images/everyone/customer.jpg` | Customer カード写真 | 220×260 |
| `/images/everyone/staff.jpg` | Staff カード写真 | 220×260 |
| `/images/case/lumiere.jpg` | Case 01 ヒーロー写真 | 720×640 |
| `/images/ai-karte/karte-photo.jpg` | カルテ内サンプル写真 | 140×170 |

アイコンはすべて inline SVG。**Lucide / Heroicons** を使う場合も色は `currentColor` で実装し、デザイントークンで制御。

---

## 7. アニメーション / インタラクション仕様

| 場所 | 動作 |
|---|---|
| ナビ | スクロールで `backdrop-filter` の不透明度が上がる（任意） |
| 各セクション見出し | `IntersectionObserver` で fade-in + 8px上方移動 |
| ヒーロー stat card | 順に 100ms ずつ遅延して fade-in |
| Numbers 数字 | スクロール到達で `0 → 値` へカウントアップ（任意） |
| 比較表行 | hover で背景 `var(--bg-tint)` |
| ボタン | `:hover` で 1.5px translate-y + shadow 強化 |

スクロール連動アニメは **モバイルでは無効化** してパフォーマンス確保。

---

## 8. アクセシビリティ要件

- すべての `<img>` に `alt` を付与（装飾は `alt=""`）
- フォーカスリングは `:focus-visible` で 2px solid `var(--accent)`
- カラーコントラスト: 本文は WCAG AA を満たす（`--ink` on `--bg` = 16.8:1 OK）
- 比較表は `<table>` + `<th scope>` で実装、CSS でカード見せ可
- アニメーションは `prefers-reduced-motion` で無効化

---

## 9. SEO / メタ

- `<title>`: `SalonRink Concierge — LINE公式アカウント拡張サロン業務システム`
- `<meta name="description">`: 120字以内、`COPY_DICTIONARY.md` の指定文を使用
- OGP 画像は Hero 右カラム LINEトークの再現を推奨
- 構造化データ: `SoftwareApplication` schema を `page.tsx` 内に埋め込み

---

## 10. 引き渡し成果物

| ファイル | 用途 |
|---|---|
| `lp/01_hero.html` 〜 `10_compare.html` | 各セクション モックアップ（独立HTML） |
| `lp/shared/tokens.css` | 全セクション共有デザイントークン |
| `lp/HANDOFF.md` | この文書 |
| `lp/COPY_DICTIONARY.md` | コピー辞書 / 用語統一表 / 置換表 |
| `lp/index.html` | レビュー用一覧（実装不要） |

---

## 11. Claude Code への実装プロンプト テンプレ

> 下記をそのまま Claude Code に貼り付けて使えます。

```
SalonRink.com の LP を、添付モックアップに沿って Next.js (App Router) で再実装してください。

【入力】
- lp/HANDOFF.md … 実装仕様書
- lp/COPY_DICTIONARY.md … コピー辞書
- lp/shared/tokens.css … デザイントークン
- lp/01_hero.html 〜 10_compare.html … 各セクション モックアップ

【要件】
1. 各セクションを app/_sections/ 配下の単一ファイルとして実装
2. tokens.css は globals.css に取り込み、Tailwind theme としても展開
3. アイコンは inline SVG (Lucide推奨)
4. 画像はすべて next/image、現状はプレースホルダー /images/placeholder.png を使用
5. アニメーションは IntersectionObserver で fade-in + 8px translate-Y
6. レスポンシブブレイクポイント: 980px
7. すべて TypeScript / strict mode

【既存維持セクション】
VIDEO TOUR / INTEGRATIONS / PLANS / FAQ / 最終CTA は現行実装を再利用し、
COPY_DICTIONARY.md の置換表に従ってコピーのみ調整。

【セクション順序】
Nav → Hero(01) → Problem(02) → Solution(03) → ForEveryone(04) →
VideoTour(現行) → InAction(05) → AiKarte(06) → Numbers(07) →
Case(08) → Integrations(現行) → Onboarding(09) → Compare(10) →
Plans(現行) → Faq(現行) → CTA(現行) → Footer(現行)

実装手順:
1. tokens.css を globals.css に取り込み + Tailwind theme 設定
2. 共通コンポーネント (Eyebrow, SectionHead, Button, PhoneMock) を実装
3. セクション01〜10を順に実装
4. 既存セクションのコピーを置換表に従って更新
5. 全ページを統合し、スクロール挙動・アニメ・モバイル表示を最終確認
```

---

## 12. レビューと QA

- 各セクション完了ごとに、対応する `lp/NN_xxx.html` と並べてピクセル差確認
- 主要なブレイクポイント: 1440 / 1280 / 980 / 414 / 390
- iOS Safari / Android Chrome / Mac Chrome / Mac Safari の4ブラウザ確認

質問・追加要件は SalonRink Design Team まで。
