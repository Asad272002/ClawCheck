create table if not exists public.workspace_semantic_analytics (
  id bigint generated always as identity primary key,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  semantic_report_count integer not null default 0 check (semantic_report_count >= 0),
  average_semantic_coverage numeric(6, 5) not null default 0 check (average_semantic_coverage >= 0 and average_semantic_coverage <= 1),
  total_expected_checks integer not null default 0 check (total_expected_checks >= 0),
  covered_checks integer not null default 0 check (covered_checks >= 0),
  partial_checks integer not null default 0 check (partial_checks >= 0),
  missed_checks integer not null default 0 check (missed_checks >= 0),
  most_common_missed_check text,
  most_common_partial_check text,
  top_suggestion_title text,
  top_suggestion_priority text check (top_suggestion_priority is null or top_suggestion_priority in ('high', 'medium', 'low')),
  repeated_semantic_themes jsonb not null default '[]'::jsonb,
  latest_semantic_report_id text references public.reports(id) on delete set null,
  latest_semantic_summary text,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create index if not exists idx_workspace_semantic_analytics_workspace_id
  on public.workspace_semantic_analytics(workspace_id);

create index if not exists idx_workspace_semantic_analytics_latest_report_id
  on public.workspace_semantic_analytics(latest_semantic_report_id);

grant select on public.workspace_semantic_analytics to authenticated;
grant usage, select on sequence public.workspace_semantic_analytics_id_seq to authenticated;

alter table public.workspace_semantic_analytics enable row level security;

drop policy if exists "workspace_semantic_analytics_select_accessible" on public.workspace_semantic_analytics;
create policy "workspace_semantic_analytics_select_accessible"
on public.workspace_semantic_analytics
for select
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_semantic_analytics.workspace_id
      and (
        workspaces.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.workspace_memberships memberships
          where memberships.workspace_id = workspace_semantic_analytics.workspace_id
            and memberships.user_id = (select auth.uid())
        )
      )
  )
);
