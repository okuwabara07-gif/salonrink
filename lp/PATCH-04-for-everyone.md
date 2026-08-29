# PATCH-04 / For Everyone セクション 画像差替指示書

> 対象セクション: **04 / For Everyone（3視点の価値）**
> スコープ: **B案 — 写真5点の差替/新設のみ**。テキスト・配列・文章・統計値・クラス名・id は一切変更しない。
> 受領日: 2026.05.26

---

## 概要

For Everyone セクションの **5つの位置に人物写真**を追加/差替する。

1. セクションヘッダの **左右に女性写真**（顧客 + スタッフ、装飾要素）
2. **3枚のカード各々の上部に女性写真**（FOR CUSTOMERS / FOR STAFF / FOR YOU）

すべてのテキスト・統計数値・コピー・リスト・引用ボックスは **既存HTMLのまま**。

---

## 使用画像（5点）

| ID | ファイル名 | 用途 | 推奨配置サイズ |
|---|---|---|---|
| A | `header-left-customer.png`  | ヘッダ左の装飾（顧客） | 280×320 (表示) |
| B | `header-right-staff.png`    | ヘッダ右の装飾（スタッフ） | 320×320 (表示) |
| C | `card1-customer.png`        | FOR CUSTOMERS カード上部 | 160×220 (表示) |
| D | `card2-staff.png`           | FOR STAFF カード上部 | 160×220 (表示) |
| E | `card3-you.png`             | FOR YOU カード上部 | 160×220 (表示) |

すべて `public/images/for-everyone/{filename}.webp` に変換・配置。
原ファイルは `lp/assets/for-everyone/` から取得可能。

| 画像 | alt |
|---|---|
| A | `""` （装飾、`aria-hidden="true"`） |
| B | `""` （装飾、`aria-hidden="true"`） |
| C | `"スマートフォンでLINEを使うお客様"` |
| D | `"タブレットを手にする美容師スタッフ"` |
| E | `"サロンオーナーの女性"` |

---

## 差替/追加対象（既存DOM）

### A・B) セクションヘッダの装飾画像（新設）

`<section class="everyone">` 内の `<div class="everyone__head">` に対し、
左右に装飾画像を絶対配置する。

#### 現状

```html
<div class="everyone__head">
  <div class="deco-l">...dots...</div>
  <div class="deco-r">...dots...</div>
  <div class="sr-eyebrow">FOR EVERYONE</div>
  <h2 class="sr-h2">...</h2>
</div>
```

#### 差替後

```html
<div class="everyone__head">
  <Image
    src="/images/for-everyone/header-left-customer.webp"
    alt=""
    aria-hidden="true"
    width={285}
    height={320}
    className="everyone__head-photo everyone__head-photo--l"
  />
  <Image
    src="/images/for-everyone/header-right-staff.webp"
    alt=""
    aria-hidden="true"
    width={353}
    height={330}
    className="everyone__head-photo everyone__head-photo--r"
  />
  <!-- 既存の deco-l / deco-r ドットは削除可（背景画像と被るため） -->
  <div class="sr-eyebrow">FOR EVERYONE</div>
  <h2 class="sr-h2">...</h2>
</div>
```

> `.deco-l` / `.deco-r`（緑のドット装飾）は写真と被るため削除して良い。
> ただし「装飾要素以外は触らない」スコープを厳格に解釈する場合は `display: none` で隠すのみとする。

### C・D・E) 各カード上部の人物写真（差替）

3枚のカード `<article class="ecard">` の `<div class="ecard__top">` の中、
**既存の `.ecard__top-icon`（円形の SVG アイコン）の右側に絶対配置**で人物写真を追加する。

#### 差替後（カード1の例 / 2・3 も同様の構造）

```html
<article class="ecard">
  <div class="ecard__top">
    <div class="ecard__top-icon">
      <!-- 既存 SVG アイコン そのまま -->
    </div>
    <!-- ↓ 追加：人物写真 -->
    <Image
      src="/images/for-everyone/card1-customer.webp"
      alt="スマートフォンでLINEを使うお客様"
      width={115}
      height={245}
      className="ecard__top-photo"
    />
    <div class="ecard__top-eyebrow">FOR CUSTOMERS</div>
    <div class="ecard__top-stat">
      <span class="ecard__top-num">+25</span><span class="ecard__top-unit">%</span>
      <span class="ecard__top-pill">リピート率予想</span>
    </div>
  </div>
  <div class="ecard__body">...</div>
</article>
```

カード2: `card2-staff.webp` を同様に配置
カード3: `card3-you.webp` を同様に配置

---

## 必要 CSS（最小限のみ）

```css
/* ── A・B) ヘッダ装飾画像 ── */
.everyone__head {
  position: relative;       /* 既存に既にある */
}
.everyone__head-photo {
  position: absolute;
  top: 0;
  width: auto;
  height: 280px;            /* デスクトップ時の表示高 */
  object-fit: cover;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}
.everyone__head-photo--l {
  left: 0;
}
.everyone__head-photo--r {
  right: 0;
}
/* ヘッダ内のテキストを写真の上に乗せる */
.everyone__head .sr-eyebrow,
.everyone__head .sr-h2,
.everyone__head .sr-lead {
  position: relative;
  z-index: 1;
}

/* ── C・D・E) カード上部の人物写真 ── */
.ecard__top {
  position: relative;       /* 既存に既にある */
  overflow: hidden;
}
.ecard__top-photo {
  position: absolute;
  right: 16px;
  top: 16px;
  bottom: 16px;
  width: auto;
  height: calc(100% - 32px);
  object-fit: cover;
  border-radius: 12px;
  z-index: 1;
  pointer-events: none;
}

/* モバイル時は装飾画像を隠す（テキスト可読性優先） */
@media (max-width: 980px) {
  .everyone__head-photo { display: none; }
  .ecard__top-photo {
    position: static;
    width: 100%;
    height: 180px;
    margin-bottom: 16px;
  }
}
```

---

## 厳守事項（Claude Code へ）

1. **数字（+25% / −30分/日 / +15%）は一切変更しない**
2. **コピー（見出し / 説明 / リスト項目 / 引用）も一切変更しない**
3. 削除して良いのは `.deco-l` / `.deco-r` のドット装飾のみ（任意）
4. 追加するのは `<Image>` ×5 のみ
5. SVG アイコンは既存のまま残す（写真と併存）
6. カード `.ecard__top` の緑グラデーション背景は維持
7. 他セクション・他カード構造には触らない

---

## 確認ポイント

- [ ] 見出し「お客様も、これから雇うスタッフも、そしてあなた自身も。」がそのまま
- [ ] リード文「1人サロンのあなたが軸。〜」がそのまま
- [ ] 3枚のカード見出し「FOR CUSTOMERS / FOR STAFF / FOR YOU」が元のまま
- [ ] 各カードの統計値（+25% / −30 / +15）が元のまま
- [ ] 各カードのリスト3項目が元のまま
- [ ] 各カードの引用ボックスのコメントが元のまま
- [ ] 下部の電球バンド「すべては、1人サロンの成長のために。」がそのまま
- [ ] モバイル時、装飾画像が消えて文字可読性が保たれている
- [ ] git diff にテキスト変更が一切ないこと

---

## 補足

### 写真の元データ
- すべて 1枚の合成画像（`lp/assets/for-everyone/_source-composite.png`）から切り出し済み
- LP チームで個別ファイル `card1-customer.png` 等を更新する際は、同じトリミング枠で差替える
- ChatGPT 生成画像のため、解像度は粗め。本番用に高解像度版（人物写真を実写撮影 or AI で再生成）への差替を推奨

### Web 最適化
- 全画像 WebP 変換し、合計 200KB 以下を目標
- `loading="lazy"` でファーストビュー外の画像は遅延読み込み
- ヘッダ装飾画像（A・B）はデスクトップ時のみ表示するため、`media` 属性 + `<picture>` で配信可

### モバイル対応の方針
- 装飾の A・B は **モバイルで非表示**（テキスト可読性優先）
- カード写真の C・D・E は **カード上部にフルワイドで配置**

### アクセシビリティ
- 装飾画像（A・B）は `aria-hidden="true"` + `alt=""`
- 情報を伝える画像（C・D・E）は人物の役割を含む `alt`

---

## Claude Code 用 短縮プロンプト

```
LP の For Everyone セクションに、人物写真を5点追加してください。
- 入力: lp/PATCH-04-for-everyone.md
- 画像: public/images/for-everyone/{header-left-customer,header-right-staff,card1-customer,card2-staff,card3-you}.webp
- 追加: ヘッダ左右に <Image> ×2、3カード上部に <Image> ×3
- 削除可（任意）: .deco-l / .deco-r のドット装飾
- 維持: 数字、見出し、リスト、引用、下部バンド、SVG アイコン、すべて
- 完了後、git diff にテキスト・数値変更が0であることを確認して報告
```
