# PATCH-03 / Solution セクション 画像差替指示書

> 対象セクション: **03 / Solution（解決策）**
> スコープ: **2点の差替/新設のみ**。テキスト・配列・文章・クラス名・id は一切変更しない。
> 受領日: 2026.05.26

---

## 概要

Solution セクションに対し、以下2点を実施する：

1. **背面画像の追加**（セクション全体の最背面）— サロン店内 × スマホを見る女性スタイリストのぼかし画像
2. **下部パネルの画像差替**（既存の `.sband` パネル）— "For Hairstylists" デザインパネル画像に置き換え

既存の **左カラム「いつものLINE」/ 中央矢印 / 右カラム「裏側の業務レイヤー」** はそのまま。

---

## 使用画像

### A) 背面画像

| 項目 | 値 |
|---|---|
| ファイル名 | `solution-bg-stylist.webp` |
| 配置パス | `public/images/solution/solution-bg-stylist.webp` |
| フォールバック | `public/images/solution/solution-bg-stylist.png` |
| 原寸 | 1536 × 1024 px |
| 比率 | 3:2 |
| 重さ | PNG 1.87MB → **WebP で 300KB 目標** |
| alt | `""`（装飾画像、`aria-hidden="true"`） |
| 内容 | エプロン姿の女性スタイリストがスマホを見ている。背景に椅子・鏡・窓・植物。自然光、上品。 |

### B) 下部パネル画像

| 項目 | 値 |
|---|---|
| ファイル名 | `solution-bottom-panel.webp` |
| 配置パス | `public/images/solution/solution-bottom-panel.webp` |
| フォールバック | `public/images/solution/solution-bottom-panel.png` |
| 原寸 | 2172 × 724 px |
| 比率 | 約 3:1 |
| 重さ | PNG 601KB → **WebP で 120KB 目標** |
| alt | `"For Hairstylists — 導入しても、いつものLINEのまま。だから、定着しやすい。1人サロンでもすぐに使い始められる / 業務効率が上がり、接客に集中できる / HPB予約も同時に管理 / サロンの価値が、自然と積み上がる"` |
| 内容 | 横長の白いパネル。左に "For Hairstylists" 筆記体 + キャッチコピー、右に4つのアイコン+短文。HPB予約のブロックはグリーンでハイライト。 |

---

## 差替/追加対象（既存DOM）

### A) 背面画像の追加位置

`<section class="sol" id="solution">` 直下、既存DOMより前に `<Image>` 1つを追加。

```html
<section class="sol" id="solution">
  <!-- ↓ 追加：背面画像 -->
  <Image
    src="/images/solution/solution-bg-stylist.webp"
    alt=""
    aria-hidden="true"
    width={1536}
    height={1024}
    sizes="100vw"
    className="sol__bg"
  />

  <div class="sr-container">
    <div class="sol__head">...</div>
    <div class="sol__cols">...</div>
    <div class="sband">...</div>  <!-- ↓ B で差替 -->
  </div>
</section>
```

### B) 下部パネル `.sband` の中身を画像に差替

**既存の `.sband` 要素**（"導入しても、いつものLINEのまま。だから、定着しやすい。" を含むホワイトバンド）の **内部DOM全体を `<Image>` 1つで置換**する。

#### 既存（差替前）

```html
<div class="sband">
  <div class="sband__hd">...</div>
  <ul class="sband__items">...</ul>
</div>
```

#### 差替後

```html
<div class="sband">
  <Image
    src="/images/solution/solution-bottom-panel.webp"
    alt="For Hairstylists — 導入しても、いつものLINEのまま。だから、定着しやすい。1人サロンでもすぐに使い始められる / 業務効率が上がり、接客に集中できる / HPB予約も同時に管理 / サロンの価値が、自然と積み上がる"
    width={2172}
    height={724}
    sizes="(max-width: 980px) 100vw, 1200px"
    className="sband__media"
  />
</div>
```

> **重要**: `.sband` 自体は残す（既存スタイルの shadow / border-radius を活かす）。中身だけ画像化する。

---

## 必要 CSS（最小限のみ）

```css
/* ── A) 背面画像 ── */
.sol { position: relative; overflow: hidden; }  /* 既存に既にある */

.sol__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center left;   /* 女性スタイリストが見切れないよう左寄せ */
  z-index: 0;
  opacity: 0.45;                  /* 前景の可読性確保のため薄め */
  pointer-events: none;
  user-select: none;
}

/* セクション全体を白っぽく覆うオーバーレイ */
.sol::before {
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

/* 既存の .sr-container を画像の上に乗せる */
.sol .sr-container {
  position: relative;
  z-index: 1;
}

/* ── B) 下部パネル ── */
.sband {
  /* 既存の shadow / border / radius / background は維持 */
  padding: 0 !important;          /* 中身が画像になるため余白をリセット */
  overflow: hidden;
}
.sband__media {
  display: block;
  width: 100%;
  height: auto;
  border-radius: inherit;         /* 親 .sband の角丸を継承 */
}
```

---

## 厳守事項（Claude Code へ）

1. **左カラム「いつものLINE」「YOUR LINE OFFICIAL ACCOUNT」全体は一切変更しない**
2. **右カラム「裏側の業務レイヤー」「SALONRINK — LAYER」全体も一切変更しない**
3. **中央の矢印（`.sol__arrow`）も維持**
4. 削除する DOM は **`.sband` の中身（`.sband__hd` + `.sband__items`）のみ**
5. `.sband` 自体（カードの枠）は残す
6. 新規追加: `<Image>` ×2（背面 + sband内）
7. 他セクションには触らない

---

## 確認ポイント

- [ ] SOLUTION ラベル・見出し「LINEを置き換えない。LINEに、"乗せる"。」がそのまま
- [ ] 左カラムの「UI / 予約 / 管理 / 通知」4機能リストが元のまま
- [ ] 右カラムの「AUTO / 検索 / 記録 / 提案」4機能リストが元のまま
- [ ] 中央のグリーン円形矢印が元の位置
- [ ] 下部パネルが画像1枚に置き換わっている
- [ ] 背景画像が薄く透けて、前景の白カードを邪魔しない
- [ ] モバイル（〜980px）で下部パネル画像が横スクロールせず収まる
- [ ] git diff にテキスト変更が一切ないこと

---

## 補足

### アクセシビリティ警告
**下部パネルを画像化するとパネル内の文字が画面読み上げソフトで読めなくなる**ため、
`alt` 属性にすべてのテキストを書き起こした完全版を必ず入れる（上記 `alt` 参照）。

将来的にこのパネルをテキストに戻したい場合は、現状の `.sband__hd` + `.sband__items` の構造を維持したまま中の文字を新パネルの文字（"1人サロンでもすぐに使い始められる" 等）に置き換える方式が望ましい。今回は**画像差替のみ**ルールに従い、画像化で対応する。

### モバイル対応
- パネル画像は横長（約 3:1）のため、モバイルでは縦幅が小さくなりすぎる可能性あり
- `sizes="(max-width: 980px) 100vw, 1200px"` で対応
- 文字可読性が落ちるようなら、モバイル用に縦並び版の画像を別途用意することを検討（今回は不要）

### 参考画像
完成形イメージ: `lp/assets/solution/_reference-final.png`

---

## Claude Code 用 短縮プロンプト

```
LP の Solution セクションに、画像のみ差替/追加してください。
- 入力: lp/PATCH-03-solution.md
- 画像A: public/images/solution/solution-bg-stylist.webp（背面）
- 画像B: public/images/solution/solution-bottom-panel.webp（下部パネル中身）
- 追加: .sol 直下に <Image> 1つ（背面）
- 差替: .sband の中身（.sband__hd と .sband__items）を <Image> 1つに置換
- 維持: 左右カラム、中央矢印、見出し、その他すべて
- 完了後、git diff にテキスト変更が0であることを確認して報告
```
