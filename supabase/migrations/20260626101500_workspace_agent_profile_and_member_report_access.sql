alter table public.workspaces
  add column if not exists agent_type text;

update public.workspaces
set agent_type = case
  when id = 'workspace-guardian' then 'Support agent'
  when id = 'workspace-harbor' then 'Risk review agent'
  when id = 'workspace-orbit' then 'Fairness analysis agent'
  else 'AI agent'
end
where agent_type is null;

alter table public.workspaces
  alter column agent_type set not null;

drop policy if exists "reports_insert_self" on public.reports;
create policy "reports_insert_self"
on public.reports
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (
    workspace_id is null
    or (select private.has_workspace_access(workspace_id))
  )
);
