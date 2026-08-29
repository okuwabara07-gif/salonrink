# PATCH-05b / In Action セクション Scene 03/04 画像追加指示書

> 対象: **05 / In Action（1日の動き）の Scene 03 と Scene 04**
> スコープ: **B案 — シーン両脇に人物写真を4点追加**。テキスト・タイムライン構造・iPhone モック・クラス名は一切変更しない。
> 受領日: 2026.05.26
> 関連: PATCH-05（Scene 01/02）の続編。同じ z-index / CSS パターンを踏襲。

---

## 概要

Scene 03（来店前 13:45）と Scene 04（営業後 18:00）の左右に人物写真を装飾配置する。

### Scene 03（13:45 来店前）
- **左**: タブレットを2人で覗き込む女性スタッフ（顧客情報を確認している様子）
- **右**: 笑顔で接客するスタイリスト（来店直後のシーン）

### Scene 04（18:00 営業後）
- **左**: カウンターで穏やかに対話する女性2人（営業後の落ち着き）
- **右**: お客様を見送る女性スタッフ（夕方の見送り）

---

## 使用画像（4点）

| ID | ファイル名 | シーン / 位置 | 推奨表示サイズ |
|---|---|---|---|
| A | `scene3-tablet-pair.png`     | 03 左 | 280×220 |
| B | `scene3-consult-smile.png`   | 03 右 | 320×180 |
| C | `scene4-counter-consult.png` | 04 左 | 240×260 |
| D | `scene4-wave-goodbye.png`    | 04 右 | 420×280 |

すべて `public/images/in-action/{filename}.webp` に変換・配置。

| 画像 | alt |
|---|---|
| A | `"タブレットで顧客のLINE履歴を確認するスタッフ2名"` |
| B | `"笑顔で来店直後のお客様と対話するスタイリスト"` |
| C | `"カウンターでお客様と次回の提案を話すスタッフ"` |
| D | `"営業後、お客様を見送る店主"` |

---

## 差替/追加対象（既存DOM）

PATCH-05 と同一構造。各シーン `<div class="scene">` または `<div class="scene scene--reverse">` の左右に `<Image>` ×2 を追加。

### Scene 03（既存DOM そのまま、画像2枚追加）

```html
<div class="scene">
  <!-- ↓ 追加：左の人物写真 -->
  <Image
    src="/images/in-action/scene3-tablet-pair.webp"
    alt="タブレットで顧客のLINE履歴を確認するスタッフ2名"
    width={280}
    height={220}
    className="scene__photo scene__photo--l"
  />

  <!-- 以下、既存DOMそのまま -->
  <div class="scene__body scene__body--left">...</div>
  <div class="scene__dot">03</div>
  <div class="scene__phone">...</div>

  <!-- ↓ 追加：右の人物写真 -->
  <Image
    src="/images/in-action/scene3-consult-smile.webp"
    alt="笑顔で来店直後のお客様と対話するスタイリスト"
    width={320}
    height={180}
    className="scene__photo scene__photo--r"
  />
</div>
```

### Scene 04（同様、reverse 構造）

```html
<div class="scene scene--reverse">
  <Image
    src="/images/in-action/scene4-counter-consult.webp"
    alt="カウンターでお客様と次回の提案を話すスタッフ"
    width={240}
    height={260}
    className="scene__photo scene__photo--l"
  />
  <div class="scene__phone">...</div>
  <div class="scene__dot">04</div>
  <div class="scene__body scene__body--right">...</div>
  <Image
    src="/images/in-action/scene4-wave-goodbye.webp"
    alt="営業後、お客様を見送る店主"
    width={420}
    height={280}
    className="scene__photo scene__photo--r"
  />
</div>
```

---

## 必要 CSS

**PATCH-05 で既に定義済みの `.scene__photo / .scene__photo--l / .scene__photo--r` をそのまま流用**。追加CSS不要。

```css
/* PATCH-05 で定義済み。再掲のみ */
.scene { position: relative; }
.scene__photo {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  width: auto;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
  z-index: 0;
  opacity: 0.92;
}
.scene__photo--l { left: -120px; max-width: 260px; }
.scene__photo--r { right: -100px; max-width: 320px; }
@media (max-width: 980px) {
  .scene__photo { display: none; }
}
```

---

## 厳守事項（Claude Code へ）

1. Scene 03 の見出し「名前を打つだけで、過去のすべてが瞬時に。」は一切変更しない
2. Scene 04 の見出し「『次の連絡、誰に？』を、自動で提案。」は一切変更しない
3. 既存の iPhone モック（@田中様 / Concierge カルテ / Concierge 提案配信文案）の中身は一切変更しない
4. タイムラインの 03 / 04 ドットも維持
5. PATCH-05 で追加済みの `.scene__photo` クラスを再利用、新規CSSは追加しない
6. 削除は禁止。追加は `<Image>` ×4 のみ

---

## 確認ポイント

- [ ] Scene 03 のテキスト・タグ・iPhone モック内UI が全て元のまま
- [ ] Scene 04 のテキスト・タグ・iPhone モック内UI が全て元のまま
- [ ] Scene 03 / 04 のタイムラインドット位置が崩れていない
- [ ] モバイル時、人物写真が消えてシーン本体が正しく表示される
- [ ] git diff にテキスト変更が一切ないこと

---

## Claude Code 用 短縮プロンプト

```
LP の In Action セクション Scene 03 / 04 の両脇に、人物写真を計4点追加してください。
- 入力: lp/PATCH-05b-in-action-3-4.md
- 画像: public/images/in-action/{scene3-tablet-pair, scene3-consult-smile, scene4-counter-consult, scene4-wave-goodbye}.webp
- 配置: PATCH-05 と同パターン（.scene の最初と最後に <Image> ×2）
- CSS: PATCH-05 で定義済みの .scene__photo を再利用
- 維持: テキスト、iPhone モック内UI、すべて
- 完了後、git diff にテキスト変更が0であることを確認して報告
```
