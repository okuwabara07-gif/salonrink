# SalonRink LP — 画像差替/新設 進捗サマリー

> 最終更新: 2026.05.26
> ステータス: **本日分の指示書作成完了**

---

## 本日完成した指示書（Claude Code 引渡し可）

| # | セクション | 指示書ファイル | 画像点数 | 種別 |
|---|---|---|---|---|
| 01 | Hero | `lp/PATCH-01-hero.md` | 1点 | 右カラム iPhone+吹き出しを実写画像で置換 |
| 02 | Problem | `lp/PATCH-02-problem.md` | 1点 | セクション最背面に装飾画像 |
| 03 | Solution | `lp/PATCH-03-solution.md` | 2点 | 背面画像 + 下部パネル画像化 |
| 04 | For Everyone | `lp/PATCH-04-for-everyone.md` | 5点 | ヘッダ左右2点 + 3カード上部に各1点 |
| 05 | In Action（Scene 01/02） | `lp/PATCH-05-in-action.md` | 4点 | 各シーン左右に人物写真 |
| 05b | In Action（Scene 03/04） | `lp/PATCH-05b-in-action-3-4.md` | 4点 | 同上、PATCH-05 の CSS 再利用 |
| 06 | AI Karte | `lp/PATCH-06-ai-karte.md` | 4点 | メインビジュアル + 3カードに各1点 |

**合計**: 7枚の指示書 / 画像21点配置済み

---

## ファイル構成

```
lp/
├── PATCH-01-hero.md
├── PATCH-02-problem.md
├── PATCH-03-solution.md
├── PATCH-04-for-everyone.md
├── PATCH-05-in-action.md
├── PATCH-05b-in-action-3-4.md
├── PATCH-06-ai-karte.md
├── IMAGE_ONLY_PATCH_GUIDE.md      ← 全体方針
└── assets/
    ├── hero/
    │   ├── hero-salon-iphone.png
    │   └── _reference-final.png
    ├── problem/
    │   ├── problem-bg-salon.png
    │   └── _reference-final.png
    ├── solution/
    │   ├── solution-bg-stylist.png
    │   ├── solution-bottom-panel.png
    │   └── _reference-final.png
    ├── for-everyone/
    │   ├── header-left-customer.png
    │   ├── header-right-staff.png
    │   ├── card1-customer.png
    │   ├── card2-staff.png
    │   ├── card3-you.png
    │   └── _source-composite.png
    ├── in-action/
    │   ├── scene1-tablet-woman.png
    │   ├── scene1-phone-woman.png
    │   ├── scene2-stylist-customer.png
    │   ├── scene2-stylist-man.png
    │   ├── scene3-tablet-pair.png
    │   ├── scene3-consult-smile.png
    │   ├── scene4-counter-consult.png
    │   ├── scene4-wave-goodbye.png
    │   ├── _source-composite.png
    │   ├── _source-scene-03-04.png
    │   └── photo-pool/            ← 未使用も含む素材プール
    └── ai-karte/
        ├── karte-hero-color-palette.png
        ├── feat1-tablet-pair.png
        ├── feat2-color-palette.png
        ├── feat3-tablet-three.png
        └── _source-current.png
```

---

## 残り対応セクション（未着手）

| # | セクション | 状況 |
|---|---|---|
| 07 | NUMBERS | 写真未受領 |
| 08 | CASE 01（キレイ鶴見店） | 写真未受領 |
| 09 | ONBOARDING | 写真未受領 |
| 10 | COMPARE | 写真未受領 |
| – | VIDEO TOUR（現行維持） | 画像差替の必要性未確認 |
| – | INTEGRATIONS（現行維持） | 同上 |
| – | PLANS（現行維持） | 同上 |
| – | FAQ（現行維持） | 同上 |
| – | START FREE / 最終CTA | 同上 |

---

## Claude Code への渡し方

### オプション A: 一括渡し
本日完成分（PATCH-01 〜 PATCH-06）と各画像アセットをまとめて zip 化し、
Claude Code に「上から順に1セクションずつ実装してください」と依頼。

### オプション B: 1セクションずつ
1つの PATCH-NN.md と該当画像のみを渡し、PR が立ったらレビュー → 次の PATCH。

**推奨**: オプション B（1コミット = 1セクションで diff レビューしやすい）

### Claude Code 用 共通プロンプト（毎回これを先頭に）

```
SalonRink.com の LP に、添付の PATCH-{NN}.md に沿って画像のみを差替/追加してください。

【厳守】
- テキスト・配列・文章・クラス名・id は一切変更禁止
- DOM の追加/削除は PATCH で明示されたもののみ
- スタイル変更は PATCH で明示された範囲のみ
- next/image を使う
- WebP に変換した上で /public/images/{section}/ に配置

【完了報告】
1. 該当ファイル名と git diff の要約
2. 「テキスト変更ゼロ」の確認
3. 追加した画像のパスとサイズ一覧
4. Lighthouse スコア（LCP / CLS）が劣化していないこと
```

---

## 翌日以降の進め方

1. 残り5セクション（07-10 + 既存維持系）の写真を順次受領
2. 各々 PATCH-NN.md を発行
3. すべて揃ったら Claude Code に一括渡し or 順次渡し
4. レビュー後本番デプロイ

---

## 留意事項

- **アクセシビリティ**: Solution 下部パネルは画像化により内文が読み上げ不能。alt で全文補完済みだが、将来的に HTML テキスト化が望ましい
- **モバイル対応**: 全 PATCH で 980px 以下では装飾画像を非表示にしている
- **画像最適化**: PNG → WebP 変換は Claude Code 実装時に必須。元データ合計約 6MB → WebP で 1.5MB 以下を目標
- **写真の解像度**: ChatGPT 生成のため一部荒い。本番には実写撮影 or 高解像度AI再生成を推奨
