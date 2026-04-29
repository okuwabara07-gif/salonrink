-- ===================================
-- SalonRink Phase 1: AIカルテ拡張
-- 作成日: 2026-04-30
-- 実行予定: 2026-05-03
-- 目的: kartes テーブルに AI 関連 4 カラム追加
-- ===================================

-- ⚠️ 実行前に必ず Supabase Dashboard でテーブル構造を確認
-- ⚠️ 既存データへの影響: なし(全カラム DEFAULT '{}' で nullable 相当)

BEGIN;

-- 1. AIカルテサマリー
-- 顧客の現在の状態を構造化(失敗D対策: 引き継ぎ不足解消)
ALTER TABLE kartes ADD COLUMN IF NOT EXISTS
  ai_summary jsonb DEFAULT '{}'::jsonb;
COMMENT ON COLUMN kartes.ai_summary IS
  'AI生成の顧客サマリー: {summary: text, generated_at: timestamp, model: text}';

-- 2. AI接客スクリプト
-- 顧客別の説明文・確認事項(失敗A/B対策: 説明・確認不足解消)
ALTER TABLE kartes ADD COLUMN IF NOT EXISTS
  ai_communication_scripts jsonb DEFAULT '{}'::jsonb;
COMMENT ON COLUMN kartes.ai_communication_scripts IS
  'AI生成の接客スクリプト: {pre_service: text, confirmation_checklist: array, homecare_advice: text}';

-- 3. AI警告(アレルギー・ダメージ等)
-- 施術前の自動アラート(失敗C対策: スキル不足解消)
ALTER TABLE kartes ADD COLUMN IF NOT EXISTS
  ai_warnings jsonb DEFAULT '{}'::jsonb;
COMMENT ON COLUMN kartes.ai_warnings IS
  'AI生成の警告情報: {allergy_warnings: array, damage_alerts: array, risk_level: text}';

-- 4. AI次回提案
-- 次回来店日・推奨メニュー
ALTER TABLE kartes ADD COLUMN IF NOT EXISTS
  ai_next_recommendation jsonb DEFAULT '{}'::jsonb;
COMMENT ON COLUMN kartes.ai_next_recommendation IS
  'AI生成の次回提案: {next_visit_date: date, recommended_menu: text, reasoning: text}';

-- 5. 検索用インデックス追加
CREATE INDEX IF NOT EXISTS idx_kartes_ai_summary
  ON kartes USING gin (ai_summary);

CREATE INDEX IF NOT EXISTS idx_kartes_ai_warnings
  ON kartes USING gin (ai_warnings);

-- 6. PostgREST スキーマ再ロード
NOTIFY pgrst, 'reload schema';

COMMIT;

-- ===================================
-- 確認用クエリ(実行後に確認)
-- ===================================

-- カラム追加確認
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'kartes' AND column_name LIKE 'ai_%';

-- 既存データ件数確認(変化がないこと)
-- SELECT COUNT(*) FROM kartes;
