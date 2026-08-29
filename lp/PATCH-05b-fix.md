# PATCH-05b-fix / In Action Scene 03/04 背景画像差替指示

> 対象: PATCH-05b で適用した In Action セクション Scene 03/04 の修正
> 問題: 4枚の人物写真をシーン両脇に配置したが、レイヤーがずれて不自然
> 解決: **4枚の人物写真を全削除し、1枚の背景画像を Scene 03/04 エリア全体の最背面に配置**
> 受領日: 2026.05.26

---

## 概要

In Action セクションの **Scene 03（13:45 来店前）と Scene 04（18:00 営業後）** のエリアに対し：

1. **PATCH-05b で追加した4枚の人物写真をすべて削除**
2. **代わりに「サロン店内でスマホを操作する女性店主」の画像1枚を最背面に配置**
3. **既存のテキストカードと iPhone モックは画像の上にそのまま乗る**

---

## 使用画像

| 項目 | 値 |
|---|---|
| ファイル名 | `in-action-scene-3-4-bg.webp` |
| 配置パス | `public/images/in-action/in-action-scene-3-4-bg.webp` |
| 元画像 | `lp/assets/in-action/in-action-scene-3-4-bg.png` |
| 推奨表示幅 | 100vw（フルブリード）または 1240px（コンテナ準拠） |
| alt | `""`（装飾画像、`aria-hidden="true"`） |
| 内容 | スマホを見て微笑む女性店主、明るいサロン店内、自然光、植物・椅子・鏡 |

---

## 削除対象（PATCH-05b で追加した画像）

以下4つの `<Image>` 要素をすべて削除する：

- Scene 03 左: `scene3-tablet-pair.webp`
- Scene 03 右: `scene3-consult-smile.webp`
- Scene 04 左: `scene4-counter-consult.webp`
- Scene 04 右: `scene4-wave-goodbye.webp`

対応する `<Image>` 要素を JSX から削除。
`/public/images/in-action/` 内のファイル自体は残しても OK（参照されなくなる）。

---

## 追加方針

Scene 03 と Scene 04 を包む **新しいラッパー要素** を作り、その背面に画像を配置。

### 実装

```html
<section class="action" id="in-action">
  <div class="sr-container">
    <!-- 既存の見出し / 既存の Scene-pair (01-02) 略 -->

    <!-- ↓ Scene 03 と 04 を新ラッパーで囲む -->
    <div class="scene-block scene-block--3-4">

      <!-- ↓ 新規追加：背景装飾画像 -->
      <Image
        src="/images/in-action/in-action-scene-3-4-bg.webp"
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        className="scene-block__bg"
      />

      <!-- 既存 Scene 03 / 04（PATCH-05b で追加した <Image> は削除済） -->
      <div class="scene">
        <div class="scene__body scene__body--left">...</div>
        <div class="scene__dot">03</div>
        <div class="scene__phone">...</div>
      </div>

      <div class="scene scene--reverse">
        <div class="scene__phone">...</div>
        <div class="scene__dot">04</div>
        <div class="scene__body scene__body--right">...</div>
      </div>
    </div>
  </div>
</section>
```

---

## 必要 CSS

```css
.scene-block {
  position: relative;
  padding: 64px 0;
  overflow: hidden;
}

.scene-block__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
  opacity: 0.35;            /* テキスト可読性確保のため薄く */
  pointer-events: none;
  user-select: none;
}

/* 背景の上に白オーバーレイで馴染ませる */
.scene-block::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.8) 100%
  );
  z-index: 0;
  pointer-events: none;
}

/* Scene の中身を画像と白オーバーレイの上に乗せる */
.scene-block .scene {
  position: relative;
  z-index: 1;
}

/* タイムライン中央線は scene-block の中でも継続させる */
.scene-block .timeline-rail {
  /* 既存の .timeline::before に相当する縦線が必要なら追加 */
}
```

---

## 厳守事項（Claude Code へ）

1. **PATCH-05b で追加した4つの `<Image>`（人物写真）を JSX から削除**
2. PATCH-05b で追加した CSS（`.scene__photo--l/--r`）は **Scene 01/02 で使っている場合は残す**。Scene 03/04 専用なら削除可
3. Scene 03 / 04 のテキスト・iPhone モック内UI（@田中様 / Concierge カルテ / 配信文案）は一切変更しない
4. タイムライン中央線（縦の線）が背景画像で途切れないよう、`.scene-block` 内でも連続させる
5. 追加 DOM は `.scene-block` ラッパー + 背景 `<Image>` 1つのみ

---

## 確認ポイント

- [ ] 4枚の人物写真が画面から消えている
- [ ] Scene 03 の見出し「名前を打つだけで、過去のすべてが瞬時に。」がそのまま
- [ ] Scene 04 の見出し「『次の連絡、誰に？』を、自動で提案。」がそのまま
- [ ] iPhone モック内のUI（@田中様 カルテ / Concierge 配信文案）が元のまま
- [ ] タイムラインドット 03 / 04 と中央線が連続している
- [ ] 背景画像が薄く透けて、前景の白カードを邪魔しない
- [ ] モバイル時、背景画像 + テキストカードが正しく表示される
- [ ] git diff にテキスト変更が一切ないこと

---

## 補足

### opacity 値のチューニング
- 推奨: `0.35`（前景の白カードがクリーンに見える）
- 画像をもっと前面に出したい場合: `0.55-0.65`
- 装飾を抑えたい場合: `0.2-0.25`

### モバイル対応
画像 1枚を `object-fit: cover` で配置するため、自動的にトリミングされる。
画像の中央〜左に被写体（女性）がいるため、`object-position: center left` も検討可。

```css
@media (max-width: 980px) {
  .scene-block__bg {
    object-position: center top;  /* モバイルで被写体を上寄せ */
    opacity: 0.25;                /* モバイルでさらに薄める */
  }
}
```

### Scene 01/02 との繋がり
PATCH-05-fix で Scene 01/02 を「1枚画像化」した場合、Scene 03/04 のこの背景画像との繋がりに注意：
- Scene 01/02 画像 → タイムライン継続 → Scene 03/04 背景画像

縦の中央線が連続するように、両セクションの間に `margin: 0`、padding 調整。

---

## Claude Code 用 短縮プロンプト

```
LP の In Action セクション Scene 03/04 を修正してください。
- 入力: lp/PATCH-05b-fix.md
- 削除: PATCH-05b で追加した4枚の人物写真 <Image>
- 追加: Scene 03/04 を <div class="scene-block scene-block--3-4"> で包み、最背面に <Image> 1つ
- 画像: public/images/in-action/in-action-scene-3-4-bg.webp（装飾、opacity 0.35）
- 維持: Scene 03/04 のテキスト、iPhone モック内UI、タイムラインドット
- 完了後、git diff にテキスト変更が0であることを確認して報告
```
