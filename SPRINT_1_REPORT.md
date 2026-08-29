# Sprint 1 Day 1 — Pre-implementation Report

## Status: Awaiting Osamu's SQL results

---

## ✅ Claude Code 側 完了事項

### 1. 既存 `/api/menus` ルート調査

**結果**: ❌ **`/api/menus` ルートは未実装**

```
app/api/menus/ ... (directory does not exist)
app/api/[other routes]/ ... (confirmed, but no menus)
```

→ **Day 2 で新規作成する必要がある**

---

### 2. 既存 `/app/liff/*` ディレクトリ構造確認

**結果**: ✅ **既に複数ページが存在**

```
app/liff/
├── pre-counseling/
│   └── page.tsx     (既実装)
└── (menu/ は未作成)
```

**LIFF 環境変数確認**:
- `NEXT_PUBLIC_LIFF_ID_PRE_COUNSELING` ... ✅ 定義済み
- `NEXT_PUBLIC_LIFF_ID_MENU` ... ❌ **未定義** (新規追加必要)

参考: `app/liff/pre-counseling/page.tsx` L247 で初期化パターン確認済み

→ **Day 3 で `app/liff/menu/page.tsx` 新規作成、environment variable も登録**

---

### 3. Supabase クライアント初期化方式確認

**結果**: ✅ **共通パターン確立済み**

- **Client-side**: `lib/supabase/client.ts` → `createBrowserClient(URL, ANON_KEY)`
- **Server-side**: `lib/supabase/server.ts` → `createServerClient(URL, ANON_KEY, cookies)`
- **Admin**: `lib/supabase/admin.ts` (存在、未確認)

→ **Day 2-3 のコード生成で共通パターンを踏襲**

---

### 4. menuToPrice 使用箇所全洗い出し

**結果**: ❌ **`menuToPrice` 関数は見当たらない、代わりに `salon_menus` マスタテーブル参照システム構築済み**

**既存システム**:

| ファイル | 用途 | status |
|---|---|---|
| `lib/menuPricing.ts` | メニュー名 → 価格解決の純関数(実装済み) | ✅ |
| `lib/menuAlias.server.ts` | HPB メニュー名 ↔ salon_menus のマッピング | ✅ |
| `app/dashboard/page.tsx` | KPI集計時に `salon_menus` から価格取得 | ✅ |
| `app/dashboard/customers/page.tsx` | 顧客ページで `salon_menus` から価格取得 | ✅ |

**メニュー価格解決の現在の流れ**:
```
HPB 予約 menu_name (例: "ナチュラル成分配合で…根元染め")
    ↓
lib/menuPricing.resolveMenuPrice()
    (salon_menus マスタから最長部分一致を採用)
    ↓
price, duration を返す
```

**課題**: `salon_menus` テーブルの **RLS ポリシーがまだ設定されていない**
→ **Day 1 で RLS ポリシー追加が必須**

---

## 📊 salon_menus テーブル現状確認に必要な SQL

Osamu に実行していただく SQL:

```sql
-- 1. テーブルの存在確認
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'salon_menus';

-- 2. テーブルスキーマ確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'salon_menus'
ORDER BY ordinal_position;

-- 3. 主キー・外キー・制約確認
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'salon_menus';

-- 4. RLS ポリシー有無確認
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'salon_menus';

-- 5. インデックス確認
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'salon_menus';

-- 6. 既存データ件数（キレイ鶴見店のみ）
SELECT COUNT(*), salon_id FROM public.salon_menus 
GROUP BY salon_id LIMIT 5;

-- 7. サンプル行確認（最初の1行）
SELECT * FROM public.salon_menus LIMIT 1;
```

---

## 🎯 次のステップ（Osamu からの返答待ち）

1. **Osamu が上記 SQL を実行** → 結果をコピペで返す
2. **Claude Code が結果を受け取る**
3. **Day 1 マイグレーション SQL 生成**:
   - `salon_menus` テーブル定義（存在する場合は RLS のみ追加）
   - RLS ポリシー 4 種 (SELECT/INSERT/UPDATE/DELETE)
   - サンプルデータ投入 (キレイ鶴見店の 15 メニュー)
4. **Osamu が Supabase SQL Editor で実行**
5. **Day 1 commit 作成** → Day 2-3 へ移行

---

## 📝 Day 2-3 の準備状況

| Day | スコープ | 準備度 |
|---|---|---|
| **Day 1** | RLS マイグレーション | 🟡 SQL 待機中 |
| **Day 2** | メニュー CRUD API | 🟢 スキーマ参考済み、API 構造決定可能 |
| **Day 3** | LIFF メニュー編集 UI | 🟢 LIFF パターン確認済み、デザイン token 確認可能 |
| **Day 3-α** | menuToPrice 廃止 | 🟢 既存システム確認済み、置換準備 OK |

**依存関係**: `@tabler/icons-react` のみ、`shadcn/ui` 保留

---

**作業状態**: ⏸️ SQL 実行結果待機中  
**最終更新**: 2026-05-22
