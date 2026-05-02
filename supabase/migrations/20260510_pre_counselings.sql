-- SalonRink Pre-Counseling Tables Migration
-- 2026-05-10
-- Creates pre_counselings table with RLS policies for pre-visit questionnaire feature

-- ========================================
-- 1. pre_counselings テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS public.pre_counselings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  reservation_id UUID,  -- NULLABLE: 将来的に reservations テーブルと連携予定
  token TEXT NOT NULL UNIQUE,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  answers JSONB,
  photos JSONB DEFAULT '[]'::jsonb,
  ai_analysis JSONB,
  ai_analyzed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. インデックス
-- ========================================
CREATE INDEX IF NOT EXISTS idx_pre_counselings_customer_id ON public.pre_counselings(customer_id);
CREATE INDEX IF NOT EXISTS idx_pre_counselings_salon_id ON public.pre_counselings(salon_id);
CREATE INDEX IF NOT EXISTS idx_pre_counselings_token ON public.pre_counselings(token);
CREATE INDEX IF NOT EXISTS idx_pre_counselings_status ON public.pre_counselings(status);
CREATE INDEX IF NOT EXISTS idx_pre_counselings_submitted_at ON public.pre_counselings(submitted_at);

-- ========================================
-- 3. トリガー関数: updated_at 自動更新
-- ========================================
CREATE OR REPLACE FUNCTION public.update_pre_counselings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. トリガー
-- ========================================
DROP TRIGGER IF EXISTS trigger_update_pre_counselings_updated_at ON public.pre_counselings;
CREATE TRIGGER trigger_update_pre_counselings_updated_at
  BEFORE UPDATE ON public.pre_counselings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pre_counselings_updated_at();

-- ========================================
-- 5. Row Level Security (RLS) 有効化
-- ========================================
ALTER TABLE public.pre_counselings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. RLS ポリシー: SELECT
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own pre_counselings" ON public.pre_counselings;
CREATE POLICY "Salon owners can view own pre_counselings"
  ON public.pre_counselings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = pre_counselings.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- 7. RLS ポリシー: INSERT
-- ========================================
DROP POLICY IF EXISTS "Salon owners can insert own pre_counselings" ON public.pre_counselings;
CREATE POLICY "Salon owners can insert own pre_counselings"
  ON public.pre_counselings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = pre_counselings.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- 8. RLS ポリシー: UPDATE
-- ========================================
DROP POLICY IF EXISTS "Salon owners can update own pre_counselings" ON public.pre_counselings;
CREATE POLICY "Salon owners can update own pre_counselings"
  ON public.pre_counselings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = pre_counselings.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = pre_counselings.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- 9. RLS ポリシー: DELETE
-- ========================================
DROP POLICY IF EXISTS "Salon owners can delete own pre_counselings" ON public.pre_counselings;
CREATE POLICY "Salon owners can delete own pre_counselings"
  ON public.pre_counselings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = pre_counselings.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );
