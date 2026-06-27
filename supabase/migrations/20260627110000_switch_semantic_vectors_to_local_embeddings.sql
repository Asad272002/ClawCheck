do $$
begin
  if exists (
    select 1
    from public.test_case_expected_checks
    where embedding is not null
  ) then
    raise exception 'Cannot switch semantic vector dimensions: test_case_expected_checks.embedding already has data.';
  end if;

  if exists (
    select 1
    from public.test_cases
    where prompt_embedding is not null
  ) then
    raise exception 'Cannot switch semantic vector dimensions: test_cases.prompt_embedding already has data.';
  end if;

  if exists (
    select 1
    from public.reports
    where agent_response_embedding is not null
       or summary_embedding is not null
  ) then
    raise exception 'Cannot switch semantic vector dimensions: reports semantic embedding columns already have data.';
  end if;
end
$$;

drop index if exists public.idx_test_case_expected_checks_embedding;
drop index if exists public.idx_test_cases_prompt_embedding;
drop index if exists public.idx_reports_agent_response_embedding;
drop index if exists public.idx_reports_summary_embedding;

alter table public.test_case_expected_checks
  alter column embedding type extensions.vector(384)
  using null::extensions.vector(384);

alter table public.test_cases
  alter column prompt_embedding type extensions.vector(384)
  using null::extensions.vector(384);

alter table public.reports
  alter column agent_response_embedding type extensions.vector(384)
  using null::extensions.vector(384),
  alter column summary_embedding type extensions.vector(384)
  using null::extensions.vector(384);

create index if not exists idx_test_case_expected_checks_embedding
  on public.test_case_expected_checks
  using hnsw (embedding extensions.vector_cosine_ops);

create index if not exists idx_test_cases_prompt_embedding
  on public.test_cases
  using hnsw (prompt_embedding extensions.vector_cosine_ops);

create index if not exists idx_reports_agent_response_embedding
  on public.reports
  using hnsw (agent_response_embedding extensions.vector_cosine_ops);

create index if not exists idx_reports_summary_embedding
  on public.reports
  using hnsw (summary_embedding extensions.vector_cosine_ops);
