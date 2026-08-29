# SalonRink Concierge — 実装着手依頼 (Claude Code 向け)

あなたは **Claude Code** として、SalonRink Concierge プロジェクトの実装担当です。
ローカルリポジトリ `/Users/educatorspi/Documents/salonrink` で作業します。

---

## プロジェクト概要

**SalonRink Concierge** は美容業界向けの LINE アドオン型 SaaS。
運営は AOKAE 合同会社、旗艦店はキレイ鶴見店(横浜・グレイヘア専門・自社運営)。

「画面のないSaaS」を志向しており、美容師は新しい管理画面を学ばず、いつもの LINE 公式アカウントが勝手に賢くなる体験を作るのがコンセプト。

### 現状の最優先タスク
- `salon_menus` テーブルの RLS 未設定
- メニュー CRUD UI 未実装
- `menuToPrice` ハードコード廃止 → `findMenuByName` 置換

これらが Sprint 1 のスコープと完全一致。

---

## 添付ドキュメント (3点セット必読)

順番に熟読してください:

| ファイル | 役割 |
|---|---|
| **`IMPLEMENTATION_SPRINT.md`** | 20日5スプリントの実装手順書(これがメイン) |
| **`DESIGN_BRIEF.md`** | デザイン哲学・トークン・画面詳細 |
| **`SalonRink_brief_v3.html`** | プロジェクト全体指示書(MECE 4パート構造) |

`IMPLEMENTATION_SPRINT.md` には全 Sprint のコード雛形・DB スキーマ・API 契約・完了基準が記載されています。**ゼロから設計せず、この手順書に従って実装**してください。

---

## 作業開始の手順 (Sprint 1 着手前)

### Step 1: 環境確認

```bash
cd /Users/educatorspi/Documents/salonrink
git status
git branch
ls app/
ls app/api/
ls app/liff/ 2>/dev/null || echo "liff/ not yet"
ls supabase/migrations/
```

### Step 2: 既存コード把握

以下を `grep` / `find` で確認:

```bash
# menuToPrice の現在の使用箇所
grep -rn "menuToPrice" app/ lib/ --include="*.ts" --include="*.tsx"

# 既存の /api/menus, /liff/menu の有無
find app/api/menus app/liff/menu 2>/dev/null

# salon_menus テーブルの現状確認用クエリ準備
cat supabase/migrations/*.sql 2>/dev/null | grep -A 5 "salon_menus"
```

### Step 3: ブランチ作成

```bash
git checkout main
git pull
git checkout -b feature/sprint-1-menu-crud
```

### Step 4: Sprint 1 Day 1 から実装

`IMPLEMENTATION_SPRINT.md` の §2.2 (DB マイグレーション) から順に進めます。

---

## Sprint 1 の流れ (Day 1-3)

| Day | スコープ | 成果物 |
|---|---|---|
| **Day 1** | DB マイグレーション | `supabase/migrations/day01_salon_menus_rls.sql` 作成 + 本番 Supabase で実行 |
| **Day 2** | API ルート | `app/api/menus/route.ts`, `app/api/menus/[id]/route.ts`, `lib/menus/schema.ts` |
| **Day 3** | LIFF UI | `app/liff/menu/page.tsx`, `app/liff/menu/MenuClient.tsx`, `tailwind.config.ts` 拡張 |
| **Day 3-α** | menuToPrice 廃止 | `lib/menus/findMenuByName.ts` 実装 + 既存呼出箇所の置換 |

---

## 実装ルール (絶対遵守)

### ✅ Do

- **commit message は英語**: `feat: add salon_menus RLS policies` 形式、Conventional Commits
- **DB スキーマ変更前に必ず Osamu に確認**: マイグレーションの内容を事前共有
- **キレイ鶴見店アカウントで実機動作確認**: Vercel 本番デプロイ後、必ず実機テスト
- **TypeScript strict mode、`any` 禁止**: 型を厳密に
- **各 Day 完了時に進捗報告**: 「何を作った / 何が動く / 次は何」の3行サマリー
- **段階的にデプロイ**: Day 1 → 2 → 3 で commit を分け、各 Day で Vercel 本番反映
- **エラーケース実装**: 空状態 / ローディング / エラー状態を必ず作る

### ❌ Don't

- **commit message に全角括弧 `（）` 使用禁止**: `dquote>` シェルハング原因
- **機能名を主役にしたコピー禁止**: 「AIカルテ自動生成」→「あなたが寝ている間に明日の準備が終わっています」
- **Claude API は Haiku のみ使用**: Sonnet / Opus はコスト爆発のため不可
- **VPS (`160.251.213.197`) への変更は事前許可**: HPB 同期 Bot は壊さない
- **過剰な絵文字・装飾アイコン・グラデーション禁止**: AIスロップ排除
- **個人情報をコード内に書かない**: サンプルデータは架空名(田中・佐藤・山田)
- **localStorage / sessionStorage 使用禁止**: LIFF 内では使えないため、React state または Supabase で管理

---

## 技術スタック (確定)

- Next.js 14+ App Router
- TypeScript strict
- Tailwind CSS
- `@tabler/icons-react`
- `@line/liff`
- Supabase Client (`@supabase/ssr`)
- Zod

詳細は `DESIGN_BRIEF.md` §3 / `IMPLEMENTATION_SPRINT.md` §2.3 を参照。

---

## インフラ参照値 (変更厳禁)

| 項目 | 値 |
|---|---|
| Supabase Project | `fmpmgilgvvfezursmyic` |
| VPS (HPB Bot) | `160.251.213.197` / `/root/salonrink-sync-bot` |
| LIFF ID (Menu) | `2009962150-475Lr5g8` (既存 LIFF を流用または新設、要確認) |
| GitHub | `okuwabara07-gif/salonrink` |
| Vercel チーム | `okuwabara07-gifs-projects` (Pro) |
| 本番 URL | https://salonrink.com |

**Vercel ビルドマシンが Standard (Elastic ではなく) になっているか必ず確認** してから本番デプロイしてください。

---

## 最初のアクション (今すぐやること)

1. **3 ドキュメント熟読**
2. **リポジトリ現状把握** (上記 Step 1-2 を実行)
3. **以下 5 つを Osamu に質問**:
   - 既存の `/api/menus` ルートは存在する? あれば現状の実装は?
   - 既存の `/app/liff/*` の構造は? (`menu/` `dashboard/` 等)
   - `salon_menus` テーブルの現在のスキーマは? (DESIGN との差分確認)
   - LIFF ID は新設するか、既存の `2009962150-475Lr5g8` を流用するか?
   - `@tabler/icons-react` と `shadcn/ui` の採用は OK か?

4. **回答が揃ったら Sprint 1 Day 1 から着手**

---

## 各 Day 完了時の報告フォーマット

```
## Day [N] 完了報告

### 何を作った
- ファイル一覧
- 主要な実装内容

### 何が動く
- 確認した動作
- スクリーンショット(あれば)

### 次は何
- 次の Day のスコープ
- 残課題・懸念

### 質問
- 判断が必要な箇所(あれば)
```

---

## Sprint 完了基準

各 Sprint 完了時、`IMPLEMENTATION_SPRINT.md` 内の「完了基準」チェックリストを全て満たすこと:

- ✅ コード commit (英語 message、全角括弧禁止)
- ✅ Vercel 本番デプロイ
- ✅ キレイ鶴見店アカウントで実機動作確認
- ✅ エラー時のロールバック手順確認
- ✅ 次 Sprint の開始条件が満たされている

---

**Project Owner**: Osamu (AOKAE 合同会社)
**Sprint**: 1 / 5
**Branch**: `feature/sprint-1-menu-crud`
**Document Version**: v3 (2026.05.21)
