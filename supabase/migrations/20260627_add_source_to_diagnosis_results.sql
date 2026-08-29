-- Phase C: ファネル流入元を記録（2026-06-27 SQL Editorで本番適用済み・push不要・記録用）
-- 既存データ/カラムに触れない追加のみ。
alter table public.diagnosis_results
  add column if not exists source text;

comment on column public.diagnosis_results.source is
  'ファネル流入元: karte / lp / miniapp / direct 等';

create index if not exists idx_diagnosis_results_source
  on public.diagnosis_results (source);
