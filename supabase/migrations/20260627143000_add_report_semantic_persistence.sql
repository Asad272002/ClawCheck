alter table public.reports
  add column if not exists semantic_coverage jsonb,
  add column if not exists semantic_suggestions jsonb,
  add column if not exists semantic_similar_reports jsonb,
  add column if not exists semantic_workspace_memory jsonb,
  add column if not exists semantic_summary text,
  add column if not exists semantic_model text,
  add column if not exists semantic_generated_at timestamptz;
