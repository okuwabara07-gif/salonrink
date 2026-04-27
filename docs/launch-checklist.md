# SalonRink 営業解禁チェックリスト

**作成日**: 2026-04-27  
**ステータス**: 手動実行待機  
**対象**: 本番環境 (Supabase Production)

---

## 概要

本ドキュメントは、SalonRink システムを営業開始可能な状態にするための全手順を記載しています。  
以下の5つの作業を完了することで、監査で指摘された全ての問題が解決されます。

### 解決する問題
- ✅ salon_addons テーブル不在（**重大**）
- ✅ RLS ポリシー未デプロイ（**重大**）
- ✅ NEXT_PUBLIC_SALONRINK_URL 未設定（**中**）
- ✅ HPB テーブル本番デプロイ確認（**中**）
- ✅ Vercel 環境変数設定確認（**軽微**）

---

## 前提条件

- Supabase Dashboard にログイン可能
- Vercel Dashboard にログイン可能
- 本番環境のデータベースへのアクセス権
- 現在の 5 サロンのデータ保護（DROP/ALTER しない設計）

---

## 作業1: Supabase テーブル作成

### 目的
以下の 10 テーブルを Supabase 本番環境に作成します：
- salon_addons（アドオン管理）
- line_accounts（LINE連携）
- line_customer_links（LINE顧客連携）
- hpb_integrations（HPB連携設定）
- salon_hpb_credentials（HPB認証情報 - 暗号化）
- kartes（顧客カルテ）
- karte_photos（カルテ写真）
- karte_recipes（カルテ処方箋）
- articles_queue（記事配信キュー）
- article_deliveries（記事配信実績）

### 実行前確認

```sql
-- ◆ テーブルが既に存在するか確認（本番DB）
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('salon_addons', 'line_accounts', 'hpb_integrations', 'kartes');
```

**期待される結果**: 4〜10 個のテーブルが返ってきた場合、既に作成されている可能性あり  
→ 「実行後確認」にスキップして結果を確認してください

---

### ✏️ 実行手順

1. **Supabase Dashboard を開く**
   - https://app.supabase.com
   - 対象プロジェクトを選択

2. **SQL Editor を開く**
   - 左サイドバー → SQL Editor
   - 新規クエリを作成

3. **以下の SQL をコピー & 貼り付け**

```sql
-- SalonRink Dashboard Tables Migration
-- 2026-04-27
-- Creates all missing dashboard tables with full schema

-- ========================================
-- 1. salon_addons テーブル（アドオン管理）
-- ========================================
CREATE TABLE IF NOT EXISTS public.salon_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  addon_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  price INTEGER NOT NULL,
  stripe_subscription_item_id TEXT,
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(salon_id, addon_key)
);

CREATE INDEX IF NOT EXISTS idx_salon_addons_salon_id ON public.salon_addons(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_addons_addon_key ON public.salon_addons(addon_key);

-- ========================================
-- 2. line_accounts テーブル（LINE連携）
-- ========================================
CREATE TABLE IF NOT EXISTS public.line_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL UNIQUE REFERENCES public.salons(id) ON DELETE CASCADE,
  salon_code TEXT NOT NULL UNIQUE,
  richmenu_id TEXT,
  richmenu_config JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_accounts_salon_id ON public.line_accounts(salon_id);
CREATE INDEX IF NOT EXISTS idx_line_accounts_code ON public.line_accounts(salon_code);

-- ========================================
-- 3. line_customer_links テーブル（LINE顧客連携）
-- ========================================
CREATE TABLE IF NOT EXISTS public.line_customer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT NOT NULL,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(line_user_id, salon_id)
);

CREATE INDEX IF NOT EXISTS idx_line_customer_links_user_id ON public.line_customer_links(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_customer_links_salon_id ON public.line_customer_links(salon_id);

-- ========================================
-- 4. hpb_integrations テーブル（HPB連携）
-- ========================================
CREATE TABLE IF NOT EXISTS public.hpb_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL UNIQUE REFERENCES public.salons(id) ON DELETE CASCADE,
  ical_url TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  last_sync_status TEXT,
  last_sync_error TEXT,
  sync_interval_minutes INTEGER DEFAULT 15,
  menu_mapping JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hpb_integrations_salon_id ON public.hpb_integrations(salon_id);

-- ========================================
-- 5. salon_hpb_credentials テーブル（HPB認証情報）
-- ========================================
CREATE TABLE IF NOT EXISTS public.salon_hpb_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL UNIQUE REFERENCES public.salons(id) ON DELETE CASCADE,
  hpb_login_id_enc TEXT NOT NULL,
  hpb_password_enc TEXT NOT NULL,
  hpb_salon_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salon_hpb_credentials_salon_id ON public.salon_hpb_credentials(salon_id);

-- ========================================
-- 6. kartes テーブル（顧客カルテ）
-- ========================================
CREATE TABLE IF NOT EXISTS public.kartes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  menu_name TEXT,
  staff_name TEXT,
  hair_condition TEXT,
  scalp_condition TEXT,
  allergies TEXT,
  treatment_note TEXT,
  next_suggestion TEXT,
  service_price INTEGER,
  product_price INTEGER,
  total_price INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kartes_salon_id ON public.kartes(salon_id);
CREATE INDEX IF NOT EXISTS idx_kartes_customer_id ON public.kartes(customer_id);
CREATE INDEX IF NOT EXISTS idx_kartes_visit_date ON public.kartes(visit_date DESC);

-- ========================================
-- 7. karte_photos テーブル（カルテ写真）
-- ========================================
CREATE TABLE IF NOT EXISTS public.karte_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  karte_id UUID NOT NULL REFERENCES public.kartes(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after')),
  storage_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_karte_photos_karte_id ON public.karte_photos(karte_id);
CREATE INDEX IF NOT EXISTS idx_karte_photos_salon_id ON public.karte_photos(salon_id);

-- ========================================
-- 8. karte_recipes テーブル（カルテ処方箋）
-- ========================================
CREATE TABLE IF NOT EXISTS public.karte_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  karte_id UUID NOT NULL REFERENCES public.kartes(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  recipe_type TEXT DEFAULT 'hair_color',
  recipe_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_karte_recipes_karte_id ON public.karte_recipes(karte_id);
CREATE INDEX IF NOT EXISTS idx_karte_recipes_salon_id ON public.karte_recipes(salon_id);

-- ========================================
-- 9. articles_queue テーブル（記事配信キュー）
-- ========================================
CREATE TABLE IF NOT EXISTS public.articles_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_site TEXT NOT NULL,
  article_url TEXT NOT NULL UNIQUE,
  article_title TEXT NOT NULL,
  article_excerpt TEXT,
  article_thumbnail TEXT,
  priority INTEGER DEFAULT 0,
  scheduled_for DATE,
  sent_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_queue_scheduled_for ON public.articles_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_articles_queue_published_at ON public.articles_queue(published_at DESC);

-- ========================================
-- 10. article_deliveries テーブル（記事配信実績）
-- ========================================
CREATE TABLE IF NOT EXISTS public.article_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles_queue(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_at TIMESTAMPTZ,
  UNIQUE(article_id, line_user_id)
);

CREATE INDEX IF NOT EXISTS idx_article_deliveries_salon_id ON public.article_deliveries(salon_id);
CREATE INDEX IF NOT EXISTS idx_article_deliveries_article_id ON public.article_deliveries(article_id);

-- ========================================
-- Enable RLS on all new tables
-- ========================================
ALTER TABLE public.salon_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_customer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hpb_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_hpb_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kartes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karte_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karte_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_deliveries ENABLE ROW LEVEL SECURITY;
```

4. **「Run」ボタンをクリック**
   - 実行時間は数秒

---

### 実行後確認

```sql
-- ◆ 全テーブルが作成されたか確認
SELECT count(*) as table_count FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'salon_addons', 'line_accounts', 'line_customer_links',
  'hpb_integrations', 'salon_hpb_credentials', 'kartes',
  'karte_photos', 'karte_recipes', 'articles_queue', 'article_deliveries'
);
```

**期待される結果**: `table_count = 10`

```sql
-- ◆ salon_addons テーブルが正常か確認
\d salon_addons
```

**期待される結果**:
- 列: id, salon_id, addon_key, enabled, price, stripe_subscription_item_id, enabled_at, disabled_at, created_at, updated_at
- UNIQUE 制約: (salon_id, addon_key)
- インデックス: idx_salon_addons_salon_id, idx_salon_addons_addon_key

---

## 作業2: RLS ポリシー設定

### 目的
全テーブルに salon_id ベースの Row Level Security ポリシーを適用します。  
これにより、**テナント分離が強制**されます。

### 重要: RLS 強制モード

本作業実行後、Supabase では RLS が「有効」かつ「ポリシーが定義されている」テーブルに対して、**自動的に RLS が強制**されます。

つまり：
- ✅ ポリシーで許可された操作のみ実行可能
- ❌ RLS でブロックされた操作は エラー発生

---

### ✏️ 実行手順

1. **Supabase Dashboard → SQL Editor**

2. **以下の SQL をコピー & 貼り付け**

```sql
-- SalonRink RLS Policies Migration
-- 2026-04-27
-- Creates Row Level Security policies for all tenant-isolated tables
-- All policies enforce salon_id-based tenant isolation

-- ========================================
-- salon_addons RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own addons" ON public.salon_addons;
CREATE POLICY "Salon owners can view own addons"
  ON public.salon_addons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_addons.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own addons" ON public.salon_addons;
CREATE POLICY "Salon owners can insert own addons"
  ON public.salon_addons
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_addons.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own addons" ON public.salon_addons;
CREATE POLICY "Salon owners can update own addons"
  ON public.salon_addons
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_addons.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_addons.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- line_accounts RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own LINE account" ON public.line_accounts;
CREATE POLICY "Salon owners can view own LINE account"
  ON public.line_accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_accounts.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own LINE account" ON public.line_accounts;
CREATE POLICY "Salon owners can insert own LINE account"
  ON public.line_accounts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_accounts.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own LINE account" ON public.line_accounts;
CREATE POLICY "Salon owners can update own LINE account"
  ON public.line_accounts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_accounts.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_accounts.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- line_customer_links RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own customer links" ON public.line_customer_links;
CREATE POLICY "Salon owners can view own customer links"
  ON public.line_customer_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_customer_links.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own customer links" ON public.line_customer_links;
CREATE POLICY "Salon owners can insert own customer links"
  ON public.line_customer_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_customer_links.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own customer links" ON public.line_customer_links;
CREATE POLICY "Salon owners can update own customer links"
  ON public.line_customer_links
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_customer_links.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_customer_links.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- hpb_integrations RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own HPB integration" ON public.hpb_integrations;
CREATE POLICY "Salon owners can view own HPB integration"
  ON public.hpb_integrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = hpb_integrations.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own HPB integration" ON public.hpb_integrations;
CREATE POLICY "Salon owners can insert own HPB integration"
  ON public.hpb_integrations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = hpb_integrations.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own HPB integration" ON public.hpb_integrations;
CREATE POLICY "Salon owners can update own HPB integration"
  ON public.hpb_integrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = hpb_integrations.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = hpb_integrations.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- salon_hpb_credentials RLS Policies
-- (Encrypted credentials - read-only for owners)
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own HPB credentials" ON public.salon_hpb_credentials;
CREATE POLICY "Salon owners can view own HPB credentials"
  ON public.salon_hpb_credentials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_hpb_credentials.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own HPB credentials" ON public.salon_hpb_credentials;
CREATE POLICY "Salon owners can insert own HPB credentials"
  ON public.salon_hpb_credentials
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_hpb_credentials.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own HPB credentials" ON public.salon_hpb_credentials;
CREATE POLICY "Salon owners can update own HPB credentials"
  ON public.salon_hpb_credentials
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_hpb_credentials.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_hpb_credentials.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- kartes RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own kartes" ON public.kartes;
CREATE POLICY "Salon owners can view own kartes"
  ON public.kartes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = kartes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own kartes" ON public.kartes;
CREATE POLICY "Salon owners can insert own kartes"
  ON public.kartes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = kartes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own kartes" ON public.kartes;
CREATE POLICY "Salon owners can update own kartes"
  ON public.kartes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = kartes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = kartes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- karte_photos RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own karte photos" ON public.karte_photos;
CREATE POLICY "Salon owners can view own karte photos"
  ON public.karte_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_photos.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own karte photos" ON public.karte_photos;
CREATE POLICY "Salon owners can insert own karte photos"
  ON public.karte_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_photos.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can delete own karte photos" ON public.karte_photos;
CREATE POLICY "Salon owners can delete own karte photos"
  ON public.karte_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_photos.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- karte_recipes RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own karte recipes" ON public.karte_recipes;
CREATE POLICY "Salon owners can view own karte recipes"
  ON public.karte_recipes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_recipes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own karte recipes" ON public.karte_recipes;
CREATE POLICY "Salon owners can insert own karte recipes"
  ON public.karte_recipes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_recipes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own karte recipes" ON public.karte_recipes;
CREATE POLICY "Salon owners can update own karte recipes"
  ON public.karte_recipes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_recipes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_recipes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- article_deliveries RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own article deliveries" ON public.article_deliveries;
CREATE POLICY "Salon owners can view own article deliveries"
  ON public.article_deliveries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = article_deliveries.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own article deliveries" ON public.article_deliveries;
CREATE POLICY "Salon owners can insert own article deliveries"
  ON public.article_deliveries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = article_deliveries.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- articles_queue: public read (visible to all)
DROP POLICY IF EXISTS "Everyone can view articles" ON public.articles_queue;
CREATE POLICY "Everyone can view articles"
  ON public.articles_queue
  FOR SELECT
  USING (true);
```

3. **「Run」をクリック**

---

### 実行後確認

```sql
-- ◆ RLS ポリシーが設定されたか確認
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE tablename IN (
  'salon_addons', 'line_accounts', 'kartes', 'karte_photos',
  'hpb_integrations', 'salon_hpb_credentials', 'article_deliveries'
)
ORDER BY tablename;
```

**期待される結果**: 25+ ポリシーが返される（各テーブルに複数ポリシー）

---

## 作業3: 環境変数設定（Vercel）

### 目的
Vercel 本番環境に以下の環境変数を追加します：
- `NEXT_PUBLIC_SALONRINK_URL` = https://salonrink.com

### 現在の状態
- ✅ ローカル `.env.local` には設定済み（`.env.example` も更新済み）
- ❌ Vercel 本番環境には未設定 → Customer Portal のリダイレクト失敗

---

### ✏️ 実行手順

1. **Vercel Dashboard を開く**
   - https://vercel.com/dashboard

2. **プロジェクト「salonrink」を選択**

3. **Settings → Environment Variables** を選択

4. **「Add New」をクリック**
   - **Name**: `NEXT_PUBLIC_SALONRINK_URL`
   - **Value**: `https://salonrink.com`
   - **Environments**: Production, Preview, Development チェック

5. **「Save」をクリック**

6. **デプロイを再トリガー**（環境変数反映のため）
   - Deployments → 最新デプロイの右クリック → Redeploy
   - または新しいコミットを main にプッシュ

---

### 実行後確認

Vercel Dashboard → Settings → Environment Variables で確認：
```
✅ NEXT_PUBLIC_SALONRINK_URL = https://salonrink.com
```

---

## 作業4: HPB テーブル確認

### 目的
HPB 関連テーブル（hpb_integrations, salon_hpb_credentials）が Supabase に存在することを確認します。  
作業1で既に作成済みのため、ここでは確認のみ。

### ✏️ 確認手順

```sql
-- ◆ HPB テーブル確認
SELECT 
  tablename,
  (SELECT count(*) FROM information_schema.columns 
   WHERE table_name = pg_tables.tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('hpb_integrations', 'salon_hpb_credentials')
ORDER BY tablename;
```

**期待される結果**:
```
     tablename          | column_count
----------------------|-------------
hpb_integrations       | 11
salon_hpb_credentials  | 7
```

---

## 作業5: 動作確認（本人による手動テスト）

### 前提
- すべての SQL が Supabase で実行完了
- Vercel で環境変数設定完了・デプロイ再実行完了

---

### テスト 1: Magic Link ログイン

1. **ブラウザで以下を開く**
   - https://salonrink.com/login

2. **テスト用メールアドレスを入力**
   - 例: `test@example.com`

3. **「Magic Link でログイン」をクリック**

4. **メール確認**
   - メーラーで Magic Link を確認
   - リンクをクリック

5. **期待される動作**
   - ✅ ダッシュボード（`/dashboard`）へリダイレクト
   - ✅ ユーザーがログイン状態に

---

### テスト 2: アドオン ON/OFF

1. **ダッシュボードにログイン**
   - https://salonrink.com/dashboard

2. **「その他」タブ → 「プラン管理」をクリック**

3. **「アドオン管理」セクションを確認**
   - 7 個のアドオンが表示されているか？
   - ON/OFF ボタンが表示されているか？

4. **アドオンの ON/OFF をクリック**
   - 例: 「顧客カルテ」の ON/OFF ボタンをクリック

5. **期待される動作**
   - ✅ エラーなく ON/OFF 状態が変化
   - ✅ 成功メッセージが表示: 「アドオンを更新しました」
   - ❌ エラーが出た場合: salon_addons テーブルが作成されていない

---

### テスト 3: Stripe Checkout フロー

1. **プラン管理ページ（上記の続き）**

2. **「プラン変更」セクションで別プランを選択**
   - 例: 現在「フリーランス」→「スタンダード」を選択

3. **「プランを変更する」をクリック**

4. **期待される動作**
   - ✅ Stripe Checkout ページにリダイレクト
   - ✅ 14 日間トライアル、プラン料金が表示

5. **テスト決済（カード情報不要）**
   - Stripe テストカード: `4242 4242 4242 4242`
   - 有効期限: 任意の未来日（例: 12/26）
   - CVC: 任意の 3 桁（例: 123）

6. **期待される動作**
   - ✅ 決済成功
   - ✅ Success ページへリダイレクト: `/success?session_id=...`

---

### テスト 4: Customer Portal リダイレクト

1. **プラン管理ページ → 「支払い情報」セクション**

2. **「Customer Portal を開く」をクリック**

3. **期待される動作**
   - ✅ Stripe Customer Portal へリダイレクト
   - ✅ 支払い方法・サブスクリプション情報が表示
   - ❌ エラーが出た場合: `NEXT_PUBLIC_SALONRINK_URL` が未設定

---

### テスト 5: テナント分離（2 ユーザーで確認）

1. **ユーザーA でログイン**
   - メール: `salonA@example.com`
   - サロンID: `salon-uuid-A`

2. **ダッシュボード → 「顧客」タブ**
   - ユーザーA のサロンの顧客一覧を表示

3. **メモ**: ユーザーA の顧客 ID（例: `customer-uuid-A1`）

4. **ログアウト**

5. **ユーザーB でログイン**
   - メール: `salonB@example.com`
   - サロンID: `salon-uuid-B`

6. **ダッシュボード → 「顧客」タブ**
   - ユーザーB のサロンの顧客一覧を表示

7. **期待される動作**
   - ✅ ユーザーA の顧客（`customer-uuid-A1`）が表示されない
   - ✅ ユーザーB のサロンの顧客のみ表示
   - ❌ 他店顧客が見える場合: RLS ポリシーが失敗している

---

### テスト 6: LINE 連携ページ確認

1. **ダッシュボード → 「連携」タブ**

2. **各カード確認**
   - ✅ LINE 連携
   - ✅ HPB 設定
   - ✅ HPB 同期ステータス
   - ✅ 小町（お多より）

3. **期待される動作**
   - エラーなくページが表示される
   - フォーム・ボタンが機能する

---

## まとめ: 営業解禁判定

### 全テスト成功時

**✅ 営業解禁 OK**

以下の条件をすべて満たした場合：
1. SQL 実行エラーなし（作業1, 2）
2. Vercel 環境変数設定完了（作業3）
3. テスト 1〜6 すべて成功

---

### トラブルシューティング

| テスト | エラー内容 | 原因 | 対応 |
|--------|----------|------|------|
| テスト2 | salon_addons テーブルが見つかりません | SQL 実行失敗 | 作業1 を再実行 |
| テスト3 | STRIPE_PRICE_ID が見つかりません | Stripe 環境変数未設定 | Vercel Settings で確認・再設定 |
| テスト4 | Portal URL が無効です | NEXT_PUBLIC_SALONRINK_URL 未設定 | 作業3 を再実行・デプロイ再トリガー |
| テスト5 | 他店顧客が見えている | RLS ポリシー失敗 | 作業2 を再実行 |

---

## 付録: マイグレーションファイル

以下のファイルが `supabase/migrations/` に作成されています：

- `20260427_create_dashboard_tables.sql` - テーブル作成
- `20260427_create_rls_policies.sql` - RLS ポリシー適用

---

**最終確認**: 全作業完了後、このチェックリストに ✅ チェック を付けてください。

- [ ] 作業1: SQL テーブル作成実行
- [ ] 作業2: RLS ポリシー SQL 実行
- [ ] 作業3: Vercel 環境変数設定
- [ ] テスト1: Magic Link ログイン ✅
- [ ] テスト2: アドオン ON/OFF ✅
- [ ] テスト3: Stripe Checkout ✅
- [ ] テスト4: Customer Portal ✅
- [ ] テスト5: テナント分離 ✅
- [ ] テスト6: LINE 連携ページ ✅

**営業解禁判定**: ❌ → ✅ (予定)

---

**作成者**: Claude Code (Haiku 4.5)  
**更新日**: 2026-04-27
