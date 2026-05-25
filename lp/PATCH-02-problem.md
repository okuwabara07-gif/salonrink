# PATCH-02 / Problem セクション 画像差替指示書

> 対象セクション: **02 / Problem（課題）**
> スコープ: **背面に画像を1枚追加のみ**。テキスト・コピー・配列・カード・クラス名・id は一切変更しない。
> 受領日: 2026.05.25

---

## 概要

Problem セクション全体の **最背面（z-index 0）** に、サロン店内のぼかし背景画像を1枚配置する。
既存の見出し・3カード・下部のお悩みバンドは、そのまま **最前面（z-index 1）** に乗る。

---

## 使用画像

| 項目 | 値 |
|---|---|
| ファイル名 | `problem-bg-salon.webp`（推奨は `.webp` 変換後） |
| 配置パス | `public/images/problem/problem-bg-salon.webp` |
| フォールバック | `public/images/problem/problem-bg-salon.png` |
| 原寸 | 1537 × 1023 px |
| 比率 | 約 3:2 |
| 重さ | PNG 1.6MB → **WebP で 250-300KB 目標** |
| alt 属性 | `""`（装飾画像のため空文字。`aria-hidden="true"` を付ける） |

> 画像の内容: 明るいサロン店内、自然光、左に窓と植物、右に椅子4脚と鏡、手前に木製カウンター。**ぼかしが強めで前景の文字を妨げない**設計。

---

## 差替対象（既存DOM）

セクション `#problem` 自体に追加する。**既存の子要素は触らない**。

### 差替後イメージ

```html
<section class="problem" id="problem">
  <!-- ↓ 追加: 最背面の装飾画像 -->
  <Image
    src="/images/problem/problem-bg-salon.webp"
    alt=""
    aria-hidden="true"
    width={1537}
    height={1023}
    sizes="100vw"
    className="problem__bg"
  />

  <!-- 既存DOMは一切変更しない -->
  <div class="sr-container">
    <div class="problem__head">...</div>
    <div class="problem__grid">...</div>
    <div class="pband">...</div>
  </div>
</section>
```

### 必要 CSS（最小限のみ）

```css
/* 既存の .problem は position: relative; overflow: hidden を既に持っている前提 */
.problem { position: relative; overflow: hidden; }  /* なければ追加 */

.problem__bg {
  position: absolute;
  inset: 0;                       /* top:0 right:0 bottom:0 left:0 */
  width: 100%;
  height: 100%;
  object-fit: cover;              /* セクション全体を覆う */
  object-position: center;
  z-index: 0;
  opacity: 0.55;                  /* 文字の可読性を担保するため薄く */
  pointer-events: none;
  user-select: none;
}

/* 既存の .sr-container を画像の上に乗せる */
.problem .sr-container {
  position: relative;
  z-index: 1;
}

/* セクションの背景色（既存 body { background: var(--bg-tint) }）を画像と馴染ませる */
.problem::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(246, 249, 246, 0.7) 0%,
    rgba(246, 249, 246, 0.5) 50%,
    rgba(246, 249, 246, 0.85) 100%
  );
  z-index: 0;
  pointer-events: none;
}
```

> **重要**: 画像を「半透明＋白オーバーレイ」で薄める設計。完成イメージ（`_reference-final.png`）の前景の白っぽさを再現するため。透過率は `.problem__bg { opacity }` と `::before` の rgba 値で微調整可。

---

## 厳守事項（Claude Code へ）

1. **既存DOMは1要素も削除しない。テキストも1文字も変えない。**
2. 追加するのは `<Image>` 1要素 + `<section>` 直下の擬似要素 1つ
3. `.sr-container` を画像の上に乗せるため `position: relative; z-index: 1;` のみ追加
4. 既存のカード（`.pcard`）の白背景は維持。これにより画像の上にカードがクリーンに浮く
5. 既存の `.pband`（下部のお悩みバンド）も同様にそのまま乗る
6. 他セクションには影響を与えない
7. テキストの色は変更不可（既存のまま）

---

## 確認ポイント

- [ ] PROBLEM ラベル・見出し・リード文がそのまま見える
- [ ] 3カード（01 / 02 / 03）の中身がすべて元のまま
- [ ] 下部のお悩み4項目バンドが元のまま
- [ ] 背景画像が薄く透けて見える（過度に主張しない）
- [ ] テキストの可読性が WCAG AA を満たす
- [ ] モバイル（〜980px）で画像の object-position が崩れない
- [ ] git diff にテキスト変更が一切ないこと

---

## 補足

### 完成イメージとの差
完成イメージ（`_reference-final.png`）では、背景画像はかなり薄く・前景色が白く強い。
`.problem__bg { opacity: 0.55 }` + 白オーバーレイ `::before` の組合せで再現する。

### モバイル
`object-fit: cover` で自動的にセンタークロップ。
画面下部までしっかり画像が届くよう `inset: 0` で固定。

### パフォーマンス
- 背景装飾画像なので `priority` 不要。`loading="lazy"` で OK（Next.js デフォルト）
- `aria-hidden="true"` + `alt=""` で読み上げ対象外

---

## Claude Code 用 短縮プロンプト

```
LP の Problem セクションに、最背面の装飾画像を1枚追加してください。
- 入力: lp/PATCH-02-problem.md
- 画像: public/images/problem/problem-bg-salon.webp（または .png）
- 配置: <section id="problem"> の直下、既存DOMより前に <Image> 1つ
- スタイル: .problem__bg と .problem::before の追加のみ
- 既存DOM・テキスト・他クラスは一切変更しない
- 完了後、git diff にテキスト変更が0であることを確認して報告
```
