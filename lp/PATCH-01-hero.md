# PATCH-01 / Hero セクション 画像差替指示書

> 対象セクション: **01 / Hero（ファーストビュー）**
> スコープ: **画像差替のみ**。テキスト・コピー・配列・クラス名・id は一切変更しない。
> 受領日: 2026.05.25

---

## 概要

ヒーロー右側の「iPhone モック + フローティング吹き出し × 3」を、**実写ベースの統合画像1枚**に置き換える。
LP 全体のビジュアル温度感を上げるため、サロン店内（ぼかし背景）× iPhone × 吹き出し3つを **1枚の画像に焼き込んだもの**を使用する。

---

## 使用画像

| 項目 | 値 |
|---|---|
| ファイル名 | `hero-salon-iphone.png`（推奨は `.webp` 変換後） |
| 配置パス | `public/images/hero/hero-salon-iphone.webp` |
| フォールバック | `public/images/hero/hero-salon-iphone.png` |
| 原寸 | 1672 × 941 px |
| 比率 | 約 16:9 |
| 重さ | PNG 1.5MB → **WebP に変換して 300KB 以下を目標** |
| alt 属性 | `「LINEの中で、サロン業務がすべて完結。キレイ鶴見店の店内とスマートフォン上のLINEトーク画面」` |

> 画像内に既に組み込まれている要素:
> - サロン店内の暖色照明・ミラー・植物・木製カウンター
> - iPhone（LINEトーク「キレイ鶴見店」表示中）
> - フローティング吹き出し × 3（「お客様はLINEで予約・相談・情報収集すべて完結」/「過去履歴に基づくパーソナライズ提案でリピート率アップ」/「自動化で業務を効率化し、店主は接客に集中」）

---

## 差替対象（既存DOM）

ヒーロー右カラム全体（iPhone モック + 吹き出し3つ）を **1枚の `<img>` で完全に置き換える**。

### 既存HTML（差替前）

```html
<!-- 右カラム / Phone column -->
<div class="phone-area">
  <!-- Speech bubbles -->
  <div class="bubble bubble--1">...</div>
  <div class="bubble bubble--2">...</div>
  <div class="bubble bubble--3">...</div>

  <!-- Phone -->
  <div class="phone">
    <div class="phone__notch"></div>
    <div class="phone__screen">
      <div class="phone__statusbar">...</div>
      <div class="line-header">...</div>
      <div class="chat-body">...</div>
      <div class="chat-input">...</div>
    </div>
  </div>
</div>
```

### 差替後

```html
<!-- 右カラム / Phone column -->
<div class="phone-area">
  <Image
    src="/images/hero/hero-salon-iphone.webp"
    alt="LINEの中で、サロン業務がすべて完結。キレイ鶴見店の店内とスマートフォン上のLINEトーク画面"
    width={1672}
    height={941}
    priority
    sizes="(max-width: 980px) 100vw, 50vw"
    className="hero__media"
  />
</div>
```

### 必要 CSS（最小限のみ）

```css
.hero__media {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 16px; /* 任意。LPトーンに合わせて統一する場合のみ */
}
```

> CSS の変更はこの1ブロックのみ。`.phone-area` の既存サイズ指定（height: 720px 等）は **画像が auto height で fit する形に上書き不要** — 既存指定で問題があれば `.phone-area { height: auto; }` のみ追加可。

---

## 厳守事項（Claude Code へ）

1. **左カラム（テキスト・統計・CTAボタン・トラスト）は一切変更しない**
2. **削除する DOM は `.phone-area` の中身のみ**（`.phone-area` 自体は残す）
3. **新規追加するのは `<Image>` 1要素のみ**
4. **コピー・class 名・id・他のセクションには触らない**
5. WebP 変換後の `.webp` を優先、無ければ `.png` で配信
6. `next/image` を使う。`priority` 必須（LCP対策）

---

## 確認ポイント

- [ ] 左カラムのテキストが完全に元のまま
- [ ] ナビゲーション（ロゴ + メニュー + CTA2つ）が変わっていない
- [ ] `.hero__inner` の grid 配置（左テキスト / 右画像 = 1fr / 480px 想定）が崩れていない
- [ ] モバイル時（980px以下）に画像が縦並びで正しく収まる
- [ ] LCP < 2.5s（hero画像が priority 指定済）
- [ ] git diff にテキスト変更が一切含まれないこと

---

## 補足

### 画像最適化
- 元画像は PNG 1.5MB と重い。**WebP 変換 + quality 82 程度で 250-300KB に圧縮推奨**
- 例: `cwebp -q 82 hero-salon-iphone.png -o hero-salon-iphone.webp`
- Next.js 標準の Image Optimization に任せる場合は `.png` のままでも可（自動で WebP/AVIF 配信される）

### 参考画像
完成形イメージ: `lp/assets/hero/_reference-final.png`
これは「最終的にこう見えるべき」を示す参考画像。実装には使わない。

### モバイル対応
- 980px 以下では `.hero__inner` が `grid-template-columns: 1fr` になり画像が下に来る
- このとき画像は max-width: 100% で自動縮小される
- 画像内の iPhone 部分が小さくなりすぎる場合は、モバイル用に切り抜き版を別途用意することを検討（今回は不要）

---

## Claude Code 用 短縮プロンプト

```
LP の Hero セクションを画像のみ差替してください。
- 入力: lp/PATCH-01.md
- 画像: public/images/hero/hero-salon-iphone.webp（または .png）
- 削除対象: .phone-area の中身（.bubble × 3 + .phone 全体）
- 追加対象: .phone-area の中に <Image> 1つ
- テキスト・他セクション・他のクラスには一切触らない
- 完了後、git diff にテキスト変更が0であることを確認して報告
```
