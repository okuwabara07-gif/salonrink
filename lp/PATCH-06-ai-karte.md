# PATCH-06 / AI Karte（CONCIERGE KARTE）セクション 画像追加指示書

> 対象セクション: **06 / AI Karte（CONCIERGE KARTE）**
> スコープ: **B案 — 写真を計4点追加**（メインビジュアル × 1 + 下部3カード × 3）。テキスト・チャット履歴・カルテ内容・クラス名は一切変更しない。
> 受領日: 2026.05.26

---

## 概要

AI Karte セクションに対し、以下2つの画像追加を実施する：

1. **メイン2カラムエリアの上部または右側に「カラーパレットを確認する女性」のメインビジュアル** を追加
2. **下部の3つの機能カード（名前1つで全部わかる / 会話→カルテ自動化 / 引き継ぎゼロ）に小さな人物写真**を各1枚追加

「流れる会話を、"資産"に変える。」という見出しに対し、**サロン現場で施術メモが残っていくシーン**を写真で補強する。

---

## 使用画像（4点）

| ID | ファイル名 | 用途 | 推奨表示サイズ |
|---|---|---|---|
| A | `karte-hero-color-palette.png` | メインビジュアル（左カラム上 or 装飾） | 340×260 |
| B | `feat1-tablet-pair.png`        | 機能カード①「名前1つで全部わかる」 | 80×80 円形 |
| C | `feat2-color-palette.png`      | 機能カード②「会話→カルテ自動化」 | 80×80 円形 |
| D | `feat3-tablet-three.png`       | 機能カード③「引き継ぎゼロ」 | 80×80 円形 |

すべて `public/images/ai-karte/{filename}.webp` に変換・配置。

| 画像 | alt |
|---|---|
| A | `"カラーパレットで施術メモを確認するスタイリスト"` |
| B | `"タブレットでお客様のカルテを2人で確認するスタッフ"` |
| C | `"カラーパレットで色味の好みを記録するスタイリスト"` |
| D | `"タブレットで顧客情報を引き継ぐ3名のスタッフ"` |

---

## 差替/追加対象（既存DOM）

### A) メインビジュアルの配置位置（推奨案）

`<section class="karte">` の `.karte__head`（見出しブロック）の **直下 or 上**に、装飾的に配置する。

#### オプション A-1: 見出し直下の中央配置（推奨）

```html
<div class="karte__head">
  <div class="sr-eyebrow">AI KARTE</div>
  <h2 class="sr-h2">...</h2>
  <p class="sr-lead">...</p>
</div>

<!-- ↓ 追加：装飾画像（中央のメインビジュアル） -->
<div class="karte__hero">
  <Image
    src="/images/ai-karte/karte-hero-color-palette.webp"
    alt="カラーパレットで施術メモを確認するスタイリスト"
    width={340}
    height={260}
    className="karte__hero-img"
  />
</div>

<!-- 既存 -->
<div class="karte__main">...</div>
```

#### オプション A-2: 左カラム（チャット履歴）の上部に小さく挿入

`<div class="karte__left">` 内の `.karte__head-row` の左、もしくは `.chat-scroll` の上に小さなアバター/装飾として配置。

→ 今回はオプション **A-1** を採用。

### B・C・D) 3つの機能カード `.karte__feat` に各1枚追加

3つの機能カードの **アイコン部分の左横、または背景**に人物写真を小さく配置。

```html
<div class="karte__feat">
  <!-- ↓ 追加：人物写真（アイコン上に小さく重ねる、または横に配置） -->
  <Image
    src="/images/ai-karte/feat1-tablet-pair.webp"
    alt="タブレットでお客様のカルテを2人で確認するスタッフ"
    width={80}
    height={80}
    className="karte__feat-photo"
  />
  <!-- 既存 -->
  <div class="karte__feat-icon">...</div>
  <div class="karte__feat-title">名前1つで全部わかる</div>
  <div class="karte__feat-sub">...</div>
</div>
```

3カードそれぞれに対応する写真：
- カード1「名前1つで全部わかる」→ `feat1-tablet-pair.webp`
- カード2「会話 → カルテ 自動化」→ `feat2-color-palette.webp`
- カード3「引き継ぎゼロ」→ `feat3-tablet-three.webp`

---

## 必要 CSS（最小限のみ）

```css
/* ── A) メインビジュアル ── */
.karte__hero {
  display: flex;
  justify-content: center;
  margin: 0 auto 40px;
  max-width: 1240px;
  padding: 0 32px;
}
.karte__hero-img {
  width: 100%;
  max-width: 380px;
  height: auto;
  border-radius: 22px;
  object-fit: cover;
  box-shadow: var(--shadow-md, 0 12px 32px rgba(15,22,20,0.08));
}

/* ── B・C・D) 機能カードの写真 ── */
.karte__feat {
  position: relative;       /* 既存に既にある */
}
.karte__feat-photo {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(15,22,20,0.08);
  z-index: 1;
}

/* モバイル対応 */
@media (max-width: 980px) {
  .karte__hero { padding: 0 16px; margin-bottom: 32px; }
  .karte__feat-photo { width: 56px; height: 56px; }
}
```

---

## 厳守事項（Claude Code へ）

1. **見出し「流れる会話を、"資産"に変える。」は一切変更しない**
2. **左カラムのチャット履歴の中身（前回の白髪染め、ナチュラルブラウン、敏感肌の話…）は一切変更しない**
3. **右カラムの 田中真由美 さまカルテ（CUSTOMER #2841 / 来店18回 / 常連・敏感肌・3ヶ月周期 / スタイル / 使用カラー剤など）も一切変更しない**
4. **下部3カードの見出しと説明文（名前1つで全部わかる / 会話→カルテ自動化 / 引き継ぎゼロ）も一切変更しない**
5. 中央の `AUTO` 円形矢印も維持
6. 削除/並び替え禁止。追加は `<Image>` ×4 のみ
7. 既存の SVG アイコンは維持（写真と併存）

---

## 確認ポイント

- [ ] CONCIERGE KARTE アイブロウとメイン見出しがそのまま
- [ ] LINE トーク履歴の5メッセージが全て元のまま
- [ ] 田中真由美 さまカルテのすべての項目が元のまま
- [ ] 次回提案ボックスのコメントも元のまま
- [ ] AUTO ステップ「抽出→整理→分類→構造化」がそのまま
- [ ] 下部3カードのテキストが全て元のまま
- [ ] モバイル時、写真が小さくなって文字を妨げない
- [ ] git diff にテキスト変更が一切ないこと

---

## 補足

### メインビジュアル A の代替案
- オプション A-1（中央配置）以外に、A-2（左カラム内に小さく挿入）も可
- 見出しと2カラム比較の間に置くことで、視覚的なリズムが生まれる
- 不要であれば A を省略し、B・C・D の3カードのみ追加でも OK

### 機能カード写真の表示パターン
**現状の指示**: アイコン右上に円形で重ねる（コンパクト）
**代替案**: カード全体の背景に薄く配置 / カード上部に横長で配置

LP デザインのトーンに合わせて、まずは円形・右上配置で実装し、レビュー後に微調整。

### アクセシビリティ
- メインビジュアルは情報を伝える alt
- 機能カードの写真は装飾なので alt を `""` + `aria-hidden="true"` でも可
  （ただし人物が写るため、可能な限り `alt` を入れる方が望ましい）

---

## Claude Code 用 短縮プロンプト

```
LP の AI Karte（CONCIERGE KARTE）セクションに、人物写真を計4点追加してください。
- 入力: lp/PATCH-06-ai-karte.md
- 画像: public/images/ai-karte/{karte-hero-color-palette, feat1-tablet-pair, feat2-color-palette, feat3-tablet-three}.webp
- 配置:
  - メインビジュアル: .karte__head と .karte__main の間に <Image> 1つ（.karte__hero ラッパーで囲む）
  - 機能カード: 3つの .karte__feat それぞれに <Image> 1つ（右上に円形配置）
- 維持: チャット履歴、カルテ内容、AUTO ステップ、3カードのテキスト、すべて
- 完了後、git diff にテキスト変更が0であることを確認して報告
```
