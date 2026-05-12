-- ===================================
-- SalonRink: Hot Lead Notification Flag
-- 作成日: 2026-05-12
-- 目的: スコア >= 70 達成時のメール送信を1回のみに制限
-- ===================================

BEGIN;

ALTER TABLE public.lp_leads
ADD COLUMN IF NOT EXISTS hot_lead_notified_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.lp_leads.hot_lead_notified_at IS
  'ホットリードメール送信日時(NULL = 未送信、値あり = 送信済み)';

COMMIT;
