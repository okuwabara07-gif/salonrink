-- Add status and approved_at columns to kartes table
-- These columns support the karte approval workflow for future AI batch generation

ALTER TABLE kartes
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

ALTER TABLE kartes
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

COMMENT ON COLUMN kartes.status IS 'カルテのステータス: pending(承認待ち) / approved(承認済) / archived(アーカイブ)';
COMMENT ON COLUMN kartes.approved_at IS 'カルテ承認日時(管理者が承認したタイムスタンプ)';

-- 承認待ちカルテの高速検索用部分インデックス
CREATE INDEX IF NOT EXISTS kartes_salon_status_idx
ON kartes(salon_id, status)
WHERE status = 'pending';

-- 既存データの初期化: ai_analyzed_at が NULL のカルテは archived に設定
UPDATE kartes
SET status = 'archived'
WHERE ai_analyzed_at IS NULL AND status = 'pending';
