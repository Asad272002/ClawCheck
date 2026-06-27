alter table public.test_case_expected_checks
  add column if not exists embedding_updated_at timestamptz;
