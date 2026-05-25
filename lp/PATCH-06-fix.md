# PATCH-06-fix / AI Karte セクション 画像差替指示

> 対象: PATCH-06 で適用した AI Karte セクションの修正
> 問題: メインビジュアル（カラーパレットの女性写真）が前面に出すぎている
> 解決: **既存のメインビジュアルを削除し、サロン店内の空間写真を最背面に配置**
> 受領日: 2026.05.26

---

## 概要

AI Karte（CONCIERGE KARTE）セクションを以下のように修正：

1. **PATCH-06 で追加したメインビジュアル（カラーパレットの女性写真）を削除**
2. **新しい画像（落ち着いたサロン店内・無人）をセクション全体の最背面に配置**
3. 既存のチャット履歴・カルテカード・3つの機能カードはそのまま前面に乗る

---

## 使用画像

| 項目 | 値 |
|---|---|
| ファイル名 | `karte-bg-empty-salon.webp` |
| 配置パス | `public/images/ai-karte/karte-bg-empty-salon.webp` |
| 元画像 | `lp/assets/ai-karte/karte-bg-empty-salon.png` |
| 推奨表示幅 | 100vw（フルブリード） |
| alt | `""`（装飾画像、`aria-hidden="true"`） |
| 内容 | 落ち着いた色味のサロン店内、アーチ窓 × 2、ミラー、レザーチェア、植物、無人 |

---

## 削除対象（PATCH-06 で追加した画像）

以下を JSX から削除：

- `.karte__hero` ラッパー全体（`karte-hero-color-palette.webp` を含む）

### 3つの機能カード写真（`feat1` / `feat2` / `feat3`）の扱い

**選択肢：**
- A) **削除する**（セクション全体を背景画像のみのスッキリしたデザインにする）
- B) **残す**（背景＋カード右上の小型写真 の二重構造を維持）

→ 本指示書は **A を推奨**（背景画像がメインビジュアルとして機能するため、カード内写真は不要）
→ B を選ぶ場合は機能カードの `<Image>` 3つを残し、CSS のみ調整

---

## 追加方針

### 実装（A 案：背景のみ）

```html
<section class="karte" id="karte">
  <!-- ↓ 新規追加：背景装飾画像 -->
  <Image
    src="/images/ai-karte/karte-bg-empty-salon.webp"
    alt=""
    aria-hidden="true"
    width={1920}
    height={1080}
    className="karte__bg"
  />

  <div class="sr-container">
    <div class="karte__head">...</div>

    <!-- ↓ PATCH-06 で追加した .karte__hero ブロックを削除 -->

    <div class="karte__main">...</div>
    <div class="karte__feats">
      <!-- 各 .karte__feat 内の <Image> 写真を削除（A案） -->
    </div>
  </div>
</section>
```

---

## 必要 CSS

```css
.karte {
  position: relative;
  overflow: hidden;
}

.karte__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
  opacity: 0.45;            /* 前景の白カードと馴染ませるため薄く */
  pointer-events: none;
  user-select: none;
}

/* 白オーバーレイで全体を明るく保つ */
.karte::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.75) 0%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(255, 255, 255, 0.85) 100%
  );
  z-index: 0;
  pointer-events: none;
}

/* セクション内のコンテンツを背景の上に乗せる */
.karte .sr-container {
  position: relative;
  z-index: 1;
}

/* PATCH-06 で追加した .karte__hero / .karte__feat-photo は削除 */
```

---

## 厳守事項（Claude Code へ）

1. **PATCH-06 で追加した `.karte__hero` ブロック全体を削除**
2. **3つの機能カード内の `<Image>`（feat1/feat2/feat3）も削除**（A 案推奨）
3. 既存のチャット履歴・カルテカード・3つの機能カードのテキストは一切変更しない
4. 中央の AUTO ステップも維持
5. 追加するのは背景 `<Image>` 1つと `::before` オーバーレイのみ
6. opacity 値（0.45 推奨）はレビュー時に微調整可

---

## 確認ポイント

- [ ] カラーパレットを持つ女性の写真が消えている
- [ ] 機能カード3つから人物写真が消えている（A 案の場合）
- [ ] CONCIERGE KARTE アイブロウとメイン見出しがそのまま
- [ ] チャット履歴の5メッセージが全て元のまま
- [ ] 田中真由美 さまカルテのすべての項目が元のまま
- [ ] 下部3カードのテキストが全て元のまま
- [ ] 背景画像が薄く透けて、前景の白カードを邪魔しない
- [ ] git diff にテキスト変更が一切ないこと

---

## 補足

### opacity チューニング
- `0.45`: バランス重視（推奨）
- `0.3`: 背景控えめ
- `0.6`: 背景を主役級に

レビュー時に画面を見ながら 0.3〜0.6 の範囲で調整。

### モバイル対応
```css
@media (max-width: 980px) {
  .karte__bg {
    opacity: 0.25;            /* モバイルでさらに薄める */
  }
}
```

### 機能カードの装飾を残す（B案）の場合
カード右上の人物写真を残し、CSSのみ調整：
```css
.karte__feat-photo {
  /* PATCH-06 の値を維持 */
  width: 56px; height: 56px;     /* やや小さめに */
  opacity: 0.9;
}
```

---

## Claude Code 用 短縮プロンプト

```
LP の AI Karte（CONCIERGE KARTE）セクションを修正してください。
- 入力: lp/PATCH-06-fix.md
- 削除: PATCH-06 で追加した .karte__hero ラッパー全体と、機能カード3つの <Image>
- 追加: <section class="karte"> 直下に背景 <Image> 1つ + ::before 白オーバーレイ
- 画像: public/images/ai-karte/karte-bg-empty-salon.webp（opacity 0.45）
- 維持: チャット履歴、カルテ内容、AUTO ステップ、3カードのテキスト、すべて
- 完了後、git diff にテキスト変更が0であることを確認して報告
```
