-- SalonRink LINE Credentials Migration
-- 2026-04-29
-- Adds encrypted channel information columns to line_accounts table

-- ========================================
-- 1. line_accounts テーブルにカラム追加
-- ========================================

ALTER TABLE public.line_accounts
  ADD COLUMN IF NOT EXISTS channel_id TEXT,
  ADD COLUMN IF NOT EXISTS channel_access_token_enc TEXT,
  ADD COLUMN IF NOT EXISTS channel_secret_enc TEXT;

-- ========================================
-- 2. インデックス追加
-- ========================================

CREATE INDEX IF NOT EXISTS idx_line_accounts_channel_id ON public.line_accounts(channel_id);

-- ========================================
-- 3. 既存のRLSポリシーはそのまま
-- ========================================

-- line_accounts テーブルのRLSポリシーは既に設定済み
-- (20260427_create_rls_policies.sql 参照)
