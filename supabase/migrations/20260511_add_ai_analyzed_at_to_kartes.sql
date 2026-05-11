-- ===================================
-- SalonRink: kartes テーブルに ai_analyzed_at 追加
-- 作成日: 2026-05-11
-- 目的: Commit 48 で AI 再分析時のタイムスタンプ記録
-- ===================================

BEGIN;

-- ai_analyzed_at カラム追加
ALTER TABLE kartes ADD COLUMN IF NOT EXISTS
  ai_analyzed_at TIMESTAMPTZ;
COMMENT ON COLUMN kartes.ai_analyzed_at IS
  'AI分析の最終実行タイムスタンプ (pre-counseling時刻 or Commit48再分析時刻)';

-- インデックス追加（ソート・フィルタリング用）
CREATE INDEX IF NOT EXISTS idx_kartes_ai_analyzed_at
  ON kartes(ai_analyzed_at DESC NULLS LAST);

-- PostgREST スキーマ再ロード
NOTIFY pgrst, 'reload schema';

COMMIT;
