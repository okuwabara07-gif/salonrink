# PATCH-01-fix / Hero 画像配置の修正指示

> 対象: PATCH-01 で適用した Hero 画像の配置調整
> 問題: 写真が右カラム内に小さく収まってしまい、iPhone モック部分が極端に小さく見える
> 受領日: 2026.05.26

---

## 問題

PATCH-01 で `.phone-area` 内に画像を入れたところ、Hero 画像（salon全体 + iPhone + 吹き出しが焼き込み済み）が、**右カラムの幅 (約480px) に収まる小さなサムネイル**になってしまった。

写真内の iPhone と吹き出しが極端に小さく、訴求力が落ちている状態。

---

## 解決策（3つの選択肢）

### A案 ⭐ 推奨: 右カラム画像をはみ出させて大きく見せる

右カラムのコンテナはそのまま、画像のみ `transform: scale()` または `width` を拡張して、視覚的に大きく見せる。

```css
.phone-area {
  /* 既存のサイズ指定を上書き */
  height: auto;
  position: relative;
  overflow: visible;          /* 重要: はみ出しを許可 */
}

.hero__media {
  width: 130%;                /* コンテナよりはみ出させる */
  max-width: 720px;
  height: auto;
  display: block;
  margin-left: -15%;          /* 左に少しシフトして中央寄せ */
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15,22,20,0.12);
}
```

### B案: セクション全体を画像背景にし、テキストをオーバーレイ

ヒーロー全体に画像を敷き、左カラムのテキストを画像の上に乗せる。**最も大きく見えるが、テキスト可読性に注意**。

```css
.hero {
  position: relative;
  background-image: url('/images/hero/hero-salon-iphone.webp');
  background-size: cover;
  background-position: center right;
  min-height: 720px;
}

/* テキストを白オーバーレイで読みやすく */
.hero::before {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.95) 0%,
    rgba(255,255,255,0.85) 40%,
    rgba(255,255,255,0.3) 70%,
    transparent 100%
  );
  z-index: 0;
}

.hero__inner { position: relative; z-index: 1; }
.phone-area { display: none; }  /* 右カラム要素は不要 */
```

### C案: 画像から iPhone+吹き出しだけを切り抜いた版を作る

salon背景を捨て、iPhone + 吹き出し3つだけのトリミング版を別途用意し、右カラムに配置。
**画像再生成が必要**。

---

## 推奨フロー

1. **まず A案 を試す**（既存DOM変更なし、CSS修正のみ）
2. それでも小さく見えるなら **B案** に切り替え
3. B案で文字可読性が悪い場合のみ C案で画像再生成

---

## A案 実装手順（最小変更）

```diff
- .phone-area {
-   /* 既存 */
- }

+ .phone-area {
+   position: relative;
+   overflow: visible;
+   height: auto;
+ }
+
+ .hero__media {
+   width: 130%;
+   max-width: 720px;
+   height: auto;
+   display: block;
+   margin-left: -15%;
+   border-radius: 16px;
+   box-shadow: 0 20px 40px rgba(15,22,20,0.12);
+ }
```

モバイル時:
```css
@media (max-width: 980px) {
  .hero__media {
    width: 100%;
    margin-left: 0;
    max-width: none;
  }
}
```

---

## 確認ポイント

- [ ] iPhone モック部分が大きく視認できる
- [ ] 左カラムのテキストと画像が重ならない
- [ ] グリッドのレスポンシブが崩れない
- [ ] モバイル時、画像が画面幅に収まる
- [ ] テキスト・コピー一切変更なし

---

## Claude Code 用 短縮プロンプト

```
LP の Hero 画像が小さく表示されてしまっているため修正してください。
- 入力: lp/PATCH-01-fix.md
- 方針: まずA案（CSS修正のみで画像を 130% 幅にして左にシフト）
- A案で改善しなければ B案（背景画像化 + 左にホワイトグラデオーバーレイ）
- 既存DOM・テキスト変更ゼロ
- 完了後、PC/モバイル両方のスクショを添えて報告
```
