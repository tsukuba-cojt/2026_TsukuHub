drop function if exists public.list_published_internships_for_university(uuid);
drop function if exists public.get_published_internship_for_university(uuid, uuid);

create or replace function public.list_published_internships_for_university(target_university_id uuid)
returns table (
  id uuid,
  company_name text,
  company_logo_url text,
  cover_image_url text,
  title text,
  summary text,
  company_description text,
  company_mission text,
  company_business text,
  company_message_to_students text,
  company_address text,
  company_map_url text,
  job_category text,
  location text,
  work_style text,
  is_remote boolean,
  work_conditions text,
  compensation text,
  description text,
  requirements text,
  preferred_skills text,
  acquirable_skills text,
  selection_process text,
  tags text[],
  deadline timestamptz,
  status text,
  is_featured boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    internships.id,
    internships.company_name,
    internships.company_logo_url,
    internships.cover_image_url,
    internships.title,
    internships.summary,
    internships.company_description,
    internships.company_mission,
    internships.company_business,
    internships.company_message_to_students,
    internships.company_address,
    internships.company_map_url,
    internships.job_category,
    internships.location,
    internships.work_style,
    internships.is_remote,
    internships.work_conditions,
    internships.compensation,
    internships.description,
    internships.requirements,
    internships.preferred_skills,
    internships.acquirable_skills,
    internships.selection_process,
    internships.tags,
    internships.deadline,
    internships.status,
    internships.is_featured,
    internships.created_at,
    internships.updated_at
  from public.internships internships
  where internships.status = 'published'
    and exists (
      select 1
      from public.internship_universities targets
      where targets.internship_id = internships.id
        and targets.university_id = target_university_id
    )
  order by internships.is_featured desc, internships.created_at desc;
$$;

create or replace function public.get_published_internship_for_university(
  target_id uuid,
  target_university_id uuid
)
returns table (
  id uuid,
  company_name text,
  company_logo_url text,
  cover_image_url text,
  title text,
  summary text,
  company_description text,
  company_mission text,
  company_business text,
  company_message_to_students text,
  company_address text,
  company_map_url text,
  job_category text,
  location text,
  work_style text,
  is_remote boolean,
  work_conditions text,
  compensation text,
  description text,
  requirements text,
  preferred_skills text,
  acquirable_skills text,
  selection_process text,
  tags text[],
  deadline timestamptz,
  status text,
  is_featured boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    internships.id,
    internships.company_name,
    internships.company_logo_url,
    internships.cover_image_url,
    internships.title,
    internships.summary,
    internships.company_description,
    internships.company_mission,
    internships.company_business,
    internships.company_message_to_students,
    internships.company_address,
    internships.company_map_url,
    internships.job_category,
    internships.location,
    internships.work_style,
    internships.is_remote,
    internships.work_conditions,
    internships.compensation,
    internships.description,
    internships.requirements,
    internships.preferred_skills,
    internships.acquirable_skills,
    internships.selection_process,
    internships.tags,
    internships.deadline,
    internships.status,
    internships.is_featured,
    internships.created_at,
    internships.updated_at
  from public.internships internships
  where internships.id = target_id
    and internships.status = 'published'
    and exists (
      select 1
      from public.internship_universities targets
      where targets.internship_id = internships.id
        and targets.university_id = target_university_id
    );
$$;

create or replace function public.admin_list_internships()
returns setof public.internships
language sql
stable
security definer
set search_path = public
as $$
  select internships.*
  from public.internships internships
  where public.is_global_admin()
  order by internships.created_at desc;
$$;

revoke all on function public.admin_list_internships() from public;
grant execute on function public.admin_list_internships() to authenticated;

revoke all on function public.list_published_internships_for_university(uuid) from public;
revoke all on function public.get_published_internship_for_university(uuid, uuid) from public;
grant execute on function public.list_published_internships_for_university(uuid) to anon, authenticated;
grant execute on function public.get_published_internship_for_university(uuid, uuid) to anon, authenticated;
