-- ===================================
-- SalonRink: AI営業チーム Phase A
-- lp_leads 拡張 + lead_events 新規
-- 作成日: 2026-05-12
-- 目的: リードスコアリング・ステップメール・イベント追跡
-- ===================================

BEGIN;

-- ===== lp_leads テーブル拡張 =====

ALTER TABLE public.lp_leads
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_grade TEXT DEFAULT 'C',
ADD COLUMN IF NOT EXISTS last_emailed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS step_email_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opted_out BOOLEAN DEFAULT FALSE;

-- インデックス追加(クエリ高速化)
CREATE INDEX IF NOT EXISTS idx_lp_leads_score_grade ON public.lp_leads(score_grade);
CREATE INDEX IF NOT EXISTS idx_lp_leads_score ON public.lp_leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_lp_leads_opted_out ON public.lp_leads(opted_out);

-- コメント(説明)
COMMENT ON COLUMN public.lp_leads.score IS
  'リードスコア 0-100、毎日02:00(UTC)に /api/cron/score-leads で自動更新';

COMMENT ON COLUMN public.lp_leads.score_grade IS
  'スコアランク: A(ホット/80+) | B(育成中/40-79) | C(コールド/<40)';

COMMENT ON COLUMN public.lp_leads.last_emailed_at IS
  '最終ステップメール配信日時、連続配信の間隔制御に使用';

COMMENT ON COLUMN public.lp_leads.step_email_count IS
  'ステップメール送信回数(0-4段階)、max=4で配信終了';

COMMENT ON COLUMN public.lp_leads.opted_out IS
  '配信停止フラグ、true になるとメール配信停止';

-- ===== lead_events テーブル新規作成 =====

CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.lp_leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス(クエリ高速化)
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON public.lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_type ON public.lead_events(event_type);
CREATE INDEX IF NOT EXISTS idx_lead_events_created_at ON public.lead_events(created_at DESC);

-- コメント
COMMENT ON TABLE public.lead_events IS
  'リード行動イベント記録、スコアリングアルゴリズムと営業分析に使用';

COMMENT ON COLUMN public.lead_events.lead_id IS
  'lp_leads テーブルへの外部キー(ON DELETE CASCADE で自動削除)';

COMMENT ON COLUMN public.lead_events.event_type IS
  'イベント種別(以下のいずれか):'
  '- lead_created: リード作成(lp_leads INSERT)'
  '- email_sent: メール配信完了'
  '- email_opened: メール開封(pixel/webhook)'
  '- email_clicked: メールリンククリック'
  '- lp_revisit: LP 再訪問(analytics)'
  '- ai_experience_completed: AI 体験完了'
  '- signup: 無料サインアップ完了'
  '- churned: チャーン判定'
  '- opted_out: 配信停止申請';

COMMENT ON COLUMN public.lead_events.event_data IS
  'イベント種別ごとのペイロード:'
  '- email_sent: { template_id, subject, sent_at }'
  '- email_opened: { email_service_id, opened_at }'
  '- email_clicked: { url, source, clicked_at }'
  '- lp_revisit: { referrer, page, visited_at }'
  '- ai_experience_completed: { type, profile_id, completed_at }'
  '- signup: { plan_type, signup_at }'
  '- other: { reason, note }';

COMMIT;
