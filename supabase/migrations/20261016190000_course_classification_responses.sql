create table if not exists public.course_classification_responses (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  course_code text not null default '' check (char_length(course_code) <= 32),
  course_name text not null check (char_length(course_name) between 1 and 300),
  respondent_department text not null check (char_length(respondent_department) between 1 and 200),
  respondent_major text check (respondent_major is null or char_length(respondent_major) <= 200),
  classification text not null check (
    classification in (
      'compulsory',
      'specialized',
      'specialized_foundation',
      'common',
      'related',
      'not_counted'
    )
  ),
  created_at timestamptz not null default now()
);

create index if not exists course_classification_responses_code_idx
on public.course_classification_responses (university_id, course_code);

create index if not exists course_classification_responses_name_idx
on public.course_classification_responses (university_id, lower(course_name));

create index if not exists course_classification_responses_context_idx
on public.course_classification_responses (
  university_id,
  respondent_department,
  respondent_major,
  classification
);

alter table public.course_classification_responses enable row level security;

-- 生の回答一覧は集計APIからのみ利用し、通常利用者へ公開しない。
create policy "course classification responses select admin"
on public.course_classification_responses
for select to authenticated
using (public.is_global_admin());

create policy "course classification responses insert own university"
on public.course_classification_responses
for insert to authenticated
with check (university_id = public.current_user_university_id());

create policy "course classification responses delete admin"
on public.course_classification_responses
for delete to authenticated
using (public.is_global_admin());

create or replace function public.get_course_classification_suggestions(
  target_university_id uuid,
  target_courses jsonb,
  target_department text default null,
  target_major text default null
)
returns table (
  course_key text,
  classification text,
  response_count bigint,
  weighted_score bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with authorized_university as (
    select id
    from public.universities
    where id = target_university_id
      and status = 'active'
      and (
        auth.uid() is null
        or public.is_global_admin()
        or public.current_user_university_id() = target_university_id
      )
  ),
  requested_courses as (
    select
      trim(item.course_key) as course_key,
      upper(trim(coalesce(item.course_code, ''))) as course_code,
      lower(trim(item.course_name)) as normalized_course_name
    from jsonb_to_recordset(coalesce(target_courses, '[]'::jsonb)) as item(
      course_key text,
      course_code text,
      course_name text
    )
  )
  select
    requested.course_key,
    responses.classification,
    count(*) as response_count,
    sum(
      case
        when nullif(trim(target_major), '') is not null
          and nullif(trim(target_department), '') is not null
          and responses.respondent_department = trim(target_department)
          and responses.respondent_major = trim(target_major) then 3
        when nullif(trim(target_department), '') is not null
          and responses.respondent_department = trim(target_department) then 2
        else 1
      end
    )::bigint as weighted_score
  from authorized_university
  cross join requested_courses requested
  join public.course_classification_responses responses
    on responses.university_id = authorized_university.id
   and (
     (requested.course_code <> '' and responses.course_code = requested.course_code)
     or lower(responses.course_name) = requested.normalized_course_name
   )
  group by requested.course_key, responses.classification
  order by requested.course_key, weighted_score desc, response_count desc, responses.classification;
$$;

revoke all on function public.get_course_classification_suggestions(
  uuid,
  jsonb,
  text,
  text
) from public;
grant execute on function public.get_course_classification_suggestions(
  uuid,
  jsonb,
  text,
  text
) to anon, authenticated;

comment on table public.course_classification_responses is
'Anonymous user-provided classifications for courses left unclassified by the graduation checker. Raw grades and user IDs are not stored.';
