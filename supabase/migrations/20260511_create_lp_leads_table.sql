-- ===================================
-- SalonRink: LP Leads テーブル作成
-- 作成日: 2026-05-11
-- 目的: LP リード管理（資料請求、AI体験、無料試用など）
-- ===================================

BEGIN;

-- LP Leads テーブル作成
CREATE TABLE IF NOT EXISTS public.lp_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  salon_name TEXT,
  salon_size TEXT,
  cta_type TEXT NOT NULL,
  source TEXT,
  ai_experience_result JSONB,
  status TEXT NOT NULL DEFAULT 'new',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_lp_leads_email
  ON public.lp_leads(email);

CREATE INDEX IF NOT EXISTS idx_lp_leads_created_at
  ON public.lp_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lp_leads_status
  ON public.lp_leads(status);

CREATE INDEX IF NOT EXISTS idx_lp_leads_cta_type
  ON public.lp_leads(cta_type);

-- テーブルコメント
COMMENT ON TABLE public.lp_leads IS
  'LP からのリード(資料請求、AI体験、無料試用など)';

COMMENT ON COLUMN public.lp_leads.cta_type IS
  'document_request | consultation_booking | free_trial | line_contact | ai_experience';

COMMENT ON COLUMN public.lp_leads.source IS
  'hero_ai_experience | lead_banner | final_cta | etc';

COMMENT ON COLUMN public.lp_leads.status IS
  'new | contacted | converted | lost';

COMMIT;
