-- ============================================================
-- SalonRink Phase B: おたより配信機能 マイグレーション
-- 作成日: 2026-04-27
-- 適用先: Supabase fmpmgilgvvfezursmyic (本番)
-- ============================================================

-- 実行前確認:
-- 1. 本番DBに直接実行する前に必ず Osamu に確認
-- 2. 既存テーブル salons / customers が存在することを確認
-- 3. RLS設定で current_setting('app.salon_id') が機能することを確認

begin;

-- ------------------------------------------------------------
-- 1. クーポン本体
-- ------------------------------------------------------------
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  title text not null,
  description text,
  discount_type text check (discount_type in ('percent', 'yen', 'free_text')),
  discount_value int,
  valid_from date,
  valid_to date,
  status text not null default 'draft' check (status in ('draft', 'active', 'expired')),
  used_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_coupons_salon_id on coupons(salon_id);
create index idx_coupons_status on coupons(status);

-- ------------------------------------------------------------
-- 2. おたより本体
-- ------------------------------------------------------------
create table if not exists otayori_messages (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sent')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipient_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_otayori_messages_salon_id on otayori_messages(salon_id);
create index idx_otayori_messages_status on otayori_messages(status);
create index idx_otayori_messages_scheduled_at on otayori_messages(scheduled_at);

-- ------------------------------------------------------------
-- 3. おたより × クーポン（多対多）
-- ------------------------------------------------------------
create table if not exists otayori_coupons (
  otayori_id uuid not null references otayori_messages(id) on delete cascade,
  coupon_id uuid not null references coupons(id) on delete cascade,
  primary key (otayori_id, coupon_id)
);

-- ------------------------------------------------------------
-- 4. 配信履歴（テナント分離検証用に salon_id を重複保持）
-- ------------------------------------------------------------
create table if not exists otayori_deliveries (
  id uuid primary key default gen_random_uuid(),
  otayori_id uuid not null references otayori_messages(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  salon_id uuid not null,
  line_user_id text not null,
  delivered_at timestamptz default now(),
  status text default 'sent' check (status in ('sent', 'failed', 'clicked'))
);

create index idx_otayori_deliveries_otayori_id on otayori_deliveries(otayori_id);
create index idx_otayori_deliveries_customer_id on otayori_deliveries(customer_id);
create index idx_otayori_deliveries_salon_id on otayori_deliveries(salon_id);

-- ------------------------------------------------------------
-- 5. 美容コラム（haircolor-lab記事キャッシュ・Phase Cで使用）
-- ------------------------------------------------------------
create table if not exists beauty_columns (
  id uuid primary key default gen_random_uuid(),
  source_url text not null unique,
  title text not null,
  excerpt text,
  thumbnail_url text,
  category text,
  published_at timestamptz,
  fetched_at timestamptz default now()
);

create index idx_beauty_columns_published_at on beauty_columns(published_at desc);

-- ------------------------------------------------------------
-- 6. おたより × 美容コラム（Phase Cで使用）
-- ------------------------------------------------------------
create table if not exists otayori_columns (
  otayori_id uuid not null references otayori_messages(id) on delete cascade,
  column_id uuid not null references beauty_columns(id) on delete cascade,
  primary key (otayori_id, column_id)
);

-- ------------------------------------------------------------
-- 7. customers テーブルにオプトイン項目追加
-- ------------------------------------------------------------
alter table customers
  add column if not exists otayori_opt_in boolean default true;

-- ------------------------------------------------------------
-- 8. RLS（Row Level Security）有効化
-- ------------------------------------------------------------
alter table coupons enable row level security;
alter table otayori_messages enable row level security;
alter table otayori_coupons enable row level security;
alter table otayori_deliveries enable row level security;
alter table beauty_columns enable row level security;
alter table otayori_columns enable row level security;

-- ------------------------------------------------------------
-- 9. RLSポリシー（テナント分離）
-- ------------------------------------------------------------

create policy "salon_isolation_select_coupons" on coupons
  for select using (salon_id = current_setting('app.salon_id', true)::uuid);
create policy "salon_isolation_insert_coupons" on coupons
  for insert with check (salon_id = current_setting('app.salon_id', true)::uuid);
create policy "salon_isolation_update_coupons" on coupons
  for update using (salon_id = current_setting('app.salon_id', true)::uuid);
create policy "salon_isolation_delete_coupons" on coupons
  for delete using (salon_id = current_setting('app.salon_id', true)::uuid);

create policy "salon_isolation_select_otayori" on otayori_messages
  for select using (salon_id = current_setting('app.salon_id', true)::uuid);
create policy "salon_isolation_insert_otayori" on otayori_messages
  for insert with check (salon_id = current_setting('app.salon_id', true)::uuid);
create policy "salon_isolation_update_otayori" on otayori_messages
  for update using (salon_id = current_setting('app.salon_id', true)::uuid);
create policy "salon_isolation_delete_otayori" on otayori_messages
  for delete using (salon_id = current_setting('app.salon_id', true)::uuid);

create policy "salon_isolation_select_otayori_coupons" on otayori_coupons
  for select using (
    exists (select 1 from otayori_messages om where om.id = otayori_id and om.salon_id = current_setting('app.salon_id', true)::uuid)
  );
create policy "salon_isolation_insert_otayori_coupons" on otayori_coupons
  for insert with check (
    exists (select 1 from otayori_messages om where om.id = otayori_id and om.salon_id = current_setting('app.salon_id', true)::uuid)
  );
create policy "salon_isolation_delete_otayori_coupons" on otayori_coupons
  for delete using (
    exists (select 1 from otayori_messages om where om.id = otayori_id and om.salon_id = current_setting('app.salon_id', true)::uuid)
  );

create policy "salon_isolation_select_deliveries" on otayori_deliveries
  for select using (salon_id = current_setting('app.salon_id', true)::uuid);
create policy "salon_isolation_insert_deliveries" on otayori_deliveries
  for insert with check (salon_id = current_setting('app.salon_id', true)::uuid);

create policy "all_salons_can_read_columns" on beauty_columns
  for select using (true);

create policy "salon_isolation_select_otayori_columns" on otayori_columns
  for select using (
    exists (select 1 from otayori_messages om where om.id = otayori_id and om.salon_id = current_setting('app.salon_id', true)::uuid)
  );
create policy "salon_isolation_insert_otayori_columns" on otayori_columns
  for insert with check (
    exists (select 1 from otayori_messages om where om.id = otayori_id and om.salon_id = current_setting('app.salon_id', true)::uuid)
  );
create policy "salon_isolation_delete_otayori_columns" on otayori_columns
  for delete using (
    exists (select 1 from otayori_messages om where om.id = otayori_id and om.salon_id = current_setting('app.salon_id', true)::uuid)
  );

-- ------------------------------------------------------------
-- 10. updated_at 自動更新トリガー
-- ------------------------------------------------------------
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_coupons_updated_at before update on coupons
  for each row execute function update_updated_at_column();
create trigger trg_otayori_messages_updated_at before update on otayori_messages
  for each row execute function update_updated_at_column();

commit;
