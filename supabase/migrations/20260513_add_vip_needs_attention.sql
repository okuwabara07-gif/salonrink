-- ==========================================
-- SalonRink: customers テーブルに VIP / 要注意 フラグ追加
-- 作成日: 2026-05-13
-- 目的: 美容師が顧客に VIP / 要注意 のステータスを設定可能にする
-- ==========================================

BEGIN;

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS needs_attention BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_customers_is_vip ON public.customers(is_vip) WHERE is_vip = TRUE;
CREATE INDEX IF NOT EXISTS idx_customers_needs_attention ON public.customers(needs_attention) WHERE needs_attention = TRUE;

COMMENT ON COLUMN public.customers.is_vip IS 'VIP 顧客フラグ(美容師が手動設定)';
COMMENT ON COLUMN public.customers.needs_attention IS '要注意 顧客フラグ(美容師が手動設定、クレーマー/トラブル履歴等)';

COMMIT;
