-- LP Editor Tables
-- Phase 1: 基盤構築

-- lp_content テーブル
CREATE TABLE IF NOT EXISTS lp_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  value TEXT NOT NULL,
  default_value TEXT,
  description TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- lp_images テーブル
CREATE TABLE IF NOT EXISTS lp_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_lp_content_section_key ON lp_content(section_key);
CREATE INDEX IF NOT EXISTS idx_lp_images_section_key ON lp_images(section_key);

-- RLS 有効化
ALTER TABLE lp_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_images ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: 読み取り（全員）
CREATE POLICY "Public can read lp_content" ON lp_content
  FOR SELECT USING (true);

CREATE POLICY "Public can read lp_images" ON lp_images
  FOR SELECT USING (true);

-- RLS ポリシー: 書き込み（管理者のみ）
CREATE POLICY "Admin can write lp_content" ON lp_content
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email IN ('admin@aokae.net')
    )
  );

CREATE POLICY "Admin can write lp_images" ON lp_images
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email IN ('admin@aokae.net')
    )
  );
