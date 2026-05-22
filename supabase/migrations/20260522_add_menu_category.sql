-- salon_menus.category の補強
-- 既存カラムは存在するため、デフォルト値設定 + NOT NULL + 既存データ初期化 + 自動分類

-- 1. NULL データを '未分類' に更新
UPDATE salon_menus SET category = '未分類' WHERE category IS NULL;

-- 2. デフォルト値設定
ALTER TABLE salon_menus
ALTER COLUMN category SET DEFAULT '未分類';

-- 3. NOT NULL 制約追加
ALTER TABLE salon_menus
ALTER COLUMN category SET NOT NULL;

-- 4. 複合インデックス(検索高速化)
CREATE INDEX IF NOT EXISTS salon_menus_salon_category_sort_idx
ON salon_menus(salon_id, category, sort_order);

-- 5. 自動分類(name パターンから推定)

-- カラー系
UPDATE salon_menus
SET category = 'カラー'
WHERE category = '未分類' AND (
  name LIKE '%カラー%' OR
  name LIKE '%染め%' OR
  name LIKE '%ヘアカラー%' OR
  name LIKE '%リタッチ%' OR
  name LIKE '%カラーリング%' OR
  name LIKE '%白髪染め%'
);

-- カット系
UPDATE salon_menus
SET category = 'カット'
WHERE category = '未分類' AND (
  name LIKE '%カット%' OR
  name LIKE '%散髪%' OR
  name LIKE '%前髪%'
);

-- パーマ系
UPDATE salon_menus
SET category = 'パーマ'
WHERE category = '未分類' AND (
  name LIKE '%パーマ%' OR
  name LIKE '%矯正%' OR
  name LIKE '%ストレート%' OR
  name LIKE '%縮毛%'
);

-- トリートメント系
UPDATE salon_menus
SET category = 'トリートメント'
WHERE category = '未分類' AND (
  name LIKE '%トリートメント%' OR
  name LIKE '%ケア%' OR
  name LIKE '%補修%'
);

-- ヘッドスパ系
UPDATE salon_menus
SET category = 'ヘッドスパ'
WHERE category = '未分類' AND (
  name LIKE '%ヘッドスパ%' OR
  name LIKE '%スパ%' OR
  name LIKE '%頭皮%'
);

-- セット系
UPDATE salon_menus
SET category = 'セット'
WHERE category = '未分類' AND (
  name LIKE '%セット%' OR
  name LIKE '%ブロー%' OR
  name LIKE '%スタイリング%'
);

COMMENT ON COLUMN salon_menus.category IS 'メニューカテゴリ: カット / カラー / パーマ / トリートメント / ヘッドスパ / セット / 未分類';
