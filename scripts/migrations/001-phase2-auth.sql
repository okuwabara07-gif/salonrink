-- Phase 2: 認証 + テナント分離
-- 2026-04-18

-- salons テーブル拡張
alter table public.salons
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists status text default 'pending'
    check (status in ('pending','active','past_due','canceled')),
  add column if not exists trial_ends_at timestamptz;

create index if not exists salons_email_idx on public.salons (email);
create index if not exists salons_owner_user_id_idx on public.salons (owner_user_id);

-- RLS 有効化
alter table public.salons enable row level security;
alter table public.reservations enable row level security;
alter table public.customers enable row level security;

-- ポリシー: salons は owner_user_id = auth.uid() の行のみ
create policy "salons_owner_rw" on public.salons
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

-- ポリシー: reservations は自分の salon 配下のみ
create policy "reservations_owner_rw" on public.reservations
  for all using (
    salon_id in (select id from public.salons where owner_user_id = auth.uid())
  )
  with check (
    salon_id in (select id from public.salons where owner_user_id = auth.uid())
  );

-- ポリシー: customers は自分の salon 配下のみ
create policy "customers_owner_rw" on public.customers
  for all using (
    salon_id in (select id from public.salons where owner_user_id = auth.uid())
  )
  with check (
    salon_id in (select id from public.salons where owner_user_id = auth.uid())
  );
