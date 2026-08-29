# SalonRink LP — 画像差替指示書 一括サマリー

> 最終更新: 2026.05.26
> ステータス: **本日の全指示書 + 画像アセット 完成**

---

## Claude Code 引渡しパッケージ

このフォルダ（`lp/`）を ZIP 化して Claude Code に渡してください。

---

## 指示書一覧（全 11 ファイル）

### マスター
- `MASTER_INSTRUCTIONS.md` — 全体方針 + 共通プロンプト

### PATCH（セクション別）
| ファイル | セクション | 内容 |
|---|---|---|
| `PATCH-01-hero.md` | Hero | iPhone+吹き出し→実写画像へ差替 |
| `PATCH-01-fix.md` | Hero 修正 | 画像が小さい問題の修正案（A/B/C） |
| `PATCH-02-problem.md` | Problem | 背面装飾画像追加 |
| `PATCH-03-solution.md` | Solution | 背面画像 + 下部パネル画像化 |
| `PATCH-04-for-everyone.md` | For Everyone | 5点写真追加 |
| `PATCH-04-fix.md` | For Everyone 修正 | 1枚画像化＋数値オーバーレイ（推奨） |
| `PATCH-05-in-action.md` | In Action 01/02 | シーン両脇に人物写真4点 |
| `PATCH-05-fix.md` | In Action 01/02 修正 | 1枚画像化（推奨） |
| `PATCH-05b-in-action-3-4.md` | In Action 03/04 | シーン両脇に人物写真4点 |
| `PATCH-05b-fix.md` | In Action 03/04 修正 | 4枚削除→背景画像1枚（推奨） |
| `PATCH-06-ai-karte.md` | AI Karte | メインビジュアル+3カード写真 |
| `PATCH-06-fix.md` | AI Karte 修正 | 既存削除→背景画像1枚（推奨） |
| `PATCH-08-case.md` | Case 01 | キレイ鶴見店の実写真挿入 |

---

## ⚠️ 重要 — Claude Code への実装順序

各セクションで **「-fix」がある場合は -fix を優先** してください。
元の PATCH は参考、修正版（-fix）が最終仕様です。

### 最終的に実装すべき指示書（推奨）

```
1. PATCH-01-hero.md  →  PATCH-01-fix.md（画像を大きく見せる調整）
2. PATCH-02-problem.md
3. PATCH-03-solution.md
4. PATCH-04-fix.md   ※-fix のみ実装（PATCH-04 は無視）
5. PATCH-05-fix.md   ※-fix のみ実装（PATCH-05 は無視）
6. PATCH-05b-fix.md  ※-fix のみ実装（PATCH-05b は無視）
7. PATCH-06-fix.md   ※-fix のみ実装（PATCH-06 は無視）
8. PATCH-08-case.md
```

未着手: PATCH-07（NUMBERS）/ PATCH-09（ONBOARDING）/ PATCH-10（COMPARE）

---

## 画像アセット構成

```
lp/assets/
├── hero/
│   ├── hero-salon-iphone.png         ← PATCH-01
│   └── _reference-final.png
├── problem/
│   ├── problem-bg-salon.png          ← PATCH-02
│   └── _reference-final.png
├── solution/
│   ├── solution-bg-stylist.png       ← PATCH-03 A
│   ├── solution-bottom-panel.png     ← PATCH-03 B
│   └── _reference-final.png
├── for-everyone/
│   └── for-everyone-full.png         ← PATCH-04-fix ⭐
├── in-action/
│   ├── in-action-scene-1-2-full.png  ← PATCH-05-fix ⭐
│   └── in-action-scene-3-4-bg.png    ← PATCH-05b-fix ⭐
├── ai-karte/
│   └── karte-bg-empty-salon.png      ← PATCH-06-fix ⭐
└── case/
    └── kirei-tsurumi-real.jpg        ← PATCH-08
```

⭐ マークが付いているのが「修正版（-fix）で使用する正式画像」です。

---

## Claude Code への共通プロンプト（実装時に使用）

```
SalonRink.com の LP に、添付の PATCH-NN-fix.md / PATCH-NN.md に沿って画像のみを差替/追加してください。

【厳守】
- テキスト・配列・文章・クラス名・id は一切変更禁止
- DOM の追加/削除は PATCH で明示された範囲のみ
- 修正版（-fix）がある場合はそちらを優先実装。元 PATCH は参考。
- next/image を使う
- WebP に変換した上で /public/images/{section}/ に配置

【完了報告】
1. 該当ファイル名と git diff の要約
2. 「テキスト変更ゼロ」の確認
3. 追加した画像のパスとサイズ一覧
```

---

## ダウンロードガイド

| 用途 | ダウンロード対象 |
|---|---|
| 指示書のみ（テキスト） | `lp/*.md` 各ファイル個別 or zip でまとめて |
| 画像のみ | `lp/assets/` フォルダ |
| 一括（推奨） | `lp/` フォルダ全体 |

`lp/` フォルダ全体を Claude Code に渡せば、指示書 + 画像 + 構造が揃った状態で実装可能です。
