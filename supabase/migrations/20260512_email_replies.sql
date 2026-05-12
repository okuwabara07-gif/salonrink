-- ==========================================
-- SalonRink: Email Replies テーブル
-- 作成日: 2026-05-12
-- 目的: ImprovMX 経由のメール受信 + AI 分類 + 自動応答の履歴管理
-- ==========================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.email_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.lp_leads(id) ON DELETE SET NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  classification TEXT,
  confidence REAL,
  ai_response_text TEXT,
  ai_response_sent_at TIMESTAMPTZ,
  needs_human_review BOOLEAN DEFAULT FALSE,
  human_reviewed_at TIMESTAMPTZ,
  raw_headers JSONB,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_replies_lead_id ON public.email_replies(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_from_email ON public.email_replies(from_email);
CREATE INDEX IF NOT EXISTS idx_email_replies_classification ON public.email_replies(classification);
CREATE INDEX IF NOT EXISTS idx_email_replies_received_at ON public.email_replies(received_at DESC);

COMMENT ON TABLE public.email_replies IS 'リードからの返信メール + AI分類 + 自動応答履歴';
COMMENT ON COLUMN public.email_replies.classification IS 'question / meeting / unsubscribe / absent / unknown';
COMMENT ON COLUMN public.email_replies.confidence IS '0.0-1.0 のAI分類信頼度';

COMMIT;
