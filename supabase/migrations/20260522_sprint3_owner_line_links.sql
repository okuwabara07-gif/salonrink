-- SalonRink Sprint 3: Owner LINE Links
-- 2026-05-22
--
-- Background:
--   グローバル単一 OA (@901bsvrb) とサロンオーナーの紐付けテーブル
--   朝 07:00 / 夜 21:00 cron 配信のターゲット管理
--   既存 line_accounts (per-salon 顧客向け) とは別系統

-- ========================================
-- owner_line_links テーブル作成
-- ========================================

CREATE TABLE IF NOT EXISTS public.owner_line_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- LINE 識別子(オーナー個人の LINE userId)
  line_user_id text UNIQUE NOT NULL,

  -- SalonRink 側のサロンオーナー識別子
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- 配信設定(オーナーが OFF にできる)
  morning_enabled boolean DEFAULT true,    -- 朝07:00 配信受け取る
  evening_enabled boolean DEFAULT true,    -- 夜21:00 配信受け取る

  -- 状態
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'unlinked')),

  -- 紐付け方法(将来拡張用)
  link_method text DEFAULT 'manual' CHECK (link_method IN ('manual', 'magic_link', 'onboarding')),

  -- メタデータ
  linked_at timestamptz DEFAULT now(),
  last_morning_sent_at timestamptz,
  last_evening_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.owner_line_links IS 'グローバル単一OA(@901bsvrb)とサロンオーナーの紐付け。朝/夜 cron 配信のターゲット管理。';

-- ========================================
-- インデックス
-- ========================================

CREATE INDEX IF NOT EXISTS idx_owner_line_links_salon
  ON public.owner_line_links(salon_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_owner_line_links_owner
  ON public.owner_line_links(owner_user_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_owner_line_links_morning
  ON public.owner_line_links(status, morning_enabled)
  WHERE status = 'active' AND morning_enabled = true;

CREATE INDEX IF NOT EXISTS idx_owner_line_links_evening
  ON public.owner_line_links(status, evening_enabled)
  WHERE status = 'active' AND evening_enabled = true;

-- ========================================
-- RLS 有効化
-- ========================================

ALTER TABLE public.owner_line_links ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS ポリシー
-- ========================================

-- ポリシー1: オーナー本人のみが自分の紐付けを SELECT 可
CREATE POLICY owner_line_links_select_own
  ON public.owner_line_links FOR SELECT
  USING (owner_user_id = auth.uid());

-- ポリシー2: オーナー本人のみが自分の紐付けを UPDATE 可(配信設定変更等)
CREATE POLICY owner_line_links_update_own
  ON public.owner_line_links FOR UPDATE
  USING (owner_user_id = auth.uid());

-- ポリシー3: オーナー本人のみが自分の紐付けを DELETE 可(連携解除)
CREATE POLICY owner_line_links_delete_own
  ON public.owner_line_links FOR DELETE
  USING (owner_user_id = auth.uid());

-- ========================================
-- updated_at 自動更新トリガー
-- ========================================

-- 既存の update_updated_at_column 関数があるか確認、なければ作成
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

CREATE TRIGGER owner_line_links_updated_at
  BEFORE UPDATE ON public.owner_line_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
