# SalonRink.com 画像差替/新設 — Claude Code 一括指示書

> 対象: 既存 salonrink.com LP（Next.js 想定）
> スコープ: **画像の差替/新設のみ**。テキスト・配列・文章・クラス名・id は一切変更禁止。
> 作成日: 2026.05.26
> 含まれる PATCH: **01 〜 06（Hero / Problem / Solution / For Everyone / In Action / AI Karte）**

---

## 0. はじめに

このドキュメントは **本日分の全画像差替指示** を1つにまとめたものです。
各 PATCH の詳細は個別ファイル（`PATCH-01-hero.md` 〜 `PATCH-06-ai-karte.md`）に記載済み。
本ファイルは Claude Code への引き渡し時の **マスター指示書** として使用してください。

---

## 1. 全体ルール（厳守）

1. **テキスト変更ゼロ**: 文字・コピー・数値・配列を一切変更しない
2. **DOM 構造維持**: 既存の要素を削除・並び替えしない（明示された装飾要素のみ削除可）
3. **クラス名・id 変更禁止**: 既存セレクタを変えない
4. **追加は `<Image>` のみ**: Next.js `next/image` を使用
5. **WebP 変換必須**: 元 PNG を WebP 化、`/public/images/{section}/` に配置
6. **alt 必須**: 装飾画像は `alt=""` + `aria-hidden="true"`、情報画像は具体的 alt
7. **モバイル対応**: 980px 以下では装飾画像を `display: none` で隠す
8. **コミット粒度**: 1セクション = 1コミット = 1PR
9. **完了報告**: 各 PR で `git diff` のテキスト変更ゼロを明示確認

---

## 2. ディレクトリ構成

```
public/images/
├── hero/
│   └── hero-salon-iphone.webp
├── problem/
│   └── problem-bg-salon.webp
├── solution/
│   ├── solution-bg-stylist.webp
│   └── solution-bottom-panel.webp
├── for-everyone/
│   ├── header-left-customer.webp
│   ├── header-right-staff.webp
│   ├── card1-customer.webp
│   ├── card2-staff.webp
│   └── card3-you.webp
├── in-action/
│   ├── scene1-tablet-woman.webp
│   ├── scene1-phone-woman.webp
│   ├── scene2-stylist-customer.webp
│   ├── scene2-stylist-man.webp
│   ├── scene3-tablet-pair.webp
│   ├── scene3-consult-smile.webp
│   ├── scene4-counter-consult.webp
│   └── scene4-wave-goodbye.webp
└── ai-karte/
    ├── karte-hero-color-palette.webp
    ├── feat1-tablet-pair.webp
    ├── feat2-color-palette.webp
    └── feat3-tablet-three.webp
```

**合計**: 21枚（元データは `lp/assets/{section}/` から WebP 変換）

---

## 3. PATCH 一覧 & 実装順序

実装は **上から順に1セクションずつ** 行う。各 PATCH の詳細は個別ファイル参照。

| 順 | PATCH ID | セクション | 画像点数 | 詳細 |
|---|---|---|---|---|
| 1 | 01 | Hero | 1 | `lp/PATCH-01-hero.md` |
| 2 | 02 | Problem | 1 | `lp/PATCH-02-problem.md` |
| 3 | 03 | Solution | 2 | `lp/PATCH-03-solution.md` |
| 4 | 04 | For Everyone | 5 | `lp/PATCH-04-for-everyone.md` |
| 5 | 05 | In Action Scene 01/02 | 4 | `lp/PATCH-05-in-action.md` |
| 6 | 05b | In Action Scene 03/04 | 4 | `lp/PATCH-05b-in-action-3-4.md` |
| 7 | 06 | AI Karte | 4 | `lp/PATCH-06-ai-karte.md` |

---

## 4. セクション別 サマリー

### PATCH-01 / Hero
- **削除**: `.phone-area` 内の `.bubble` × 3 と `.phone` 全体
- **追加**: `.phone-area` に `<Image>` 1つ（実写画像 — iPhone+吹き出しが焼き込み済み）
- **画像**: `hero-salon-iphone.webp`（1672×941）

### PATCH-02 / Problem
- **追加**: `<section id="problem">` 直下に背面装飾画像 `<Image>` 1つ
- **CSS**: `.problem__bg` 絶対配置 + `::before` 白オーバーレイ
- **画像**: `problem-bg-salon.webp`（1537×1023）

### PATCH-03 / Solution
- **追加A**: `<section class="sol">` 直下に背面画像 `<Image>` 1つ
- **置換B**: `.sband` の中身（`.sband__hd` + `.sband__items`）を `<Image>` 1つに差替
- **画像**: `solution-bg-stylist.webp` + `solution-bottom-panel.webp`
- **注意**: 下部パネル画像化により alt にパネル内全文を記載済み

### PATCH-04 / For Everyone
- **追加A・B**: `.everyone__head` 左右に装飾画像 ×2
- **追加C・D・E**: 3カード `.ecard__top` に各人物写真 ×3
- **削除可**: `.deco-l` / `.deco-r` の緑ドット装飾（任意）
- **画像**: 5点

### PATCH-05 / In Action Scene 01/02
- **追加**: Scene 01 と 02 の `.scene` の最初と最後に `<Image>` ×2、計 ×4
- **CSS**: `.scene__photo / .scene__photo--l / .scene__photo--r` 新規定義
- **モバイル**: 写真を `display: none`
- **画像**: 4点

### PATCH-05b / In Action Scene 03/04
- **追加**: Scene 03 と 04 にも同パターンで `<Image>` ×4
- **CSS**: PATCH-05 で定義済みの `.scene__photo` を再利用
- **画像**: 4点

### PATCH-06 / AI Karte
- **追加**: `.karte__head` と `.karte__main` の間にメインビジュアル ×1
- **追加**: 3つの `.karte__feat` 右上に円形人物写真 ×3
- **画像**: 4点

---

## 5. 共通 CSS パターン

### 背面装飾画像（Problem / Solution で使用）
```css
.{section}__bg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0; opacity: 0.45 〜 0.55;
  pointer-events: none;
}
.{section}::before {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,.85));
  z-index: 0;
}
.{section} .sr-container { position: relative; z-index: 1; }
```

### 装飾人物写真（In Action で使用）
```css
.scene { position: relative; }
.scene__photo {
  position: absolute; top: 50%; transform: translateY(-50%);
  height: 100%; width: auto; object-fit: contain;
  pointer-events: none; z-index: 0; opacity: 0.92;
}
.scene__photo--l { left: -120px; max-width: 260px; }
.scene__photo--r { right: -100px; max-width: 320px; }
.scene__body, .scene__dot, .scene__phone { position: relative; z-index: 1; }
@media (max-width: 980px) { .scene__photo { display: none; } }
```

### 円形小型写真（AI Karte / For Everyone カードで使用）
```css
.{component}-photo {
  width: 64px; height: 64px;
  border-radius: 50%; object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(15,22,20,0.08);
}
```

---

## 6. 実装プロセス（推奨手順）

```
1. ブランチ作成: feature/lp-images-patch-{01..06}
2. PATCH-NN.md を読み、該当セクションファイルを特定
3. 元 PNG を /public/images/{section}/ に WebP 変換配置
   例: cwebp -q 82 source.png -o output.webp
4. JSX 修正（<Image> 追加 + 必要最小限 CSS）
5. ローカル確認:
   - PC / モバイル両方
   - 既存テキストが1文字も変わっていないこと
6. git diff レビュー → コミット
7. PR 作成 → レビュー → マージ
8. 次の PATCH へ
```

---

## 7. 完了時の報告フォーマット

各 PATCH 完了時、以下を Claude Code から報告：

```markdown
## PATCH-{NN} 完了報告

### 修正ファイル
- app/_sections/{Component}.tsx
- app/globals.css（または該当 CSS）

### 追加画像
- public/images/{section}/{file1}.webp (NNN KB)
- ...

### diff サマリー
- 追加行: NN 行
- 削除行: NN 行
- テキスト変更: **0 件** ✅

### Lighthouse
- LCP: X.Xs (前回比 ±X.Xs)
- CLS: X.XX
- 合計 KB: 前 NNN → 後 NNN

### 確認事項
- [x] テキスト・配列・文章が全て元のまま
- [x] モバイルで画像が適切に表示/非表示
- [x] alt 属性すべて設定済み
- [x] WebP 変換済み
```

---

## 8. 留意事項

### アクセシビリティ
- **PATCH-03 下部パネル画像化** によりパネル内文字が読み上げ不能。alt に全文記載で代替。
  将来的に HTML テキスト化が望ましい（コピー変更しないこと前提）。

### 画像最適化
- 元 PNG 合計 約 8MB → **WebP 変換後 1.5MB 以下を目標**
- `quality 82` 程度を推奨
- Hero のメイン画像のみ `priority` 指定（LCP対策）

### モバイル対応の方針
- 装飾画像（背景・サイド写真）は 980px 以下で非表示
- カード内の機能写真は縮小して表示維持
- Hero の実写画像はモバイルでも維持（コンテンツの一部）

### 未対応セクション
- 07 NUMBERS / 08 CASE 01 / 09 ONBOARDING / 10 COMPARE → 写真受領後に PATCH-07 〜 10 を別途発行
- 既存維持セクション（VIDEO TOUR / INTEGRATIONS / PLANS / FAQ / 最終CTA）→ 別途指示

---

## 9. Claude Code への引き渡しプロンプト

```
SalonRink.com の LP に、添付の PATCH-01〜PATCH-06 に沿って画像のみを差替/追加してください。

【入力ファイル】
- lp/MASTER_INSTRUCTIONS.md（本ドキュメント）
- lp/PATCH-01-hero.md
- lp/PATCH-02-problem.md
- lp/PATCH-03-solution.md
- lp/PATCH-04-for-everyone.md
- lp/PATCH-05-in-action.md
- lp/PATCH-05b-in-action-3-4.md
- lp/PATCH-06-ai-karte.md
- lp/assets/{section}/ 配下の元画像

【厳守】
- テキスト・配列・文章・クラス名・id は一切変更禁止
- DOM 構造は PATCH で明示された範囲のみ変更可
- 各 PATCH を 1コミット 1PR で実装（合計 7PR）
- PR ごとに git diff にテキスト変更ゼロを確認

【手順】
1. 元 PNG を /public/images/{section}/ に WebP 変換配置
2. PATCH 順（01 → 02 → 03 → 04 → 05 → 05b → 06）で実装
3. 各 PATCH 完了時に「完了報告」フォーマットで報告
4. すべて完了したら統合確認

不明点は必ず実装前に確認してください。
```

---

## 10. ファイル一覧

```
lp/
├── MASTER_INSTRUCTIONS.md       ← 本ファイル
├── PATCH-01-hero.md
├── PATCH-02-problem.md
├── PATCH-03-solution.md
├── PATCH-04-for-everyone.md
├── PATCH-05-in-action.md
├── PATCH-05b-in-action-3-4.md
├── PATCH-06-ai-karte.md
├── IMAGE_ONLY_PATCH_GUIDE.md    ← 全体方針（参考）
├── PROGRESS_SUMMARY.md          ← 進捗管理
└── assets/                      ← 元画像（PNG）
    ├── hero/
    ├── problem/
    ├── solution/
    ├── for-everyone/
    ├── in-action/
    └── ai-karte/
```
