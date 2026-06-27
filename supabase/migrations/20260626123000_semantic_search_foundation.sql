create extension if not exists vector with schema extensions;

create table if not exists public.test_case_expected_checks (
  id bigint generated always as identity primary key,
  test_case_id text not null references public.test_cases(id) on delete cascade,
  label text not null,
  description text,
  weight numeric(8, 4) check (weight is null or weight >= 0),
  embedding extensions.vector(1536),
  embedding_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (test_case_id, label)
);

create index if not exists idx_test_case_expected_checks_test_case_id
  on public.test_case_expected_checks(test_case_id);

create index if not exists idx_test_case_expected_checks_embedding
  on public.test_case_expected_checks
  using hnsw (embedding extensions.vector_cosine_ops);

alter table public.test_cases
  add column if not exists prompt_embedding extensions.vector(1536),
  add column if not exists prompt_embedding_model text,
  add column if not exists prompt_embedding_updated_at timestamptz;

create index if not exists idx_test_cases_prompt_embedding
  on public.test_cases
  using hnsw (prompt_embedding extensions.vector_cosine_ops);

alter table public.reports
  add column if not exists agent_response_embedding extensions.vector(1536),
  add column if not exists agent_response_embedding_model text,
  add column if not exists agent_response_embedding_updated_at timestamptz,
  add column if not exists summary_embedding extensions.vector(1536),
  add column if not exists summary_embedding_model text,
  add column if not exists summary_embedding_updated_at timestamptz;

create index if not exists idx_reports_agent_response_embedding
  on public.reports
  using hnsw (agent_response_embedding extensions.vector_cosine_ops);

create index if not exists idx_reports_summary_embedding
  on public.reports
  using hnsw (summary_embedding extensions.vector_cosine_ops);

insert into public.test_case_expected_checks (test_case_id, label)
select distinct
  test_cases.id,
  btrim(expected_check)
from public.test_cases
cross join lateral unnest(test_cases.expected_checks) as expected_check
where btrim(expected_check) <> ''
on conflict (test_case_id, label) do nothing;

grant select, insert, update, delete on public.test_case_expected_checks to authenticated;
grant usage, select on sequence public.test_case_expected_checks_id_seq to authenticated;

alter table public.test_case_expected_checks enable row level security;

drop policy if exists "test_case_expected_checks_select_authenticated" on public.test_case_expected_checks;
create policy "test_case_expected_checks_select_authenticated"
on public.test_case_expected_checks
for select
to authenticated
using (true);
