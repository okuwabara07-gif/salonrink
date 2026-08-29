# PATCH-08 / Case 01 セクション 実店舗写真 差替指示

> 対象セクション: **08 / CASE 01（キレイ鶴見店 導入事例）**
> スコープ: **実店舗写真の差替のみ**。テキスト・引用・BEFORE/AFTER・数値・タグは一切変更しない。
> 受領日: 2026.05.26

---

## 概要

CASE 01 セクション左側の **黒/グラデーションのプレースホルダー部分**に、
**実際の「キレイ鶴見店」店内写真**を差し込む。

「REAL PHOTO · 実店舗」のタグはそのまま残し、その下に実写真を表示する。

---

## 使用画像

| 項目 | 値 |
|---|---|
| ファイル名 | `kirei-tsurumi-real.jpg`（実写・縦長） |
| 配置パス | `public/images/case/kirei-tsurumi-real.webp`（推奨は WebP 変換） |
| フォールバック | `public/images/case/kirei-tsurumi-real.jpg` |
| 元画像 | `lp/assets/case/kirei-tsurumi-real.jpg` |
| 比率 | 縦長（おそらく 3:4 程度） |
| alt | `"キレイ鶴見店の店内 — ヴィンテージ調の鏡台と化粧道具が並ぶ落ち着いた1人サロン"` |

---

## 差替対象（既存DOM）

`<article class="case__card">` 内の左カラム `.case__photo` を実写真に差し替える。
現状は CSS グラデーション + 文字（「ホワイト白髪染め」「WHITE HAIR COLOR SALON · 1人サロン」「HPB・H000501100」「@kirei.tsurumi」「白髪染め特化」「1人サロン」「横浜・鶴見」などのオーバーレイ情報）が表示されている。

### 維持する要素（オーバーレイ）
- `REAL PHOTO · 実店舗` バッジ（左上）
- サロン名・キャッチフレーズ
- HPB ID、@kirei.tsurumi
- タグチップ（白髪染め特化 / 1人サロン / 横浜・鶴見）

### 修正方針
背景のグラデーションを **実写真に置き換え**、その上に既存のオーバーレイ情報を表示する。

```html
<div class="case__photo">
  <!-- ↓ 新規追加：背景に実写真 -->
  <Image
    src="/images/case/kirei-tsurumi-real.webp"
    alt="キレイ鶴見店の店内 — ヴィンテージ調の鏡台と化粧道具が並ぶ落ち着いた1人サロン"
    fill
    sizes="(max-width: 980px) 100vw, 360px"
    className="case__photo-img"
    style={{ objectFit: 'cover', objectPosition: 'center' }}
  />

  <!-- 既存のオーバーレイ要素はそのまま -->
  <div class="case__photo-top">
    <svg>...</svg>
    REAL PHOTO · 実店舗
  </div>
  <div>
    <div class="case__photo-name">ホワイト白髪染め</div>
    <div class="case__photo-meta">WHITE HAIR COLOR SALON · 1人サロン</div>
    <div class="case__photo-meta">HPB · H000501100</div>
    <div class="case__photo-meta">@kirei.tsurumi</div>
    <div class="case__photo-tags">
      <span class="case__photo-tag">白髪染め特化</span>
      <span class="case__photo-tag">1人サロン</span>
      <span class="case__photo-tag">横浜・鶴見</span>
    </div>
  </div>
</div>
```

---

## 必要 CSS（最小限のみ）

```css
.case__photo {
  /* 既存スタイル維持 + position: relative を確実に */
  position: relative;
  overflow: hidden;
}

/* グラデーション背景を削除（実写真に置き換える） */
.case__photo {
  background: transparent !important;  /* 既存の linear-gradient を無効化 */
}

/* 実写真は最背面に */
.case__photo-img {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* 既存のオーバーレイ（バッジ・テキスト・タグ）は写真の上に */
.case__photo-top,
.case__photo-name,
.case__photo-meta,
.case__photo-tags {
  position: relative;
  z-index: 2;
}

/* 写真の上に半透明の暗いオーバーレイを敷いて、文字を読みやすく */
.case__photo::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.45) 70%,
    rgba(0, 0, 0, 0.65) 100%
  );
  z-index: 1;
  pointer-events: none;
}
```

---

## 厳守事項（Claude Code へ）

1. **CASE 01 セクションのテキスト・引用・BEFORE/AFTER・数値は一切変更しない**
2. **「REAL PHOTO · 実店舗」バッジは維持**
3. **サロン名「ホワイト白髪染め」、サブタイトル、HPB ID、@kirei.tsurumi、3つのタグも維持**
4. 削除するのは `.case__photo` の `background: linear-gradient(...)` の指定のみ
5. 追加するのは `<Image>` 1つと `::after` の暗オーバーレイ
6. 他セクションには触らない

---

## 確認ポイント

- [ ] 引用文「LINEで連絡するタイミングが分かるようになって、〜」がそのまま
- [ ] 「キレイ鶴見店 オーナー」のキャプションがそのまま
- [ ] BEFORE / AFTER のテキストがそのまま
- [ ] 4指標（+25% / +15% / −30分/日 / +12%）がそのまま
- [ ] 実店舗写真が左カラムの背景として表示されている
- [ ] バッジ・タグ・テキストオーバーレイが読みやすく見える
- [ ] モバイル時、写真と情報が縦並びで正しく表示される
- [ ] git diff にテキスト変更が一切ないこと

---

## 補足

### 写真の object-position
縦長写真のため、デスクトップ表示時にどこを見せたいか確認推奨：
- `center center`: バランス重視
- `center top`: 上部の装飾（鏡台 + ボトル）を見せる
- `center bottom`: 下部の床と椅子を見せる

→ レビュー時にオーナー判断で決定

### 画像最適化
- 元 JPG が高解像度なら **WebP 変換で 200-300KB 程度に圧縮**
- 縦長画像なので、デスクトップでは右上をクロップして表示することになる

### アクセシビリティ
- alt は実店舗の様子が分かる具体的な文言を使用
- 暗オーバーレイの上に文字を載せるためコントラスト確保

---

## Claude Code 用 短縮プロンプト

```
LP の CASE 01 セクション左カラムに、キレイ鶴見店の実写真を差し込んでください。
- 入力: lp/PATCH-08-case.md
- 画像: public/images/case/kirei-tsurumi-real.webp（または .jpg）
- 配置: .case__photo の背景（linear-gradient）を実写真 <Image> に置換
- 維持: 「REAL PHOTO · 実店舗」バッジ、サロン名、HPB ID、@kirei.tsurumi、3タグ、すべてのオーバーレイ
- CSS: .case__photo の background を transparent に、.case__photo::after で暗オーバーレイ追加
- 完了後、git diff にテキスト変更が0であることを確認して報告
```
