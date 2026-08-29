# PATCH-04-fix / For Everyone セクション 一枚画像差替指示

> 対象: PATCH-04 で適用した For Everyone セクションの修正
> 問題: 5点に分割した写真の配置が小さく不自然
> 解決: **セクション全体を1枚の合成画像で表示**し、**数字（+25% / −30分/日 / +15%）のみ HTML テキストで上に重ねる**
> 受領日: 2026.05.26

---

## 概要

For Everyone セクションの内容（見出し + 3カード + 写真）を **1枚の合成画像** で全面表示。
数値部分（+25%、−30分/日、+15%）だけは画像の上に HTML テキストとして重ね、後から更新可能にする。

---

## 使用画像

| 項目 | 値 |
|---|---|
| ファイル名 | `for-everyone-full.webp` |
| 配置パス | `public/images/for-everyone/for-everyone-full.webp` |
| 元画像 | `lp/assets/for-everyone/for-everyone-full.png` |
| 推奨表示幅 | 1240px（コンテナ最大） |
| alt | `"FOR EVERYONE — お客様も、これから雇うスタッフも、そしてあなた自身も。3つの視点から見たSalonRinkの価値（FOR CUSTOMERS / FOR STAFF / FOR YOU）"` |

---

## 実装方針

### A) セクション内の既存DOMを画像1枚に置換

```html
<section class="everyone" id="everyone">
  <div class="sr-container">
    <!-- ↓ 既存の .everyone__head / .everyone__grid / .eband を全て削除して以下に置換 -->
    <div class="everyone__visual">
      <Image
        src="/images/for-everyone/for-everyone-full.webp"
        alt="FOR EVERYONE — お客様も、これから雇うスタッフも、そしてあなた自身も。"
        width={1240}
        height={1080}
        className="everyone__visual-img"
      />

      <!-- ↓ 数値オーバーレイ（編集可能） -->
      <span class="everyone__num everyone__num--customers" data-key="customers">+25%</span>
      <span class="everyone__num everyone__num--staff" data-key="staff">−30分/日</span>
      <span class="everyone__num everyone__num--you" data-key="you">+15%</span>
    </div>
  </div>
</section>
```

### CSS（数値をピクセル位置で正確に重ねる）

```css
.everyone__visual {
  position: relative;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
}
.everyone__visual-img {
  width: 100%;
  height: auto;
  display: block;
}

/* 数値オーバーレイ — 画像内のピクセル位置に対する % 指定 */
.everyone__num {
  position: absolute;
  font-family: 'Noto Serif JP', serif;
  font-weight: 700;
  color: #06C755;
  white-space: nowrap;
  line-height: 1;
  /* font-size はビューポート連動でスケール */
  font-size: clamp(20px, 2.6vw, 38px);
  letter-spacing: -0.02em;
  pointer-events: none;
}

/* 画像内の位置 ※ 実画像で位置調整して微修正 */
.everyone__num--customers {
  top: 41%;  left: 6%;
}
.everyone__num--staff {
  top: 41%;  left: 38%;
}
.everyone__num--you {
  top: 41%;  left: 72%;
}

/* モバイル時は画像 100% 幅、数値スケール調整 */
@media (max-width: 980px) {
  .everyone__num { font-size: clamp(14px, 4vw, 24px); }
}
```

---

## 数値の更新方法（将来）

CMSや Tweaks UI から数値だけ変更したい場合：

```tsx
const stats = {
  customers: '+25%',
  staff: '−30分/日',
  you: '+15%',
};

<span className="everyone__num everyone__num--customers">{stats.customers}</span>
```

画像の数字は **常に元画像の数字** として残るため、HTML テキスト側の数字で**上書き**する形になる。

→ **重要**: 画像内に書かれている数字（+25 / −30 / +15）と、HTML 側の数字を **必ず同じにする**。
HTML 側だけ変更すると画像と矛盾するため、数字を変更する際は **画像も再生成して両方更新** する。

---

## 厳守事項（Claude Code へ）

1. 既存の `.everyone__head` `.everyone__grid` `.eband` の中身は削除して画像で置換
2. 数値 `+25%` `−30分/日` `+15%` の HTML テキストは残す（編集可能性のため）
3. ヘッダ「FOR EVERYONE」とメイン見出しは画像内に焼き込まれているため HTML テキスト不要
4. 同様にカードの中身（説明文・リスト・引用）も画像内に焼き込み済み
5. アクセシビリティのため `alt` に全要素を網羅したテキストを記述

---

## ⚠️ 注意（アクセシビリティ・SEO）

- セクション全体を画像化するため、**SEO で各カードのテキストが認識されない**
- スクリーンリーダーは alt のみ読み上げ → **本文の長文 alt を必ず設定**
- 将来テキストを A/B テストしたい場合は、この方式では困難
- それでも見た目優先・更新頻度低めなら有効な解決策

---

## Claude Code 用 短縮プロンプト

```
LP の For Everyone セクションを 1枚の画像で全面差替してください。
- 入力: lp/PATCH-04-fix.md
- 画像: public/images/for-everyone/for-everyone-full.webp
- 削除: .everyone__head / .everyone__grid / .eband の中身すべて
- 追加: <Image> 1つ + 数値オーバーレイ <span> ×3（+25% / −30分/日 / +15%）
- CSS: .everyone__visual と .everyone__num--{customers,staff,you} を position: absolute で配置
- alt は全要素を網羅した長文に
- 完了後、PC/モバイル両方のスクショと数値位置の確認を報告
```
