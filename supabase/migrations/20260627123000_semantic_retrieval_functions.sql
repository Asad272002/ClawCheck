create or replace function public.match_expected_checks(
  query_embedding extensions.vector(384),
  match_test_case_id text,
  match_count integer default 10,
  min_similarity double precision default 0
)
returns table (
  id bigint,
  test_case_id text,
  label text,
  description text,
  weight numeric,
  similarity double precision
)
language sql
stable
as $$
  select
    checks.id,
    checks.test_case_id,
    checks.label,
    checks.description,
    checks.weight,
    1 - (checks.embedding <=> query_embedding) as similarity
  from public.test_case_expected_checks as checks
  where checks.test_case_id = match_test_case_id
    and checks.embedding is not null
    and 1 - (checks.embedding <=> query_embedding) >= min_similarity
  order by checks.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

create or replace function public.match_reports(
  query_embedding extensions.vector(384),
  match_count integer default 10,
  match_workspace_id text default null,
  match_category text default null,
  match_status text default null,
  match_risk_level text default null,
  min_score integer default null,
  max_score integer default null
)
returns table (
  id text,
  workspace_id text,
  test_case_id text,
  created_at timestamptz,
  agent_name text,
  category text,
  final_score integer,
  status text,
  risk_level text,
  summary text,
  similarity double precision
)
language sql
stable
as $$
  select
    reports.id,
    reports.workspace_id,
    reports.test_case_id,
    reports.created_at,
    reports.agent_name,
    reports.category,
    reports.final_score,
    reports.status,
    reports.risk_level,
    reports.summary,
    1 - (reports.agent_response_embedding <=> query_embedding) as similarity
  from public.reports
  where reports.agent_response_embedding is not null
    and (match_workspace_id is null or reports.workspace_id = match_workspace_id)
    and (match_category is null or reports.category = match_category)
    and (match_status is null or reports.status = match_status)
    and (match_risk_level is null or reports.risk_level = match_risk_level)
    and (min_score is null or reports.final_score >= min_score)
    and (max_score is null or reports.final_score <= max_score)
  order by reports.agent_response_embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

create or replace function public.match_test_cases(
  query_embedding extensions.vector(384),
  match_count integer default 10,
  match_category text default null,
  match_difficulty text default null
)
returns table (
  id text,
  category text,
  title text,
  difficulty text,
  prompt text,
  similarity double precision
)
language sql
stable
as $$
  select
    test_cases.id,
    test_cases.category,
    test_cases.title,
    test_cases.difficulty,
    test_cases.prompt,
    1 - (test_cases.prompt_embedding <=> query_embedding) as similarity
  from public.test_cases
  where test_cases.prompt_embedding is not null
    and (match_category is null or test_cases.category = match_category)
    and (match_difficulty is null or test_cases.difficulty = match_difficulty)
  order by test_cases.prompt_embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
