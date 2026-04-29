-- ===================================
-- SalonRink Phase 1: AI 使用量追跡
-- 作成日: 2026-05-04
-- 目的: サロンごとの AI API 使用量を月次で追跡
-- ===================================

BEGIN;

-- ========================================
-- ai_usage テーブル（AI 使用量集計）
-- ========================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- 集計期間
  year_month VARCHAR(7) NOT NULL, -- 'YYYY-MM' 形式

  -- API 種別ごとの使用量
  api_type TEXT NOT NULL CHECK (api_type IN (
    'customer_summary',
    'communication_script',
    'allergy_warning',
    'next_recommendation'
  )),

  -- 使用統計
  call_count INTEGER NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,

  -- 課金対象（予約用）
  estimated_cost_jpy INTEGER DEFAULT 0, -- 推定コスト（円）

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 複合主キー：サロン × 期間 × API種別
  UNIQUE(salon_id, year_month, api_type)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_salon_id
  ON public.ai_usage(salon_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_year_month
  ON public.ai_usage(year_month DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_salon_month
  ON public.ai_usage(salon_id, year_month DESC);

-- ========================================
-- RLS Policies for ai_usage
-- ========================================
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Salon owners can view own AI usage" ON public.ai_usage;
CREATE POLICY "Salon owners can view own AI usage"
  ON public.ai_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = ai_usage.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert AI usage records" ON public.ai_usage;
CREATE POLICY "System can insert AI usage records"
  ON public.ai_usage
  FOR INSERT
  WITH CHECK (true); -- API サーバー側で salon_id を検証

DROP POLICY IF EXISTS "System can update AI usage records" ON public.ai_usage;
CREATE POLICY "System can update AI usage records"
  ON public.ai_usage
  FOR UPDATE
  USING (true) -- API サーバー側で salon_id を検証
  WITH CHECK (true);

-- ========================================
-- PostgREST スキーマ再ロード
-- ========================================
NOTIFY pgrst, 'reload schema';

COMMIT;

-- ===================================
-- 確認用クエリ（実行後に確認）
-- ===================================

-- テーブル確認
-- SELECT table_name FROM information_schema.tables
-- WHERE table_name = 'ai_usage';

-- カラム確認
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'ai_usage' ORDER BY ordinal_position;

-- RLS ポリシー確認
-- SELECT schemaname, tablename, policyname FROM pg_policies
-- WHERE tablename = 'ai_usage';
