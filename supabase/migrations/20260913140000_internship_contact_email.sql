begin;

alter table public.internships
  add column if not exists company_contact_email text;

comment on column public.internships.company_contact_email is
  '応募通知を送る企業運営管理者のメールアドレス';

-- `university_id` was added to applications by the multi-university migration.
-- Keep the existing column-level privacy boundary while allowing students to
-- insert and read their own university-scoped application rows.
grant select (university_id) on public.applications to authenticated;
grant insert (university_id) on public.applications to authenticated;

-- Keep the contact address out of ordinary internship reads. Admin screens use
-- the guarded RPCs below, while the application notification function uses the
-- service role after authenticating the applicant.
revoke select on public.internships from anon, authenticated;
grant select (
  id, company_name, company_logo_url, cover_image_url, title, summary,
  company_description, job_category, location, work_style, is_remote,
  work_conditions, compensation, description, requirements, preferred_skills,
  acquirable_skills, selection_process, tags, deadline, status, is_featured,
  created_by, created_at, updated_at
) on public.internships to authenticated;

create or replace function public.admin_get_internship_contact_email(target_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_global_admin() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  return (select company_contact_email from public.internships where id = target_id);
end;
$$;

create or replace function public.admin_list_internship_contact_emails()
returns table (internship_id uuid, company_contact_email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_global_admin() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  return query
    select internships.id, internships.company_contact_email
    from public.internships internships;
end;
$$;

revoke all on function public.admin_get_internship_contact_email(uuid) from public;
revoke all on function public.admin_list_internship_contact_emails() from public;
grant execute on function public.admin_get_internship_contact_email(uuid) to authenticated;
grant execute on function public.admin_list_internship_contact_emails() to authenticated;

commit;
