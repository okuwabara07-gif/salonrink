# Claude Code 委任タスク — SalonRink LP v2 反映

このメッセージを Claude Code に**そのままコピペ**して渡してください。

---

## 🎯 タスク概要

SalonRink Concierge LP の v2(マーケットイン版)を本番反映する。

- 作業者: Claude Code
- 作業場所: `~/Documents/salonrink/`
- 反映先: `salonrink.com`(本番)
- 戦略: 専用ブランチ作成 → 自動push → Vercel自動プレビュー → 確認後main merge

---

## ⚠️ 重要な制約

1. **「Yes, allow all」は禁止**(Osamu Standing rule)
2. **コミットメッセージに全角括弧 `（）` 禁止**(dquote ハング回避)
3. **commit時の改行禁止**(常に `git commit -m "..."` 単行で)
4. **Privacy絶対ルール**: 個人名・前職名は出力しない
5. 作業前にgit statusで現状確認、未コミット変更があれば事前にcommit or stash

---

## 📦 入力ファイル(既にダウンロード済)

```
~/Downloads/salonrink_lp_v2_images/   # ← Osamuがすでにダウンロード済の想定
├── README.md
└── images/
    ├── a101_hero.png
    ├── a110_favicon_gold.png
    ├── a204_customer.png
    ├── a304_staff.png
    ├── a406_karte.png
    ├── a508_exterior.png
    ├── a608_before.png
    ├── a802_problem.png
    └── kirei_real_interior.jpg
```

加えて、**v2モック10ファイル + tokens.css**は以下で受領済:
- このタスクと同じ場所に同梱の `mockup/` フォルダ

---

## 🔧 実行手順(1コマンドのみ)

```bash
cd ~/Documents/salonrink
bash ~/Downloads/salonrink_lp_v2_images/apply.sh
```

**`apply.sh` が以下を自動実行:**

1. ✅ 現状確認(git status / branch名チェック)
2. ✅ 新ブランチ作成 `feature/lp-v2-marketing-in`
3. ✅ 画像9枚を `public/images/` にコピー(既存ファイルがあれば backup)
4. ✅ v2モック10ファイル + tokens.css の内容をLP本番に反映
5. ✅ commit実行(メッセージは半角括弧のみ使用)
6. ✅ ブランチをoriginにpush
7. ✅ Vercelプレビュー用URLを出力

**Osamuは1回だけ「実行してOKか?」の承認をすればよい状態。**

---

## 📝 LP本番構造との対応

Next.js本番リポジトリ `~/Documents/salonrink/` の想定構造:

```
salonrink/
├── public/
│   └── images/         ← ここに画像9枚配置
├── app/
│   └── (lp)/
│       └── page.tsx    ← v2のセクションを反映
└── features/
    └── lp-concierge/   ← v3 LPのソース(commit 4596c5c)
        └── sections/
            ├── 01_Hero.tsx
            ├── 02_Problem.tsx
            ├── ...
            └── 10_Compare.tsx
```

`features/lp-concierge/sections/` 配下の各 .tsx を v2モックHTML内容で差し替えるイメージ。

---

## 🚨 自動実行できないケース(Claude Codeに判断させる)

`apply.sh` が以下の状況を検知した場合は**停止して報告**:

1. `~/Documents/salonrink/` が存在しない
   → 「リポジトリパスが違います。正しいパスを教えてください」と返す
2. 未コミットの変更がある
   → 「現在の作業を先にcommitしてください」と返す
3. `~/Downloads/salonrink_lp_v2_images/` が存在しない
   → 「ZIPを展開して指定パスに配置してください」と返す
4. `features/lp-concierge/sections/` の構造が想定と違う
   → 「実構造を `tree -L 3 features/` で表示して判断ください」と返す
5. 画像コピー先 `public/images/` に同名ファイルがあり、内容が異なる
   → 「`public/images/_backup_YYYYMMDD/` にbackup後上書きでOKですか?」と確認

---

## ✅ 完了基準

- [ ] ブランチ `feature/lp-v2-marketing-in` がorigin にpushされている
- [ ] Vercel preview URLが取得できている
- [ ] commit messageが半角括弧 + 単行
- [ ] 画像9枚が `public/images/` に配置されている
- [ ] v2モック10ファイルの内容がLP本番に反映されている

完了後、**Vercel preview URLとcommit hashをOsamuに報告**してください。

---

## 💬 Claude Codeへの想定対話例

**Osamu:**
> 「上記タスクを実行してください」

**Claude Code:**
> 「以下のコマンドで全作業を一括実行します:
>  `bash ~/Downloads/salonrink_lp_v2_images/apply.sh`
>  実行してよろしいですか?」

**Osamu:**
> 「yes」

**Claude Code:**
> (スクリプト実行 → 完了報告 → preview URL返却)

---

## 📊 反映される変更内容(参考)

### 配色トークン (tokens.css)
- v1: LINE green 一色
- v2: **LINE green + Gold ハイブリッド** (Gold=ブランド装飾、Green=機能/CTA)

### コピー (10セクション主訴求)
| Section | v1 | v2 |
|---|---|---|
| 01 HERO | LINEに、乗せるだけ。 | **LINEで、もう一度お客様と向き合う時間を。** |
| 02 PROBLEM | サロン業務のもったいない | **1人サロンだからこそ、こんな"もったいない"** |
| 07 NUMBERS | 数字で見る効果 +28%等 | **期待できる効果**(数値撤去) |
| 08 CASE 01 | 架空店舗 | **キレイ鶴見店 実店舗写真 + シミュレーション値明記** |
| 10 COMPARE | 競合具体名 | **「他サービス」抽象表記** |

### 画像 (9枚追加)
全て `public/images/` に配置

### 価格表記
- v1: ¥4,800〜
- v2: **¥1,980〜** (v6.1 ADD式)

---

## 🎯 Osamuの作業フロー(理想)

1. このメッセージをClaude Codeに渡す
2. Claude Codeが「実行してよいか?」と聞く
3. **「yes」と返す**(これが唯一の承認)
4. 完了報告 + Vercel preview URLを受け取る
5. プレビュー確認 → 問題なければ main merge指示

---

**📅 作成日:** 2026/05/25
**📦 パッケージ:** salonrink_lp_v2_handoff_FINAL.zip
**🎯 目標:** ¥300,000/月 (6月末) のためのLP最適化
