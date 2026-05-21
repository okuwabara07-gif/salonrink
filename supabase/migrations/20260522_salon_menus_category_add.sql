-- SalonRink: salon_menus category カラム追加
-- 2026-05-22
-- 目的: メニューカテゴリ化準備(Day 1 Sprint 1)
-- RLS: 既存4ポリシー完璧のため追加なし

BEGIN;

-- ========================================
-- 1. category カラム追加
-- ========================================
-- 既存10行に対して非破壊性を確保
-- 新カラムは nullable のため既存データを変更しない

ALTER TABLE public.salon_menus
  ADD COLUMN IF NOT EXISTS category TEXT;

-- ========================================
-- 2. インデックス追加: 複合検索用
-- ========================================
-- salon_id + category + sort_order で LIFF UI フィルタリング最適化
-- (salon_id は RLS で自動絞られるため、category + sort_order の複合は UI レンダリング効率化)

CREATE INDEX IF NOT EXISTS idx_salon_menus_salon_category_sort
  ON public.salon_menus(salon_id, category, sort_order);

-- ========================================
-- 3. category 初期値: 既存10行に対して name から推測
-- ========================================
-- ネーミング規則から category を推測
-- 例: "カラー" "パーマ" "トリートメント" 等が name に含まれていれば抽出

UPDATE public.salon_menus
SET category =
  CASE
    WHEN name ILIKE '%カラー%' THEN 'カラー'
    WHEN name ILIKE '%リタッチ%' THEN 'カラー'
    WHEN name ILIKE '%全体%' THEN 'カラー'
    WHEN name ILIKE '%パーマ%' THEN 'パーマ'
    WHEN name ILIKE '%トリートメント%' THEN 'トリートメント'
    WHEN name ILIKE '%ストレート%' THEN 'ストレート'
    WHEN name ILIKE '%カット%' THEN 'カット'
    WHEN name ILIKE '%縮毛%' THEN 'ストレート'
    ELSE NULL  -- 推測できないものは NULL のまま
  END
WHERE category IS NULL
  AND salon_id = '1deea32a-adfd-4d01-ada4-6dbc50841d44';

COMMIT;
