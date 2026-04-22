-- Invite codes テーブル
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_is_active ON public.invite_codes(is_active);

-- KIREI-FREE コード初期登録
INSERT INTO public.invite_codes (code, description, is_active)
VALUES ('KIREI-FREE', 'キレイ鶴見店 永久無料招待コード', true)
ON CONFLICT (code) DO NOTHING;

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_invite_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invite_codes_updated_at ON public.invite_codes;
CREATE TRIGGER update_invite_codes_updated_at
  BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_invite_codes_updated_at();
