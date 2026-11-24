-- An explicit administrator-managed grant is required for each job.
create table public.company_recruiter_access (
  internship_id uuid not null references public.internships(id) on delete cascade,
  email text not null check (email = lower(trim(email)) and email like '%@%'),
  created_at timestamptz not null default now(),
  primary key (internship_id, email)
);
create index company_recruiter_access_email_idx on public.company_recruiter_access(email);
alter table public.company_recruiter_access enable row level security;
revoke all on public.company_recruiter_access from anon, authenticated;
grant select, insert, delete on public.company_recruiter_access to authenticated;
create policy "global admins manage company access" on public.company_recruiter_access
  for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

create function public.company_list_jobs()
returns table(id uuid, title text, company_name text, status text)
language sql stable security definer set search_path = public
as $$
  select i.id, i.title, i.company_name, i.status
  from public.internships i
  join public.company_recruiter_access c on c.internship_id = i.id
  join auth.users u on u.id = auth.uid() and lower(u.email) = c.email
  where u.email_confirmed_at is not null
  order by i.created_at desc;
$$;

create function public.company_list_applications(target_id uuid default null)
returns setof jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'id', a.id, 'internship_id', a.internship_id,
    'applicant_name', a.applicant_name, 'email', a.email, 'faculty', a.faculty,
    'graduation_year', a.graduation_year, 'motivation', a.motivation,
    'skills', a.skills, 'portfolio_url', a.portfolio_url,
    'additional_notes', a.additional_notes, 'status', a.status,
    'created_at', a.created_at, 'updated_at', a.updated_at,
    'internship', jsonb_build_object('id', i.id, 'title', i.title, 'company_name', i.company_name)
  )
  from public.applications a
  join public.internships i on i.id = a.internship_id
  join public.company_recruiter_access c on c.internship_id = i.id
  join auth.users u on u.id = auth.uid() and lower(u.email) = c.email
  where u.email_confirmed_at is not null and (target_id is null or a.id = target_id)
  order by a.created_at desc;
$$;

create function public.company_update_application(target_id uuid, next_status text)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if next_status not in ('submitted', 'reviewing', 'interview', 'accepted', 'rejected') or next_status is null then
    raise exception 'invalid_status' using errcode = '22023';
  end if;
  update public.applications a set status = next_status
  where a.id = target_id and a.status <> 'withdrawn'
    and exists (
      select 1 from public.company_recruiter_access c
      join auth.users u on u.id = auth.uid() and lower(u.email) = c.email
      where c.internship_id = a.internship_id and u.email_confirmed_at is not null
    );
  if not found then raise exception 'application_unavailable' using errcode = '42501'; end if;
end;
$$;

revoke all on function public.company_list_jobs() from public, anon;
revoke all on function public.company_list_applications(uuid) from public, anon;
revoke all on function public.company_update_application(uuid, text) from public, anon;
grant execute on function public.company_list_jobs() to authenticated;
grant execute on function public.company_list_applications(uuid) to authenticated;
grant execute on function public.company_update_application(uuid, text) to authenticated;


create or replace function public.assert_signup_allowed(request_email text, requested_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(coalesce(request_email, '')));
  normalized_slug text := lower(trim(coalesce(requested_slug, '')));
  target_university public.universities%rowtype;
  allowlisted boolean;
begin
  -- Company registration is invitation-only and independent of student domains.
  if normalized_slug = '' and exists (
    select 1 from public.company_recruiter_access where email = normalized_email
  ) then return; end if;
  select exists (
    select 1 from public.platform_admin_allowlist
    where email = normalized_email and enabled
  ) into allowlisted;

  -- Allowlisted platform-only administrators may intentionally have no university.
  if allowlisted and normalized_slug = '' then
    return;
  end if;

  select * into target_university
  from public.universities
  where slug = normalized_slug;

  if target_university.id is null then
    raise exception 'invalid_university' using errcode = '22023';
  end if;
  if target_university.status <> 'active' then
    raise exception 'university_suspended' using errcode = '42501';
  end if;
  if allowlisted then
    return;
  end if;
  if not target_university.signup_enabled then
    raise exception 'university_signup_disabled' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.university_email_domains domains
    where domains.university_id = target_university.id
      and domains.enabled
      and domains.domain = split_part(normalized_email, '@', 2)
  ) then
    raise exception 'email_domain_not_allowed' using errcode = '42501';
  end if;
end;
$$;


create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_university_id uuid;
  next_role text := 'student';
begin
  -- Company-only identities do not create a student profile or university access.
  if coalesce(new.raw_user_meta_data->>'university_slug', '') = ''
    and exists (select 1 from public.company_recruiter_access where email = lower(new.email))
    and not exists (select 1 from public.platform_admin_allowlist where email = lower(new.email) and enabled)
  then return new; end if;
  select id into requested_university_id
  from public.universities
  where slug = lower(new.raw_user_meta_data->>'university_slug');

  if exists (
    select 1 from public.platform_admin_allowlist
    where email = lower(new.email) and enabled
  ) then
    next_role := 'global_admin';
  end if;

  insert into public.profiles (
    id, name, grade, major, category, university_id, role
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    case
      when new.raw_user_meta_data->>'grade' ~ '^[0-9]+$'
        then (new.raw_user_meta_data->>'grade')::integer
      else null
    end,
    coalesce(new.raw_user_meta_data->>'major', ''),
    coalesce(new.raw_user_meta_data->>'category', ''),
    requested_university_id,
    next_role
  )
  on conflict (id) do update set
    university_id = coalesce(public.profiles.university_id, excluded.university_id),
    role = case
      when excluded.role = 'global_admin' then 'global_admin'
      else public.profiles.role
    end;

  return new;
end;
$$;
