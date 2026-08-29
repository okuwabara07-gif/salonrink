-- Day 1 DRY RUN: category 推測結果確認
-- Osamu が Supabase SQL Editor で実行し、結果を確認

-- ========================================
-- DRY RUN: UPDATE 前後を比較
-- ========================================

-- 1. 現在の状態を保存（実行前）
CREATE TEMP TABLE salon_menus_before AS
SELECT id, name, category FROM public.salon_menus
WHERE salon_id = '1deea32a-adfd-4d01-ada4-6dbc50841d44';

-- 2. DRY RUN: UPDATE を実行（上書き確認用）
BEGIN;

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
    ELSE NULL
  END
WHERE category IS NULL
  AND salon_id = '1deea32a-adfd-4d01-ada4-6dbc50841d44';

-- 3. 結果確認: 更新後のデータ
SELECT
  id,
  name,
  category,
  CASE
    WHEN category IS NOT NULL THEN '✅ 分類済み'
    ELSE '❌ 未分類 (NULL)'
  END as status
FROM public.salon_menus
WHERE salon_id = '1deea32a-adfd-4d01-ada4-6dbc50841d44'
ORDER BY sort_order;

-- 4. 統計: 分類結果の集約
SELECT
  category,
  COUNT(*) as count
FROM public.salon_menus
WHERE salon_id = '1deea32a-adfd-4d01-ada4-6dbc50841d44'
GROUP BY category
ORDER BY count DESC;

ROLLBACK;

-- ========================================
-- 確認ポイント
-- ========================================
-- 予想結果:
-- カラー: 8件（既存6件 + リタッチ + 全体で +2件）
-- その他: 2件以下（未分類は NULL）
--
-- もし結果が期待値通りなら、本番実行時に BEGIN; ～ COMMIT; をそのまま使用
-- 修正が必要なら、CASE 文を追加調整後に再度 DRY RUN 実行
