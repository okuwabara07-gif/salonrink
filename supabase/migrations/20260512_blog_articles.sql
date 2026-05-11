-- ===================================
-- SalonRink: Blog Article Tracking
-- 作成日: 2026-05-12
-- 目的: 自動生成ブログ記事の管理・トラッキング
-- ===================================

BEGIN;

-- ===== blog_articles テーブル作成 =====

CREATE TABLE IF NOT EXISTS public.blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  cluster TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  views INTEGER DEFAULT 0
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON public.blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON public.blog_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_cluster ON public.blog_articles(cluster);

-- コメント
COMMENT ON TABLE public.blog_articles IS
  '自動生成ブログ記事の管理テーブル。毎週月・水・金 06:00 に /api/cron/generate-blog-post で新規記事が作成される。';

COMMENT ON COLUMN public.blog_articles.slug IS
  'URL スラッグ、salonrink.com/blog/[slug] で参照';

COMMENT ON COLUMN public.blog_articles.title IS
  '記事タイトル';

COMMENT ON COLUMN public.blog_articles.cluster IS
  '記事カテゴリ: 競合比較 / ノウハウ / トレンド';

COMMENT ON COLUMN public.blog_articles.excerpt IS
  'SEO メタディスクリプション(120-150字)';

COMMENT ON COLUMN public.blog_articles.content IS
  '記事本文(Markdown形式、Vercel Read-only対策でDBに直接保存)';

COMMENT ON COLUMN public.blog_articles.image_url IS
  'OGP/サムネイル画像 URL';

COMMENT ON COLUMN public.blog_articles.views IS
  '記事閲覧数、アクセスごとに加算';

COMMIT;
