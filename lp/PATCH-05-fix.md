# PATCH-05-fix / In Action Scene 01/02 一枚画像差替指示

> 対象: PATCH-05 で適用した In Action セクション Scene 01/02 の修正
> 問題: 分割した人物写真の配置が小さく不自然
> 解決: **Scene 01/02 のエリア全体を 1枚の合成画像で表示**（PATCH-04-fix と同様の方針）
> 受領日: 2026.05.26

---

## 概要

In Action セクションの **Scene 01（07:00 朝）と Scene 02（09:30 午前）** を、
1枚の合成画像で全面表示する。

- 人物写真・iPhone モック・テキストカード・タイムラインドット が **すべて 1枚に焼き込み済み**
- HTML 側ではタイムラインドット位置などの UI 要素は不要

---

## 使用画像

| 項目 | 値 |
|---|---|
| ファイル名 | `in-action-scene-1-2-full.webp` |
| 配置パス | `public/images/in-action/in-action-scene-1-2-full.webp` |
| 元画像 | `lp/assets/in-action/in-action-scene-1-2-full.png` |
| 推奨表示幅 | 1240px（コンテナ最大） |
| alt | `"朝から夜まで、1日のサロン業務がこう流れる。Scene 01 / 07:00 朝: 朝のLINEに今日のサマリーが届く。予約件数・予測売上・再来候補がConciergeから自動配信。Scene 02 / 09:30 午前: HPB予約も一画面で確認。ホットペッパーBeautyの予約がLINE予約と同じ画面に自動で並びます。"` |

---

## 実装方針

### 既存DOM（PATCH-05 / 5b で実装済）を画像1枚に置換

```html
<section class="action" id="in-action">
  <div class="sr-container">
    <!-- 既存の見出しブロック（朝から夜まで…）は画像内に焼き込まれているので削除可 -->
    <!-- ただし、見出しのみ HTML テキストで残したい場合は維持してもよい -->

    <div class="timeline">
      <!-- ↓ Scene 01 と Scene 02 を画像1枚で置換 -->
      <div class="scene-pair scene-pair--1-2">
        <Image
          src="/images/in-action/in-action-scene-1-2-full.webp"
          alt="Scene 01 朝のLINEに今日のサマリーが届く / Scene 02 HPB予約も一画面で確認"
          width={1240}
          height={1080}
          className="scene-pair__img"
        />
      </div>

      <!-- ↓ Scene 03 / 04 は別途処理（PATCH-05b または PATCH-05b-fix で扱う） -->
      <div class="scene scene--reverse">...</div>
      <div class="scene">...</div>
    </div>
  </div>
</section>
```

---

## 必要 CSS

```css
.scene-pair {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto 48px;
}
.scene-pair__img {
  width: 100%;
  height: auto;
  display: block;
}

/* PATCH-05 で追加された .scene__photo は Scene 01/02 では不要になる
   → Scene 03/04 用に残す or 削除 */
```

---

## 厳守事項（Claude Code へ）

1. **Scene 01 と Scene 02 の `<div class="scene">` 2ブロックを削除し、画像1ブロックで置換**
2. Scene 03 / 04 はそのまま維持（PATCH-05b で別途処理）
3. セクション見出し「朝から夜まで、1日のサロン業務がこう流れる。」は画像内に焼き込まれているため、HTML 側の見出しは **削除推奨**（または残して画像内見出しと並存も可）
4. PATCH-05 で追加した `.scene__photo` 関連 CSS は Scene 03/04 で使うため残す
5. タイムライン中央線 `.timeline::before` の高さに注意 — 画像と Scene 03/04 を分離する場合は中央線の連続性を確認

---

## モバイル対応

```css
@media (max-width: 980px) {
  .scene-pair { padding: 0 16px; margin-bottom: 32px; }
  .scene-pair__img { border-radius: 12px; }
}
```

画像 1枚なので自動的に等比縮小される。テキスト可読性は元画像の文字サイズに依存する点に注意。
モバイルで文字が小さすぎる場合は、モバイル専用の縦長レイアウト版画像を別途用意することを検討。

---

## ⚠️ 注意（アクセシビリティ・SEO）

PATCH-04-fix と同様、セクションを画像化することで：
- SEO で各シーンのテキストが認識されない
- スクリーンリーダーは alt のみ読み上げ → **長文 alt を必ず設定**
- 将来テキスト変更には画像再生成が必要

更新頻度が低く、見た目重視のセクションでは有効。

---

## Scene 03/04 はどうする？

現在 PATCH-05b で「Scene 03 / 04 の左右に人物写真を追加」する方針になっている。
**Scene 03/04 も同じく 1枚画像化したい場合は、PATCH-05b-fix を後日発行**。

その際は同じパターン：
```
<div class="scene-pair scene-pair--3-4">
  <Image src="/images/in-action/in-action-scene-3-4-full.webp" ... />
</div>
```

---

## Claude Code 用 短縮プロンプト

```
LP の In Action セクション Scene 01/02 を 1枚の画像で全面差替してください。
- 入力: lp/PATCH-05-fix.md
- 画像: public/images/in-action/in-action-scene-1-2-full.webp
- 削除: Scene 01 と Scene 02 の <div class="scene"> 2つすべて
- 追加: <div class="scene-pair"> 内に <Image> 1つ
- セクション見出し「朝から夜まで…」は HTML 側削除（画像内に焼き込み済み）
- Scene 03 / 04 はそのまま維持
- alt に Scene 01/02 の全テキスト要素を網羅
- 完了後、PC/モバイル両方のスクショと表示確認を報告
```
