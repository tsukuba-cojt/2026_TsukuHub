create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists role text not null default 'student';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles add constraint profiles_role_check check (role in ('student', 'admin'));
  end if;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' and new.role <> 'student' then
      raise exception 'role_escalation_not_allowed' using errcode = '42501';
    end if;
    if tg_op = 'UPDATE' and new.role is distinct from old.role and not public.is_admin() then
      raise exception 'role_escalation_not_allowed' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
before insert or update of role on public.profiles
for each row execute function public.protect_profile_role();

create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  company_logo_url text,
  title text not null,
  summary text not null,
  company_description text not null,
  job_category text not null,
  location text not null,
  work_style text not null,
  is_remote boolean not null default false,
  work_conditions text not null,
  compensation text not null,
  description text not null,
  requirements text not null,
  preferred_skills text not null default '',
  acquirable_skills text not null default '',
  selection_process text not null,
  tags text[] not null default '{}',
  deadline timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  is_featured boolean not null default false,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  applicant_name text not null,
  email text not null,
  faculty text not null,
  graduation_year integer not null check (graduation_year between 2020 and 2100),
  motivation text not null,
  skills text not null,
  portfolio_url text,
  additional_notes text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'interview', 'accepted', 'rejected', 'withdrawn')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (internship_id, user_id)
);

create index if not exists internships_status_deadline_idx on public.internships(status, deadline);
create index if not exists internships_featured_idx on public.internships(is_featured) where status = 'published';
create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_created_at_idx on public.applications(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists internships_set_updated_at on public.internships;
create trigger internships_set_updated_at before update on public.internships
for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at before update on public.applications
for each row execute function public.set_updated_at();

alter table public.internships enable row level security;
alter table public.applications enable row level security;

drop policy if exists "published internships are public" on public.internships;
create policy "published internships are public" on public.internships
for select using (status = 'published');

drop policy if exists "admins read all internships" on public.internships;
create policy "admins read all internships" on public.internships
for select to authenticated using (public.is_admin());

drop policy if exists "admins create internships" on public.internships;
create policy "admins create internships" on public.internships
for insert to authenticated with check (public.is_admin());

drop policy if exists "admins update internships" on public.internships;
create policy "admins update internships" on public.internships
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete internships" on public.internships;
create policy "admins delete internships" on public.internships
for delete to authenticated using (public.is_admin());

drop policy if exists "students read own applications" on public.applications;
create policy "students read own applications" on public.applications
for select to authenticated using (user_id = auth.uid());

drop policy if exists "students apply to open internships" on public.applications;
create policy "students apply to open internships" on public.applications
for insert to authenticated with check (
  user_id = auth.uid()
  and status = 'submitted'
  and admin_notes is null
  and exists (
    select 1 from public.internships i
    where i.id = internship_id and i.status = 'published' and i.deadline >= now()
  )
);

grant select on public.internships to anon, authenticated;
grant insert, update, delete on public.internships to authenticated;

revoke all on public.applications from anon, authenticated;
grant select (
  id, internship_id, user_id, applicant_name, email, faculty, graduation_year,
  motivation, skills, portfolio_url, additional_notes, status, created_at, updated_at
) on public.applications to authenticated;
grant insert (
  internship_id, user_id, applicant_name, email, faculty, graduation_year,
  motivation, skills, portfolio_url, additional_notes
) on public.applications to authenticated;

create or replace function public.admin_list_applications()
returns setof jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'insufficient_privilege' using errcode = '42501'; end if;
  return query
    select to_jsonb(a) || jsonb_build_object(
      'internship', jsonb_build_object('id', i.id, 'title', i.title, 'company_name', i.company_name)
    )
    from public.applications a
    join public.internships i on i.id = a.internship_id
    order by a.created_at desc;
end;
$$;

create or replace function public.admin_get_application(target_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'insufficient_privilege' using errcode = '42501'; end if;
  select to_jsonb(a) || jsonb_build_object(
    'internship', jsonb_build_object('id', i.id, 'title', i.title, 'company_name', i.company_name)
  ) into result
  from public.applications a
  join public.internships i on i.id = a.internship_id
  where a.id = target_id;
  return result;
end;
$$;

create or replace function public.admin_update_application(
  target_id uuid,
  next_status text,
  next_admin_notes text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'insufficient_privilege' using errcode = '42501'; end if;
  if next_status not in ('submitted', 'reviewing', 'interview', 'accepted', 'rejected', 'withdrawn') then
    raise exception 'invalid_status' using errcode = '22023';
  end if;
  update public.applications
  set status = next_status, admin_notes = nullif(trim(next_admin_notes), '')
  where id = target_id;
end;
$$;

revoke all on function public.admin_list_applications() from public;
revoke all on function public.admin_get_application(uuid) from public;
revoke all on function public.admin_update_application(uuid, text, text) from public;
grant execute on function public.admin_list_applications() to authenticated;
grant execute on function public.admin_get_application(uuid) to authenticated;
grant execute on function public.admin_update_application(uuid, text, text) to authenticated;

insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "company logos are public" on storage.objects;
create policy "company logos are public" on storage.objects
for select using (bucket_id = 'company-logos');

drop policy if exists "admins upload company logos" on storage.objects;
create policy "admins upload company logos" on storage.objects
for insert to authenticated with check (bucket_id = 'company-logos' and public.is_admin());

drop policy if exists "admins update company logos" on storage.objects;
create policy "admins update company logos" on storage.objects
for update to authenticated using (bucket_id = 'company-logos' and public.is_admin());

drop policy if exists "admins delete company logos" on storage.objects;
create policy "admins delete company logos" on storage.objects
for delete to authenticated using (bucket_id = 'company-logos' and public.is_admin());
