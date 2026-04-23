-- SalonRink ダッシュボード完全スキーマ
-- 実行済み: 2026/04/23

CREATE TABLE IF NOT EXISTS kartes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_kartes_customer ON kartes(customer_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_kartes_salon ON kartes(salon_id);

CREATE TABLE IF NOT EXISTS karte_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  karte_id UUID NOT NULL REFERENCES kartes(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after')),
  storage_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_karte_photos_karte ON karte_photos(karte_id);
CREATE INDEX IF NOT EXISTS idx_karte_photos_salon ON karte_photos(salon_id);

CREATE TABLE IF NOT EXISTS karte_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  karte_id UUID NOT NULL REFERENCES kartes(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  recipe_type TEXT DEFAULT 'hair_color',
  recipe_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_karte_recipes_karte ON karte_recipes(karte_id);

CREATE TABLE IF NOT EXISTS salon_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_addons_salon ON salon_addons(salon_id);

CREATE TABLE IF NOT EXISTS line_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL UNIQUE REFERENCES salons(id) ON DELETE CASCADE,
  salon_code TEXT NOT NULL UNIQUE,
  richmenu_id TEXT,
  richmenu_config JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_accounts_salon ON line_accounts(salon_id);
CREATE INDEX IF NOT EXISTS idx_line_accounts_code ON line_accounts(salon_code);

CREATE TABLE IF NOT EXISTS line_customer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT NOT NULL,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(line_user_id, salon_id)
);

CREATE INDEX IF NOT EXISTS idx_line_links_user ON line_customer_links(line_user_id);

CREATE TABLE IF NOT EXISTS hpb_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL UNIQUE REFERENCES salons(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS articles_queue (
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

CREATE INDEX IF NOT EXISTS idx_articles_scheduled ON articles_queue(scheduled_for);

CREATE TABLE IF NOT EXISTS article_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles_queue(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_at TIMESTAMPTZ,
  UNIQUE(article_id, line_user_id)
);

ALTER TABLE kartes ENABLE ROW LEVEL SECURITY;
ALTER TABLE karte_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE karte_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_customer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpb_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles_queue ENABLE ROW LEVEL SECURITY;
