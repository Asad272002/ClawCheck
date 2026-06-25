create or replace function private.current_profile_name()
returns text
language sql
security definer
set search_path = public, auth, pg_temp
as $$
  select profiles.full_name
  from public.profiles as profiles
  where profiles.id = (select auth.uid());
$$;

create or replace function private.is_workspace_owner(target_workspace_id text)
returns boolean
language sql
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.workspaces as workspaces
    where workspaces.id = target_workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  );
$$;

create or replace function private.has_workspace_access(target_workspace_id text)
returns boolean
language sql
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.workspaces as workspaces
    where workspaces.id = target_workspace_id
      and (
        workspaces.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.workspace_memberships as memberships
          where memberships.workspace_id = workspaces.id
            and memberships.user_id = (select auth.uid())
        )
      )
  );
$$;

revoke all on function private.current_profile_name() from public;
revoke all on function private.is_workspace_owner(text) from public;
revoke all on function private.has_workspace_access(text) from public;

grant execute on function private.current_profile_name() to authenticated;
grant execute on function private.is_workspace_owner(text) to authenticated;
grant execute on function private.has_workspace_access(text) to authenticated;

drop policy if exists "workspaces_select_accessible" on public.workspaces;
create policy "workspaces_select_accessible"
on public.workspaces
for select
to authenticated
using (
  (select private.has_workspace_access(id))
  or (
    owner_user_id is null
    and owner_name = coalesce((select private.current_profile_name()), '')
  )
);

drop policy if exists "workspace_memberships_select_accessible" on public.workspace_memberships;
create policy "workspace_memberships_select_accessible"
on public.workspace_memberships
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_workspace_owner(workspace_id))
);

drop policy if exists "workspace_memberships_insert_owner" on public.workspace_memberships;
create policy "workspace_memberships_insert_owner"
on public.workspace_memberships
for insert
to authenticated
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_memberships_update_owner" on public.workspace_memberships;
create policy "workspace_memberships_update_owner"
on public.workspace_memberships
for update
to authenticated
using ((select private.is_workspace_owner(workspace_id)))
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_memberships_delete_owner" on public.workspace_memberships;
create policy "workspace_memberships_delete_owner"
on public.workspace_memberships
for delete
to authenticated
using ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_versions_select_accessible" on public.workspace_versions;
create policy "workspace_versions_select_accessible"
on public.workspace_versions
for select
to authenticated
using ((select private.has_workspace_access(workspace_id)));

drop policy if exists "workspace_versions_insert_owner" on public.workspace_versions;
create policy "workspace_versions_insert_owner"
on public.workspace_versions
for insert
to authenticated
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_versions_update_owner" on public.workspace_versions;
create policy "workspace_versions_update_owner"
on public.workspace_versions
for update
to authenticated
using ((select private.is_workspace_owner(workspace_id)))
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_versions_delete_owner" on public.workspace_versions;
create policy "workspace_versions_delete_owner"
on public.workspace_versions
for delete
to authenticated
using ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_evaluations_select_accessible" on public.workspace_evaluations;
create policy "workspace_evaluations_select_accessible"
on public.workspace_evaluations
for select
to authenticated
using ((select private.has_workspace_access(workspace_id)));

drop policy if exists "workspace_evaluations_insert_owner" on public.workspace_evaluations;
create policy "workspace_evaluations_insert_owner"
on public.workspace_evaluations
for insert
to authenticated
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_evaluations_update_owner" on public.workspace_evaluations;
create policy "workspace_evaluations_update_owner"
on public.workspace_evaluations
for update
to authenticated
using ((select private.is_workspace_owner(workspace_id)))
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_evaluations_delete_owner" on public.workspace_evaluations;
create policy "workspace_evaluations_delete_owner"
on public.workspace_evaluations
for delete
to authenticated
using ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_weakness_insights_select_accessible" on public.workspace_weakness_insights;
create policy "workspace_weakness_insights_select_accessible"
on public.workspace_weakness_insights
for select
to authenticated
using ((select private.has_workspace_access(workspace_id)));

drop policy if exists "workspace_weakness_insights_insert_owner" on public.workspace_weakness_insights;
create policy "workspace_weakness_insights_insert_owner"
on public.workspace_weakness_insights
for insert
to authenticated
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_weakness_insights_update_owner" on public.workspace_weakness_insights;
create policy "workspace_weakness_insights_update_owner"
on public.workspace_weakness_insights
for update
to authenticated
using ((select private.is_workspace_owner(workspace_id)))
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_weakness_insights_delete_owner" on public.workspace_weakness_insights;
create policy "workspace_weakness_insights_delete_owner"
on public.workspace_weakness_insights
for delete
to authenticated
using ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_recommendations_select_accessible" on public.workspace_recommendations;
create policy "workspace_recommendations_select_accessible"
on public.workspace_recommendations
for select
to authenticated
using ((select private.has_workspace_access(workspace_id)));

drop policy if exists "workspace_recommendations_insert_owner" on public.workspace_recommendations;
create policy "workspace_recommendations_insert_owner"
on public.workspace_recommendations
for insert
to authenticated
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_recommendations_update_owner" on public.workspace_recommendations;
create policy "workspace_recommendations_update_owner"
on public.workspace_recommendations
for update
to authenticated
using ((select private.is_workspace_owner(workspace_id)))
with check ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "workspace_recommendations_delete_owner" on public.workspace_recommendations;
create policy "workspace_recommendations_delete_owner"
on public.workspace_recommendations
for delete
to authenticated
using ((select private.is_workspace_owner(workspace_id)));

drop policy if exists "reports_select_accessible" on public.reports;
create policy "reports_select_accessible"
on public.reports
for select
to authenticated
using (
  source = 'seeded'
  or created_by = (select auth.uid())
  or (
    workspace_id is not null
    and (select private.has_workspace_access(workspace_id))
  )
);

drop policy if exists "reports_insert_self" on public.reports;
create policy "reports_insert_self"
on public.reports
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (
    workspace_id is null
    or (select private.is_workspace_owner(workspace_id))
  )
);
