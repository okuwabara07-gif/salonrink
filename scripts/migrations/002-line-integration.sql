-- Phase 2B: LINE 連携
-- 2026-04-20

-- reservations テーブル拡張（LINE 連携カラム追加）
alter table public.reservations
  add column if not exists source text default 'web' check (source in ('web', 'line')),
  add column if not exists line_message_id text,
  add column if not exists line_user_id text,
  add column if not exists created_at timestamptz default now();

-- customers テーブル拡張（LINE 連携用）
alter table public.customers
  add column if not exists line_user_id text unique,
  add column if not exists line_display_name text;

-- インデックス作成
create index if not exists reservations_source_idx on public.reservations (source);
create index if not exists reservations_line_user_id_idx on public.reservations (line_user_id);
create index if not exists customers_line_user_id_idx on public.customers (line_user_id);
create index if not exists reservations_created_at_idx on public.reservations (created_at);
