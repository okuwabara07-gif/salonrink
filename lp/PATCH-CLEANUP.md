# PATCH-CLEANUP / 重複要素 削除指示

> 対象: 既に Claude Code が複数 PATCH を適用した結果、要素が二重表示されている問題の解消
> 状況: オリジナル PATCH と `-fix` PATCH の両方が適用され、DOM が二重になっている
> 受領日: 2026.05.26

---

## 確認された問題

オーナーのスクリーンショットで以下の重複が確認された：

| # | 重複箇所 | 原因 |
|---|---|---|
| 1 | FOR EVERYONE セクション全体が2回表示 | PATCH-04 と PATCH-04-fix の両方が DOM 上に残存 |
| 2 | 「すべては、1人サロンの成長のために」バンドが2回 | 同上 |
| 3 | In Action のタイムライン中央線が二重 | PATCH-05 で残った要素と PATCH-05-fix の要素が並存 |

---

## 修正方針: `-fix` 版を正、オリジナル PATCH の DOM を完全削除

各セクションで `-fix` 版が「正」となるよう、オリジナル PATCH で追加した DOM/要素を完全に削除する。

---

## セクション別 削除指示

### 1) For Everyone セクション（PATCH-04 由来の削除）

**残す（PATCH-04-fix の DOM）:**
- `<div class="everyone__visual">` 内の合成画像1枚
- 数値オーバーレイ `.everyone__num--customers / --staff / --you` ×3

**削除する（PATCH-04 由来の DOM）:**
- `<div class="everyone__head">` 内の頭部装飾画像 `.everyone__head-photo--l / --r` ×2
- `<div class="everyone__grid">` 配下の3つの `<article class="ecard">` 全体
- `<div class="eband">`（電球アイコンの "すべては、1人サロンの成長のために。" バンド）
  - **理由**: PATCH-04-fix の合成画像内に既にバンドの内容が焼き込まれている

**修正後の HTML 構造**:

```html
<section class="everyone" id="everyone">
  <div class="sr-container">
    <!-- ↓ これだけ残す（PATCH-04-fix） -->
    <div class="everyone__visual">
      <Image src="/images/for-everyone/for-everyone-full.webp" ... />
      <span class="everyone__num everyone__num--customers">+25%</span>
      <span class="everyone__num everyone__num--staff">−30分/日</span>
      <span class="everyone__num everyone__num--you">+15%</span>
    </div>

    <!-- ↓ 以下は完全削除 -->
    <!-- <div class="everyone__head">...</div> -->
    <!-- <div class="everyone__grid">...</div> -->
    <!-- <div class="eband">...</div> -->
  </div>
</section>
```

### 2) In Action タイムライン中央線の二重問題

**原因**: PATCH-05-fix で Scene 01/02 を `.scene-pair` の画像1枚に置換したが、
`.timeline::before` の中央線がまだ存在し、画像内の中央線と二重に見えている。

**修正方針**: `.timeline::before` の中央線を **Scene 03/04 の範囲のみ** に制限。

```css
/* 現状の `.timeline::before` が timeline 全体に縦線を引いている */
.timeline::before {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;          /* ← この位置に問題 */
  bottom: 0;
  width: 2px;
  background: var(--accent-soft);
}

/* ↓ 修正: Scene 03/04 の範囲（scene-block）に限定 */
.timeline::before {
  display: none;   /* timeline 直下からは消す */
}

.scene-block::before {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--accent-soft);
  z-index: 0;
}
```

**または代替案**: `.scene-pair`（画像1枚）の中の中央線が見えて、`.scene-block` でも線が描画される競合を解消するには、画像から中央線部分を取り除く（画像再生成）か、両方の線を統合する CSS 調整が必要。

シンプルな解決:
```css
.scene-pair {
  position: relative;
  z-index: 1;
}
/* 画像が中央線を持っているため、timeline::before との重なりを避ける */
.timeline::before {
  /* 画像のある範囲だけ非表示にする */
  top: auto;
  bottom: 0;
  height: calc(100% - 600px);  /* scene-pair の高さ分だけ短く */
}
```

→ 実装時はビジュアル確認しながら最適値を決定。

### 3) 他セクションのチェック

念のため以下もチェック：

| セクション | チェック項目 |
|---|---|
| Hero (01) | PATCH-01 の `.phone-area` 中身 と PATCH-01-FINAL の `.hero__bg` が同時に存在していないか |
| Problem (02) | 背面画像 `.problem__bg` が1つだけか |
| Solution (03) | 背面画像 + 下部パネル画像、それぞれ1つだけか |
| In Action (05/5b) | Scene 01/02 は画像1枚、Scene 03/04 は背景画像 + テキストカードが正しく重なっているか |
| AI Karte (06) | 背景画像1つ、機能カード内の写真は削除済みか |

---

## 実装手順（Claude Code 向け）

```
1. ブランチ: feature/lp-cleanup-duplicates
2. 各セクションの JSX/HTML を開き、以下を確認・削除:

  a) app/_sections/ForEveryone.tsx
     - .everyone__head / .everyone__grid / .eband を完全削除
     - .everyone__visual のみ残す

  b) app/_sections/InAction.tsx
     - .scene-pair（画像）の上下で .timeline::before が連続しないよう CSS 調整
     - .timeline::before を display: none にして .scene-block::before に移行

  c) その他セクションも目視で重複チェック

3. ローカルで PC/モバイル確認
4. git diff で削除のみ・追加なしを確認
5. PR 作成
```

---

## 厳守事項（Claude Code へ）

1. **削除のみ。新規追加は禁止**（タイムライン中央線の CSS 調整を除く）
2. **テキスト変更ゼロ**（既に画像化されているため、HTML テキストは存在しない or alt のみ）
3. PATCH-04-fix / PATCH-05-fix / PATCH-05b-fix / PATCH-06-fix のいずれも `-fix` が正
4. オリジナル PATCH-04 / PATCH-05 / PATCH-05b / PATCH-06 で追加された DOM/CSS は完全削除

---

## 確認ポイント

### For Everyone
- [ ] 上部の小さい人物写真2枚と「お客様も、これから雇うスタッフも〜」HTMLテキストが消えている
- [ ] 合成画像1枚だけが表示されている
- [ ] 下部の3つの個別カード（FOR CUSTOMERS / FOR STAFF / FOR YOU）が消えている
- [ ] 「すべては、1人サロンの成長のために」のHTMLバンドが消えている
- [ ] 合成画像内の数値（+25%, −30分/日, +15%）が見える

### In Action
- [ ] Scene 01/02 は画像1枚で表示されている
- [ ] タイムライン中央線が二重になっていない（1本のみ）
- [ ] Scene 03/04 は背景画像 + テキストカードが正しく重なっている

### 全体
- [ ] git diff で削除のみ
- [ ] PC とモバイル両方で重複なし
- [ ] テキスト変更ゼロ

---

## Claude Code 用 短縮プロンプト

```
LP の重複要素を削除してください。

【入力】
lp/PATCH-CLEANUP.md

【削除対象】
1. For Everyone セクション:
   - .everyone__head 配下すべて
   - .everyone__grid 配下の3つの <article class="ecard">
   - <div class="eband"> 全体

2. In Action セクション:
   - .timeline::before を display: none
   - 必要に応じて .scene-block::before で Scene 03/04 範囲のみ中央線を描画

【維持】
- For Everyone: .everyone__visual の合成画像と数値オーバーレイ3つのみ
- その他のセクション: 既存のまま

【検証】
PC/モバイルで重複が解消されているか目視確認。
git diff で削除のみ・テキスト追加なしを確認して報告。
```
