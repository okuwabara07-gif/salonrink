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
