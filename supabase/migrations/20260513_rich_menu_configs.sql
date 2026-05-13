-- ==========================================
-- SalonRink: rich_menu_configs テーブル作成
-- 作成日: 2026-05-13
-- 目的: LINEリッチメニュー設定を詳細に管理(テンプレート+プリセット+スタイル)
-- ==========================================

BEGIN;

-- ==========================================
-- 1. トリガー関数が存在しない場合は作成
-- ==========================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 2. rich_menu_configs テーブル作成
-- ==========================================

CREATE TABLE IF NOT EXISTS public.rich_menu_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL UNIQUE REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Layout & Style
  layout TEXT NOT NULL DEFAULT 'hero-6',
  style_id TEXT NOT NULL DEFAULT 'minimal',

  -- Slots (JSON配列、最大7要素)
  -- 形式: [{ presetId: string, label: string, url: string, action?: string }, ...]
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Greeting
  greeting_text TEXT,
  greeting_preset_id TEXT DEFAULT 'standard',

  -- Avatar
  avatar_id TEXT NOT NULL DEFAULT 'letter',

  -- Status
  is_draft BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  line_rich_menu_id TEXT,
  line_published_at TIMESTAMPTZ,

  -- メタ
  chat_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. インデックス作成
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_rich_menu_configs_salon_id ON public.rich_menu_configs(salon_id);
CREATE INDEX IF NOT EXISTS idx_rich_menu_configs_is_draft ON public.rich_menu_configs(is_draft);

-- ==========================================
-- 4. updated_at 自動更新トリガー
-- ==========================================

DROP TRIGGER IF EXISTS set_rich_menu_configs_updated_at ON public.rich_menu_configs;
CREATE TRIGGER set_rich_menu_configs_updated_at
  BEFORE UPDATE ON public.rich_menu_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- 5. RLS (Row Level Security) ポリシー
-- ==========================================

ALTER TABLE public.rich_menu_configs ENABLE ROW LEVEL SECURITY;

-- SELECT: ユーザーは自分のサロンのリッチメニュー設定を閲覧可能
CREATE POLICY "Users can view their salon's rich menu configs"
  ON public.rich_menu_configs FOR SELECT
  USING (salon_id IN (
    SELECT id FROM public.salons WHERE owner_user_id = auth.uid()
  ));

-- INSERT: ユーザーは自分のサロンのリッチメニュー設定を作成可能
CREATE POLICY "Users can insert their salon's rich menu configs"
  ON public.rich_menu_configs FOR INSERT
  WITH CHECK (salon_id IN (
    SELECT id FROM public.salons WHERE owner_user_id = auth.uid()
  ));

-- UPDATE: ユーザーは自分のサロンのリッチメニュー設定を更新可能
CREATE POLICY "Users can update their salon's rich menu configs"
  ON public.rich_menu_configs FOR UPDATE
  USING (salon_id IN (
    SELECT id FROM public.salons WHERE owner_user_id = auth.uid()
  ));

-- DELETE: ユーザーは自分のサロンのリッチメニュー設定を削除可能
CREATE POLICY "Users can delete their salon's rich menu configs"
  ON public.rich_menu_configs FOR DELETE
  USING (salon_id IN (
    SELECT id FROM public.salons WHERE owner_user_id = auth.uid()
  ));

-- ==========================================
-- 6. コメント
-- ==========================================

COMMENT ON TABLE public.rich_menu_configs IS 'LINEリッチメニュー設定テーブル(テンプレート+プリセット+スタイル管理)';
COMMENT ON COLUMN public.rich_menu_configs.layout IS 'レイアウトタイプ(hero-6, 3x2, 2x2, 2x1, 1x1)';
COMMENT ON COLUMN public.rich_menu_configs.style_id IS 'ビジュアルスタイル(minimal, botanical, luxury等)';
COMMENT ON COLUMN public.rich_menu_configs.slots IS 'ボタン配置情報(最大7個)';
COMMENT ON COLUMN public.rich_menu_configs.greeting_preset_id IS 'あいさつ文テンプレート ID';
COMMENT ON COLUMN public.rich_menu_configs.avatar_id IS 'アバターアイコン ID(letter, scissors等)';
COMMENT ON COLUMN public.rich_menu_configs.is_draft IS '下書きフラグ(true=下書き, false=公開済)';
COMMENT ON COLUMN public.rich_menu_configs.line_rich_menu_id IS 'LINE が返すリッチメニュー ID';
COMMENT ON COLUMN public.rich_menu_configs.line_published_at IS 'LINE に公開した日時';
COMMENT ON COLUMN public.rich_menu_configs.chat_title IS 'プレビュー用チャットタイトル(店舗名)';

COMMIT;
