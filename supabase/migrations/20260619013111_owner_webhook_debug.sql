-- 一時テーブル: owner-webhook で受け取った最新の userId を記録
CREATE TABLE IF NOT EXISTS owner_webhook_debug (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_user_id TEXT NOT NULL,
  event_type TEXT,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: disable（管理用）
ALTER TABLE owner_webhook_debug DISABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_owner_webhook_debug_received_at ON owner_webhook_debug(received_at DESC);
