-- SalonRink Approval Funnel Backbone
-- 2026-06-18
--
-- Background:
--   承認制ファネル: リード → カルテ → 承認キュー → 実行関数
--   新規6テーブル (leads, lead_events, carte, approval_queue, nurture_queue, sns_queue)
--   既存 lp_leads は一切変更なし（backward compatible）
--   approval_queue.lead_id: NULLABLE (SNS投稿など site単位は lead_id無し)
--   sns_queue.lead_id: NULLABLE (サイト単位の投稿は lead_id無し)

-- ========================================
-- 1. leads テーブル (新規) — LP由来リード統一テーブル
-- ========================================

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- リード出所
  source text NOT NULL,  -- 'lp', 'direct', 'line', 'import', etc.

  -- LINE 連携(optional)
  line_user_id text,

  -- リード情報
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  salon_name text,
  salon_size text,  -- '1人', '2-3人', '4人以上', 'シェアサロン'

  -- CTA 種別
  cta_type text NOT NULL,  -- 'document_request', 'ai_experience', 'consultation_booking', 'free_trial', 'line_contact'

  -- AI 体験結果(optional)
  ai_experience_result jsonb,

  -- 状態
  status text DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected', 'archived')),

  -- タイムスタンプ
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.leads IS 'リード統一テーブル。LP、直接入力、LINE等から集約。';

CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_line_user_id ON public.leads(line_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- RLS: service_role=all, anon=read own line_user_id
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.leads
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "anon_read_own_line_user_id" ON public.leads
  FOR SELECT
  USING (auth.role() = 'anon' AND line_user_id IS NOT NULL AND line_user_id = current_setting('request.jwt.claims', true)::jsonb->>'line_user_id');

-- ========================================
-- 2. lead_events テーブル (新規) — リードライフサイクルイベント
-- ========================================

CREATE TABLE IF NOT EXISTS public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,

  -- イベント種別
  event_type text NOT NULL,  -- 'created', 'approved', 'rejected', 'nurture_sent', 'sns_published', etc.

  -- メタデータ
  metadata jsonb,

  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.lead_events IS 'リードのライフサイクルイベント記録。';

CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON public.lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_type ON public.lead_events(event_type);

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.lead_events
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 3. carte テーブル (新規) — AI提案カルテ
-- ========================================

CREATE TABLE IF NOT EXISTS public.carte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,

  -- AI生成カルテ本体
  content jsonb NOT NULL,

  -- 承認状態
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- 承認メタデータ
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.carte IS 'リード起点の AI生成カルテ。既存 kartes と別系統。';

CREATE INDEX IF NOT EXISTS idx_carte_lead_id ON public.carte(lead_id);
CREATE INDEX IF NOT EXISTS idx_carte_status ON public.carte(status);

ALTER TABLE public.carte ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.carte
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 4. approval_queue テーブル (新規) — 管理者承認待機
-- ========================================

CREATE TABLE IF NOT EXISTS public.approval_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- リード紐付け (NULLABLE: SNS投稿などサイト単位の項目は lead_id なし)
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,

  -- 実行種別
  kind text NOT NULL CHECK (kind IN ('sns_post', 'nurture_msg', 'outbound', 'product_push')),

  -- 実行パラメータ
  payload jsonb NOT NULL,

  -- コンプラチェック
  lint_status text DEFAULT 'pass' CHECK (lint_status IN ('pass', 'flag')),
  lint_notes text,

  -- 承認状態
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- 承認メタデータ
  decision_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decision_at timestamptz,

  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.approval_queue IS '管理者承認キュー。kind別実行関数呼び出し前のゲート。lint_status で事前コンプラチェック。';

CREATE INDEX IF NOT EXISTS idx_approval_queue_lead_id ON public.approval_queue(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_approval_queue_kind ON public.approval_queue(kind);
CREATE INDEX IF NOT EXISTS idx_approval_queue_status ON public.approval_queue(status);
CREATE INDEX IF NOT EXISTS idx_approval_queue_created_at ON public.approval_queue(created_at DESC);

ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.approval_queue
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 5. nurture_queue テーブル (新規) — フォローシーケンス
-- ========================================

CREATE TABLE IF NOT EXISTS public.nurture_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,

  -- チャネル
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'line')),

  -- シーケンス情報
  sequence_step int,
  message_template jsonb,

  -- 送信状態
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,

  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.nurture_queue IS 'リードのフォローシーケンス。Email/SMS/LINE の step-by-step 配信。';

CREATE INDEX IF NOT EXISTS idx_nurture_queue_lead_id ON public.nurture_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_nurture_queue_channel ON public.nurture_queue(channel);
CREATE INDEX IF NOT EXISTS idx_nurture_queue_status ON public.nurture_queue(status);
CREATE INDEX IF NOT EXISTS idx_nurture_queue_scheduled_at ON public.nurture_queue(scheduled_at) WHERE status = 'pending';

ALTER TABLE public.nurture_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.nurture_queue
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 6. sns_queue テーブル (新規) — SNS投稿予約キュー
-- ========================================

CREATE TABLE IF NOT EXISTS public.sns_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- リード紐付け (NULLABLE: サイト単位の投稿は lead_id なし)
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,

  -- サイト・プラットフォーム
  site text NOT NULL CHECK (site IN ('kirei', 'soccer', 'salonrink')),
  platform text NOT NULL CHECK (platform IN ('ig', 'x', 'tiktok', 'yt')),

  -- 投稿内容
  topic text,
  caption text,
  image_url text,

  -- コンプラチェック
  lint_status text DEFAULT 'pass' CHECK (lint_status IN ('pass', 'flag')),
  lint_notes text,

  -- 投稿状態
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'published', 'failed')),
  scheduled_at timestamptz,
  published_at timestamptz,

  -- 承認メタデータ
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,

  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.sns_queue IS 'SNS投稿予約キュー。site/platform 単位で管理。lint_status でコンプラゲート。';

CREATE INDEX IF NOT EXISTS idx_sns_queue_lead_id ON public.sns_queue(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sns_queue_site_platform ON public.sns_queue(site, platform);
CREATE INDEX IF NOT EXISTS idx_sns_queue_status ON public.sns_queue(status);
CREATE INDEX IF NOT EXISTS idx_sns_queue_scheduled_at ON public.sns_queue(scheduled_at) WHERE status IN ('pending', 'scheduled');
CREATE INDEX IF NOT EXISTS idx_sns_queue_created_at ON public.sns_queue(created_at DESC);

ALTER TABLE public.sns_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.sns_queue
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 完了メッセージ
-- ========================================
-- マイグレーション完了: 6テーブル + RLS (12ポリシー)
-- 既存テーブル・RLS・v4 LP・Stripe 導線一切変更なし (backward compatible)
