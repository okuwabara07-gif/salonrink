-- SalonRink Model B LINE Integration — line_accounts Extension
-- 2026-05-04
--
-- Background:
--   line_accounts table (20260427) already manages 1:1 salon-LINE account mapping.
--   Encrypted credentials (channel_access_token_enc, channel_secret_enc) added 20260429.
--   This migration adds operational status tracking columns for Model B activation flow.

-- ========================================
-- 1. line_accounts テーブルにカラム追加
-- ========================================

ALTER TABLE public.line_accounts
  ADD COLUMN IF NOT EXISTS line_bot_basic_id TEXT,
  ADD COLUMN IF NOT EXISTS line_webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS line_status TEXT DEFAULT 'inactive'
    CHECK (line_status IN ('inactive', 'active', 'error')),
  ADD COLUMN IF NOT EXISTS line_connected_at TIMESTAMPTZ;

-- ========================================
-- 2. インデックス追加（active フィルタ用）
-- ========================================

CREATE INDEX IF NOT EXISTS idx_line_accounts_status_active
  ON public.line_accounts(line_status) WHERE line_status = 'active';

-- ========================================
-- 3. カラムコメント
-- ========================================

COMMENT ON COLUMN public.line_accounts.line_bot_basic_id IS '@xxxxx 形式の Bot basic ID (顧客の友だち追加 URL 生成用)';
COMMENT ON COLUMN public.line_accounts.line_webhook_url IS 'Webhook URL の表示用 (LINE Developers Console での設定確認用)';
COMMENT ON COLUMN public.line_accounts.line_status IS '接続状態: inactive (未設定) / active (稼働中) / error (異常)';
COMMENT ON COLUMN public.line_accounts.line_connected_at IS '初回接続成功日時';
