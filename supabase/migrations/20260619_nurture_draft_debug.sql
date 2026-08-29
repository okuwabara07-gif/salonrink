-- Nurture Draft デバッグテーブル
-- handleNurtureDraft の各段階を記録して、INSERT 0 件の原因を診断

CREATE TABLE IF NOT EXISTS public.nurture_draft_debug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at timestamptz DEFAULT now(),
  extracted_count int,
  haiku_raw text,
  parsed_subject text,
  parsed_html_len int,
  is_valid boolean,
  lint_passed boolean,
  lint_reason text,
  inserted_count int,
  skipped_reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nurture_draft_debug_run_at ON public.nurture_draft_debug(run_at DESC);

COMMENT ON TABLE public.nurture_draft_debug IS 'nurture-draft cron の診断ログ。生成→解析→lint→insert の各段階を記録。';
