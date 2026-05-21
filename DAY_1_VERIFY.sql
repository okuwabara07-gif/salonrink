-- Day 1 Verification Query: category 分類結果確認（本番テーブル変更なし）
-- Osamu が Supabase SQL Editor で実行
-- 結果: 全10件のメニュー名 + 推測される category を確認

SELECT
  sort_order,
  name,
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
  END AS predicted_category,
  CASE
    WHEN CASE
      WHEN name ILIKE '%カラー%' THEN 'カラー'
      WHEN name ILIKE '%リタッチ%' THEN 'カラー'
      WHEN name ILIKE '%全体%' THEN 'カラー'
      WHEN name ILIKE '%パーマ%' THEN 'パーマ'
      WHEN name ILIKE '%トリートメント%' THEN 'トリートメント'
      WHEN name ILIKE '%ストレート%' THEN 'ストレート'
      WHEN name ILIKE '%カット%' THEN 'カット'
      WHEN name ILIKE '%縮毛%' THEN 'ストレート'
      ELSE NULL
    END IS NOT NULL THEN '✅'
    ELSE '❌ NULL'
  END AS status
FROM public.salon_menus
WHERE salon_id = '1deea32a-adfd-4d01-ada4-6dbc50841d44'
ORDER BY sort_order;
