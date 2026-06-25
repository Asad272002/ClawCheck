create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

alter table public.workspaces
  add column if not exists owner_user_id uuid references public.profiles(id) on delete set null;

create table if not exists public.workspace_memberships (
  workspace_id text not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.workspace_memberships enable row level security;

alter table public.reports
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

create index if not exists idx_workspaces_owner_user_id on public.workspaces(owner_user_id);
create index if not exists idx_workspace_memberships_user_id on public.workspace_memberships(user_id);
create index if not exists idx_workspace_memberships_workspace_id on public.workspace_memberships(workspace_id);
create index if not exists idx_reports_created_by on public.reports(created_by);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles (id, email, full_name, avatar_url)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data ->> 'full_name', users.raw_user_meta_data ->> 'name', split_part(coalesce(users.email, ''), '@', 1)),
  users.raw_user_meta_data ->> 'avatar_url'
from auth.users as users
on conflict (id) do update set
  email = excluded.email,
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
  updated_at = now();

insert into public.workspace_memberships (workspace_id, user_id, role, added_by)
select workspaces.id, workspaces.owner_user_id, 'owner', workspaces.owner_user_id
from public.workspaces
where workspaces.owner_user_id is not null
on conflict (workspace_id, user_id) do update set
  role = excluded.role,
  added_by = excluded.added_by;

grant usage on schema public to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_memberships to authenticated;
grant select, insert, update, delete on public.workspace_versions to authenticated;
grant select, insert, update, delete on public.workspace_evaluations to authenticated;
grant select, insert, update, delete on public.workspace_weakness_insights to authenticated;
grant select, insert, update, delete on public.workspace_recommendations to authenticated;
grant select on public.test_cases to authenticated;
grant select, insert, update on public.reports to authenticated;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "workspaces_select_accessible" on public.workspaces;
create policy "workspaces_select_accessible"
on public.workspaces
for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or exists (
    select 1
    from public.workspace_memberships memberships
    where memberships.workspace_id = workspaces.id
      and memberships.user_id = (select auth.uid())
  )
  or (
    owner_user_id is null
    and owner_name = coalesce(
      (select profiles.full_name from public.profiles profiles where profiles.id = (select auth.uid())),
      ''
    )
  )
);

drop policy if exists "workspaces_insert_owner" on public.workspaces;
create policy "workspaces_insert_owner"
on public.workspaces
for insert
to authenticated
with check (owner_user_id = (select auth.uid()));

drop policy if exists "workspaces_update_owner" on public.workspaces;
create policy "workspaces_update_owner"
on public.workspaces
for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

drop policy if exists "workspaces_delete_owner" on public.workspaces;
create policy "workspaces_delete_owner"
on public.workspaces
for delete
to authenticated
using (owner_user_id = (select auth.uid()));

drop policy if exists "workspace_memberships_select_accessible" on public.workspace_memberships;
create policy "workspace_memberships_select_accessible"
on public.workspace_memberships
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_memberships.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "workspace_memberships_insert_owner" on public.workspace_memberships;
create policy "workspace_memberships_insert_owner"
on public.workspace_memberships
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_memberships.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "workspace_memberships_update_owner" on public.workspace_memberships;
create policy "workspace_memberships_update_owner"
on public.workspace_memberships
for update
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_memberships.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_memberships.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "workspace_memberships_delete_owner" on public.workspace_memberships;
create policy "workspace_memberships_delete_owner"
on public.workspace_memberships
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_memberships.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "workspace_versions_select_accessible" on public.workspace_versions;
create policy "workspace_versions_select_accessible"
on public.workspace_versions
for select
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_versions.workspace_id
      and (
        workspaces.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.workspace_memberships memberships
          where memberships.workspace_id = workspace_versions.workspace_id
            and memberships.user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "workspace_versions_write_owner" on public.workspace_versions;
drop policy if exists "workspace_versions_insert_owner" on public.workspace_versions;
drop policy if exists "workspace_versions_update_owner" on public.workspace_versions;
drop policy if exists "workspace_versions_delete_owner" on public.workspace_versions;
create policy "workspace_versions_insert_owner"
on public.workspace_versions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_versions.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);
create policy "workspace_versions_update_owner"
on public.workspace_versions
for update
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_versions.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_versions.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);
create policy "workspace_versions_delete_owner"
on public.workspace_versions
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_versions.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "workspace_evaluations_select_accessible" on public.workspace_evaluations;
create policy "workspace_evaluations_select_accessible"
on public.workspace_evaluations
for select
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_evaluations.workspace_id
      and (
        workspaces.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.workspace_memberships memberships
          where memberships.workspace_id = workspace_evaluations.workspace_id
            and memberships.user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "workspace_evaluations_write_owner" on public.workspace_evaluations;
drop policy if exists "workspace_evaluations_insert_owner" on public.workspace_evaluations;
drop policy if exists "workspace_evaluations_update_owner" on public.workspace_evaluations;
drop policy if exists "workspace_evaluations_delete_owner" on public.workspace_evaluations;
create policy "workspace_evaluations_insert_owner"
on public.workspace_evaluations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_evaluations.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);
create policy "workspace_evaluations_update_owner"
on public.workspace_evaluations
for update
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_evaluations.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_evaluations.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);
create policy "workspace_evaluations_delete_owner"
on public.workspace_evaluations
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_evaluations.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "workspace_weakness_insights_select_accessible" on public.workspace_weakness_insights;
create policy "workspace_weakness_insights_select_accessible"
on public.workspace_weakness_insights
for select
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_weakness_insights.workspace_id
      and (
        workspaces.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.workspace_memberships memberships
          where memberships.workspace_id = workspace_weakness_insights.workspace_id
            and memberships.user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "workspace_weakness_insights_write_owner" on public.workspace_weakness_insights;
drop policy if exists "workspace_weakness_insights_insert_owner" on public.workspace_weakness_insights;
drop policy if exists "workspace_weakness_insights_update_owner" on public.workspace_weakness_insights;
drop policy if exists "workspace_weakness_insights_delete_owner" on public.workspace_weakness_insights;
create policy "workspace_weakness_insights_insert_owner"
on public.workspace_weakness_insights
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_weakness_insights.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);
create policy "workspace_weakness_insights_update_owner"
on public.workspace_weakness_insights
for update
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_weakness_insights.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_weakness_insights.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);
create policy "workspace_weakness_insights_delete_owner"
on public.workspace_weakness_insights
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_weakness_insights.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "workspace_recommendations_select_accessible" on public.workspace_recommendations;
create policy "workspace_recommendations_select_accessible"
on public.workspace_recommendations
for select
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_recommendations.workspace_id
      and (
        workspaces.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.workspace_memberships memberships
          where memberships.workspace_id = workspace_recommendations.workspace_id
            and memberships.user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "workspace_recommendations_write_owner" on public.workspace_recommendations;
drop policy if exists "workspace_recommendations_insert_owner" on public.workspace_recommendations;
drop policy if exists "workspace_recommendations_update_owner" on public.workspace_recommendations;
drop policy if exists "workspace_recommendations_delete_owner" on public.workspace_recommendations;
create policy "workspace_recommendations_insert_owner"
on public.workspace_recommendations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_recommendations.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);
create policy "workspace_recommendations_update_owner"
on public.workspace_recommendations
for update
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_recommendations.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_recommendations.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);
create policy "workspace_recommendations_delete_owner"
on public.workspace_recommendations
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where workspaces.id = workspace_recommendations.workspace_id
      and workspaces.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "test_cases_select_authenticated" on public.test_cases;
create policy "test_cases_select_authenticated"
on public.test_cases
for select
to authenticated
using (true);

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
    and exists (
      select 1
      from public.workspaces
      where workspaces.id = reports.workspace_id
        and (
          workspaces.owner_user_id = (select auth.uid())
          or exists (
            select 1
            from public.workspace_memberships memberships
            where memberships.workspace_id = reports.workspace_id
              and memberships.user_id = (select auth.uid())
          )
        )
    )
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
    or exists (
      select 1
      from public.workspaces
      where workspaces.id = reports.workspace_id
        and workspaces.owner_user_id = (select auth.uid())
    )
  )
);

drop policy if exists "reports_update_self" on public.reports;
create policy "reports_update_self"
on public.reports
for update
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));
