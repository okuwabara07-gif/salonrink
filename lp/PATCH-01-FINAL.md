# PATCH-01-FINAL / Hero セクション 最終確定指示

> 対象: PATCH-01 / PATCH-01-fix / PATCH-01-v3 を **すべて上書き** する最終仕様
> 解決: ChatGPT 完成イメージを **フルブリード背景** として使い、テキストを左側に重ねる
> 受領日: 2026.05.26
> 関連: `lp/assets/hero/hero-final-target.png`（オーナー指定の完成イメージ）

---

## ⚠️ 重要

これまでの PATCH-01 系（hero, fix, v3）は **すべて破棄**。本 FINAL のみ実装する。
受領した完成イメージ（`hero-final-target.png`）が **正**。

---

## 完成イメージの要件

| 要素 | 仕様 |
|---|---|
| 写真の見せ方 | **画面いっぱいに横展開**（フルブリード or コンテナ最大幅） |
| 写真の内容 | サロン店内 × 大きな iPhone × 3つの吹き出し（すべて焼き込み済み） |
| 左カラム | 既存のテキスト・統計・CTA を**白グラデオーバーレイ越し**に重ねる |
| 右カラム | 写真側に iPhone/吹き出しが既に含まれているため**HTML要素は不要** |
| ナビ | 写真の上に固定（既存のまま） |

---

## 使用画像

| 項目 | 値 |
|---|---|
| ファイル名 | `hero-final-target.png`（→ WebP 変換推奨） |
| 配置パス | `public/images/hero/hero-final.webp` |
| 元画像 | `lp/assets/hero/hero-final-target.png` |
| サイズ | 高解像度（オリジナルそのまま） |
| 比率 | 約 16:9（横長） |
| alt | `"SalonRink Concierge — キレイ鶴見店の店内とLINE公式アカウントのトーク画面。お客様の予約・相談・パーソナライズ提案・業務自動化がLINEの中で完結"` |

---

## 実装方針

### HTML 構造（既存DOMを最小限に）

```html
<section class="hero" id="top">
  <!-- ↓ Layer 1: フルブリード背景画像 -->
  <Image
    src="/images/hero/hero-final.webp"
    alt="SalonRink Concierge — キレイ鶴見店の店内とLINE公式アカウントのトーク画面"
    fill
    priority
    sizes="100vw"
    className="hero__bg"
    style={{ objectFit: 'cover', objectPosition: 'center' }}
  />

  <!-- ↓ Layer 2: テキストオーバーレイ用の白グラデーション -->
  <div class="hero__overlay" aria-hidden="true"></div>

  <!-- ↓ Layer 3: 既存の左カラムテキストだけ残す -->
  <div class="hero__inner">
    <div class="hero__content">
      <div class="hero__badge">...</div>
      <h1 class="hero__title">...</h1>
      <p class="hero__sub">...</p>
      <div class="hero__stats">...</div>
      <ul class="hero__bullets">...</ul>
      <div class="hero__cta">...</div>
      <div class="hero__trust">...</div>
    </div>
    <!-- 右カラム .phone-area は不要（画像に焼き込まれているため削除） -->
  </div>
</section>
```

### 削除する DOM

PATCH-01-v3 で復活させたものを **再度削除**:
- `.phone-area` ブロック全体（HTML iPhone モック + 吹き出し3つ）

→ これらは新画像に焼き込まれているため不要。

---

## 必要 CSS

```css
.hero {
  position: relative;
  overflow: hidden;
  min-height: 720px;
  padding: 0;
}

/* Layer 1: フルブリード背景 */
.hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Layer 2: 左側の白グラデーション（テキスト可読性確保） */
.hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.85) 30%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(255, 255, 255, 0.15) 70%,
    transparent 100%
  );
  pointer-events: none;
}

/* Layer 3: テキストを左カラムに配置 */
.hero__inner {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 64px 32px 96px;
  display: grid;
  grid-template-columns: minmax(400px, 50%) 1fr;
  align-items: center;
  min-height: inherit;
}

.hero__content {
  /* 既存の左カラムスタイルを維持 */
}

/* 右カラム（旧 .phone-area）は不要なので空 or 削除 */

/* モバイル対応 */
@media (max-width: 980px) {
  .hero {
    min-height: auto;
  }
  .hero__inner {
    grid-template-columns: 1fr;
    padding: 32px 16px 480px 16px;  /* 下に余白を取り、画像のiPhone部分を見せる */
  }
  .hero__overlay {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.85) 30%,
      rgba(255, 255, 255, 0.3) 60%,
      transparent 100%
    );
  }
  .hero__bg {
    object-position: center bottom;  /* モバイルでは下に見せたい部分を */
  }
}
```

---

## 厳守事項（Claude Code へ）

1. **左カラムのテキスト・統計・CTA・トラスト要素は一切変更しない**
2. PATCH-01-v3 で復活させた `.phone-area` 内の HTML iPhone + 吹き出し3つを **削除**
3. 新規追加: `<Image>` 1つ（フルブリード背景）+ `.hero__overlay` div
4. ナビ（`.nav`）は既存のまま、写真の上に表示
5. テキストカラーは既存のまま（白オーバーレイで可読性確保）

---

## 確認ポイント

- [ ] 写真が画面いっぱいに広がっている
- [ ] iPhone が大きく中央付近に表示されている（画像内）
- [ ] 3つの吹き出しが画像の右側にハッキリ読める（画像内）
- [ ] 左側のテキスト「いまのLINE公式アカウントを、サロンの売上につながる業務システムに。」が読みやすい
- [ ] 統計カード（−30分/日 / +25% / +15%）が背景の上で見やすい
- [ ] CTAボタンが目立つ位置にある
- [ ] ナビゲーションが写真の上に固定されている
- [ ] モバイル時、テキストが上、画像が下に縦並びで表示される
- [ ] git diff にテキスト変更が一切ないこと

---

## 補足

### なぜ「治らなかった」のか
- PATCH-01: 画像を右カラム（480px）に詰めたため、画像内の iPhone と吹き出しが極端に縮小
- PATCH-01-fix: 画像を 130% に拡大しても比率は同じなので根本解決せず
- PATCH-01-v3: レイヤー分離を試みたが、背景画像が iPhone を含んだままで二重表示
- **PATCH-01-FINAL**: 画像をセクション全体の背景にすることで、画像内の iPhone が **画面サイズに比例して** 十分大きく表示される

### opacity / グラデーションの調整値
- 左 95% → 中央 55% → 右 0% が標準
- テキストが薄い印象なら左を 0.98 まで上げる
- 写真をもっと前に出したいなら左を 0.85 まで下げる

### モバイルでの見え方
- デスクトップ: 横並び（テキスト左 / 写真背景）
- モバイル: 縦並び（テキスト上 / 写真下）
- パディング `padding: 32px 16px 480px 16px` で下に余白を作り、画像の iPhone 部分が見えるよう設計

---

## Claude Code 用 短縮プロンプト

```
LP の Hero セクションを最終版に修正してください。
- 入力: lp/PATCH-01-FINAL.md
- 完成イメージ: lp/assets/hero/hero-final-target.png

【手順】
1. PATCH-01-v3 で復活させた .phone-area 内の HTML iPhone と吹き出し3つを削除
2. <section class="hero"> 直下に <Image> 1つを fill で配置（フルブリード背景）
3. その下に <div class="hero__overlay"> を追加（白グラデオーバーレイ）
4. 左カラムのテキストを z-index: 2 で重ねる

【画像】
public/images/hero/hero-final.webp
（lp/assets/hero/hero-final-target.png を WebP 変換）

【維持】
左カラムのテキスト・統計・CTA・トラスト、ナビ、すべて元のまま

【削除】
PATCH-01-v3 で追加した .phone-area の中身すべて

完了後、PC/モバイル両方のスクショで確認し、git diff にテキスト変更が0であることを報告。
```
