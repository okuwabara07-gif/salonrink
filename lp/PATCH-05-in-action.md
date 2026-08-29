# PATCH-05 / In Action セクション 画像差替指示書

> 対象セクション: **05 / In Action（1日の動き）**
> スコープ: **B案 — シーン両脇に人物写真を4点追加**。テキスト・配列・タイムライン構造・iPhone モック・クラス名は一切変更しない。
> 受領日: 2026.05.26

---

## ⚠️ 確認事項

添付画像には **Scene 01（朝）と Scene 02（午前 HPB予約）の2シーンのみ**が含まれています。
現状の LP には **4シーン構成**（01 朝 / 02 予約 / 03 来店前 / 04 営業後）があります。

**Scene 03 / 04 にも人物写真を追加しますか？**

- A) **2シーンのみ写真追加**（添付画像通り、Scene 01/02 のみ）
- B) **4シーン全部に写真追加**（残り2シーン分の写真を別途用意・指示してもらう）

本指示書は **A: 2シーンのみ** を前提に記載。B の場合は追加写真受領後に PATCH-05b を発行。

---

## 概要

In Action セクションの各シーン左右に人物写真を装飾配置する。
タイムラインのテキスト・iPhone モック・サマリーカード等のUIは既存のまま。

### Scene 01（07:00 朝）
- **左**: タブレットを持って覗き込む女性
- **右**: iPhone を見ながら接客中の男性スタッフ

### Scene 02（09:30 午前）
- **左**: 髪を整えている女性スタイリスト + 後ろ姿のお客様
- **右**: タブレットを操作する男性スタッフ

---

## 使用画像（4点）

| ID | ファイル名 | シーン / 位置 | 推奨表示サイズ |
|---|---|---|---|
| A | `scene1-tablet-woman.png`     | 01 左 | 240×440 |
| B | `scene1-phone-woman.png`      | 01 右 | 320×410 |
| C | `scene2-stylist-customer.png` | 02 左 | 280×540 |
| D | `scene2-stylist-man.png`      | 02 右 | 250×540 |

すべて `public/images/in-action/{filename}.webp` に変換・配置。

| 画像 | alt |
|---|---|
| A | `"タブレットでConciergeの朝のサマリーを確認するスタイリスト"` |
| B | `"スマートフォンを見ながら接客するスタイリスト"` |
| C | `"お客様の髪を整えるスタイリスト"` |
| D | `"タブレットでHPB予約とLINE予約を統合管理するスタッフ"` |

---

## 差替/追加対象（既存DOM）

### 共通方針

各シーン `<div class="scene">` または `<div class="scene scene--reverse">` の **左右の余白部分（タイムライン外）に人物写真を absolute 配置** する。
既存のテキスト・dot・phone モックには触らない。

### Scene 01（既存DOM そのまま、人物写真2枚を追加）

```html
<div class="scene">
  <!-- ↓ 追加：左の人物写真 -->
  <Image
    src="/images/in-action/scene1-tablet-woman.webp"
    alt="タブレットでConciergeの朝のサマリーを確認するスタイリスト"
    width={250}
    height={470}
    className="scene__photo scene__photo--l"
  />

  <!-- 以下、既存DOMそのまま -->
  <div class="scene__body scene__body--left">...</div>
  <div class="scene__dot">01</div>
  <div class="scene__phone">...</div>

  <!-- ↓ 追加：右の人物写真 -->
  <Image
    src="/images/in-action/scene1-phone-woman.webp"
    alt="スマートフォンを見ながら接客するスタイリスト"
    width={320}
    height={410}
    className="scene__photo scene__photo--r"
  />
</div>
```

### Scene 02（同様、reverse なので画像位置は左/右で対応）

```html
<div class="scene scene--reverse">
  <Image
    src="/images/in-action/scene2-stylist-customer.webp"
    alt="お客様の髪を整えるスタイリスト"
    width={290}
    height={555}
    className="scene__photo scene__photo--l"
  />
  <div class="scene__phone">...</div>
  <div class="scene__dot">02</div>
  <div class="scene__body scene__body--right">...</div>
  <Image
    src="/images/in-action/scene2-stylist-man.webp"
    alt="タブレットでHPB予約とLINE予約を統合管理するスタッフ"
    width={250}
    height={540}
    className="scene__photo scene__photo--r"
  />
</div>
```

---

## 必要 CSS（最小限のみ）

```css
.scene {
  position: relative;       /* 既存に既にある */
}

.scene__photo {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: auto;
  max-height: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  z-index: 0;               /* テキスト・iPhone モックより背面 */
  opacity: 0.92;            /* 軽く馴染ませる */
}

/* 左の人物写真はセクション左端に */
.scene__photo--l {
  left: -120px;             /* セクションコンテナ外までせり出す */
  max-width: 260px;
}

/* 右の人物写真はセクション右端に */
.scene__photo--r {
  right: -100px;
  max-width: 320px;
}

/* テキスト・dot・phone モックを写真の上に乗せる */
.scene__body,
.scene__dot,
.scene__phone {
  position: relative;
  z-index: 1;
}

/* セクション全体に overflow が必要な場合は調整 */
.action {
  overflow: hidden;         /* 既存に既にある場合は不要 */
}

/* モバイル時は人物写真を非表示（テキストとUIモック優先） */
@media (max-width: 980px) {
  .scene__photo { display: none; }
}
```

---

## 厳守事項（Claude Code へ）

1. **各シーンのテキスト**（時刻ラベル、見出し、説明、タグ）は一切変更しない
2. **iPhone モック内のUI**（SalonRink Concierge、HPB予約取込 画面）は既存のまま
3. **タイムライン dot（01, 02）**と中央線も既存のまま
4. **削除/並び替えは禁止**。追加は `<Image>` ×4 のみ
5. 写真の `z-index: 0` で背面、テキスト・モックは `z-index: 1` で前面
6. モバイル時は写真を非表示にしてレイアウト崩れを防ぐ
7. Scene 03 / 04 が4シーン構成のままなら、写真追加はせずそのまま残す

---

## 確認ポイント

- [ ] Scene 01 の見出し「朝のLINEに、今日のサマリーが届く。」がそのまま
- [ ] Scene 02 の見出し「HPB予約も一画面で確認。」がそのまま
- [ ] iPhone モック内の「予約件数 5件 / 予測売上 ¥48,200 / 再来候補 3名」が元のまま
- [ ] iPhone モック内の「HPB 新規予約 / 5/30 11:00 / 白髪染め＋カット」が元のまま
- [ ] タイムラインの 01 / 02 ドットと中央線が崩れていない
- [ ] モバイル時、人物写真が消えてシーン本体が正しく表示される
- [ ] git diff にテキスト変更が一切ないこと

---

## 補足

### 元データ
- 添付された1枚の合成画像（`lp/assets/in-action/_source-composite.png`）から4箇所切り出し
- ChatGPT 生成画像のため解像度は粗め
- 本番では人物実写撮影 or 高解像度AI画像への差替を推奨

### Scene 03 / 04 の取り扱い
現状の LP の4シーン構成を維持する場合、Scene 03 / 04 には人物写真を追加しない。
将来的に追加する場合は、本指示書と同じパターンで PATCH-05b を発行。

### z-index 設計
| 要素 | z-index |
|---|---|
| `.scene__photo` (人物写真) | 0 |
| `.scene__body` / `.scene__dot` / `.scene__phone` | 1 |
| タイムライン中央線 `.timeline::before` | 0（既存） |

人物写真は背景装飾なので、テキストや UI に重なってもクリック・選択を妨げないよう `pointer-events: none`。

---

## Claude Code 用 短縮プロンプト

```
LP の In Action セクションに、Scene 01 / 02 の両脇に人物写真を計4点追加してください。
- 入力: lp/PATCH-05-in-action.md
- 画像: public/images/in-action/{scene1-tablet-woman, scene1-phone-woman, scene2-stylist-customer, scene2-stylist-man}.webp
- 配置: 各 .scene の最初と最後に <Image> ×2、計 ×4
- z-index: 写真=0 / テキスト・モック=1
- モバイル時は display: none
- 維持: タイムライン、テキスト、iPhone モック内UI、すべて
- Scene 03 / 04 には触らない
- 完了後、git diff にテキスト変更が0であることを確認して報告
```
