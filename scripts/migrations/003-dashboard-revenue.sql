-- Dashboard: Revenue tracking
-- 2026-04-20

-- reservations テーブル拡張（売上追跡）
alter table public.reservations
  add column if not exists price numeric(10,2) default 0,
  add column if not exists completed_at timestamptz,
  add column if not exists notes text;

-- インデックス作成
create index if not exists reservations_price_idx on public.reservations (price);
create index if not exists reservations_completed_at_idx on public.reservations (completed_at);
create index if not exists reservations_status_idx on public.reservations (status);
