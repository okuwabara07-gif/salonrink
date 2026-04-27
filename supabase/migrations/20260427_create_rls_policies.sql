-- SalonRink RLS Policies Migration
-- 2026-04-27
-- Creates Row Level Security policies for all tenant-isolated tables
-- All policies enforce salon_id-based tenant isolation

-- ========================================
-- salon_addons RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own addons" ON public.salon_addons;
CREATE POLICY "Salon owners can view own addons"
  ON public.salon_addons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_addons.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own addons" ON public.salon_addons;
CREATE POLICY "Salon owners can insert own addons"
  ON public.salon_addons
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_addons.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own addons" ON public.salon_addons;
CREATE POLICY "Salon owners can update own addons"
  ON public.salon_addons
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_addons.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_addons.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- line_accounts RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own LINE account" ON public.line_accounts;
CREATE POLICY "Salon owners can view own LINE account"
  ON public.line_accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_accounts.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own LINE account" ON public.line_accounts;
CREATE POLICY "Salon owners can insert own LINE account"
  ON public.line_accounts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_accounts.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own LINE account" ON public.line_accounts;
CREATE POLICY "Salon owners can update own LINE account"
  ON public.line_accounts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_accounts.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_accounts.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- line_customer_links RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own customer links" ON public.line_customer_links;
CREATE POLICY "Salon owners can view own customer links"
  ON public.line_customer_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_customer_links.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own customer links" ON public.line_customer_links;
CREATE POLICY "Salon owners can insert own customer links"
  ON public.line_customer_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_customer_links.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own customer links" ON public.line_customer_links;
CREATE POLICY "Salon owners can update own customer links"
  ON public.line_customer_links
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_customer_links.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = line_customer_links.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- hpb_integrations RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own HPB integration" ON public.hpb_integrations;
CREATE POLICY "Salon owners can view own HPB integration"
  ON public.hpb_integrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = hpb_integrations.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own HPB integration" ON public.hpb_integrations;
CREATE POLICY "Salon owners can insert own HPB integration"
  ON public.hpb_integrations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = hpb_integrations.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own HPB integration" ON public.hpb_integrations;
CREATE POLICY "Salon owners can update own HPB integration"
  ON public.hpb_integrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = hpb_integrations.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = hpb_integrations.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- salon_hpb_credentials RLS Policies
-- (Encrypted credentials - read-only for owners)
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own HPB credentials" ON public.salon_hpb_credentials;
CREATE POLICY "Salon owners can view own HPB credentials"
  ON public.salon_hpb_credentials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_hpb_credentials.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own HPB credentials" ON public.salon_hpb_credentials;
CREATE POLICY "Salon owners can insert own HPB credentials"
  ON public.salon_hpb_credentials
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_hpb_credentials.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own HPB credentials" ON public.salon_hpb_credentials;
CREATE POLICY "Salon owners can update own HPB credentials"
  ON public.salon_hpb_credentials
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_hpb_credentials.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_hpb_credentials.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- kartes RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own kartes" ON public.kartes;
CREATE POLICY "Salon owners can view own kartes"
  ON public.kartes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = kartes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own kartes" ON public.kartes;
CREATE POLICY "Salon owners can insert own kartes"
  ON public.kartes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = kartes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own kartes" ON public.kartes;
CREATE POLICY "Salon owners can update own kartes"
  ON public.kartes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = kartes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = kartes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- karte_photos RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own karte photos" ON public.karte_photos;
CREATE POLICY "Salon owners can view own karte photos"
  ON public.karte_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_photos.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own karte photos" ON public.karte_photos;
CREATE POLICY "Salon owners can insert own karte photos"
  ON public.karte_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_photos.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can delete own karte photos" ON public.karte_photos;
CREATE POLICY "Salon owners can delete own karte photos"
  ON public.karte_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_photos.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- karte_recipes RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own karte recipes" ON public.karte_recipes;
CREATE POLICY "Salon owners can view own karte recipes"
  ON public.karte_recipes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_recipes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own karte recipes" ON public.karte_recipes;
CREATE POLICY "Salon owners can insert own karte recipes"
  ON public.karte_recipes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_recipes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can update own karte recipes" ON public.karte_recipes;
CREATE POLICY "Salon owners can update own karte recipes"
  ON public.karte_recipes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_recipes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = karte_recipes.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- ========================================
-- article_deliveries RLS Policies
-- ========================================
DROP POLICY IF EXISTS "Salon owners can view own article deliveries" ON public.article_deliveries;
CREATE POLICY "Salon owners can view own article deliveries"
  ON public.article_deliveries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = article_deliveries.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Salon owners can insert own article deliveries" ON public.article_deliveries;
CREATE POLICY "Salon owners can insert own article deliveries"
  ON public.article_deliveries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = article_deliveries.salon_id
      AND salons.owner_user_id = auth.uid()
    )
  );

-- articles_queue: public read (visible to all)
DROP POLICY IF EXISTS "Everyone can view articles" ON public.articles_queue;
CREATE POLICY "Everyone can view articles"
  ON public.articles_queue
  FOR SELECT
  USING (true);
