-- Security hardening for public client access.
-- Keep anonymous access read-only, and expose public timetable/review data
-- through privacy-preserving views/RPCs instead of raw tables.

revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke truncate on all tables in schema public from authenticated;

do $$
begin
  if to_regclass('public.courses') is not null then
    revoke all on table public.courses from anon, authenticated;
    grant select on table public.courses to anon, authenticated;
    grant select, insert, update, delete on table public.courses to service_role;

    alter table public.courses enable row level security;

    drop policy if exists "courses are readable" on public.courses;
    create policy "courses are readable"
    on public.courses
    for select
    to anon, authenticated
    using (true);
  end if;
end $$;

drop policy if exists "public or owner timetable histories are readable" on public.timetable_histories;
drop policy if exists "owner timetable histories are readable" on public.timetable_histories;
create policy "owner timetable histories are readable"
on public.timetable_histories
for select
to authenticated
using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "public or owner timetable courses are readable" on public.timetable_history_courses;
drop policy if exists "owner timetable courses are readable" on public.timetable_history_courses;
create policy "owner timetable courses are readable"
on public.timetable_history_courses
for select
to authenticated
using (
  exists (
    select 1
    from public.timetable_histories histories
    where histories.id = timetable_history_courses.history_id
      and (histories.owner_id = auth.uid() or public.is_admin())
  )
);

revoke all on public.timetable_histories from anon;
revoke all on public.timetable_history_courses from anon;
revoke all on public.timetable_histories from authenticated;
revoke all on public.timetable_history_courses from authenticated;
grant select, insert, update, delete on public.timetable_histories to authenticated;
grant select, insert, delete on public.timetable_history_courses to authenticated;

create or replace function public.list_public_timetable_histories(max_count integer default 48)
returns table (
  history_id uuid,
  display_name text,
  department text,
  major text,
  admission_year integer,
  academic_year integer,
  student_year_label text,
  track_label text,
  earned_units numeric,
  share_public boolean,
  history_created_at timestamptz,
  course_row_id uuid,
  course_code text,
  course_name text,
  credits numeric,
  course_academic_year integer,
  semester text,
  schedule text,
  instructor text,
  category text,
  module_key text,
  day_of_week text,
  period integer,
  special_type text
)
language sql
stable
security definer
set search_path = public
as $$
  with latest_histories as (
    select histories.*
    from public.timetable_histories histories
    where histories.share_public = true
    order by histories.created_at desc
    limit least(greatest(coalesce(max_count, 48), 1), 100)
  )
  select
    histories.id as history_id,
    histories.display_name,
    histories.department,
    histories.major,
    histories.admission_year,
    histories.academic_year,
    histories.student_year_label,
    histories.track_label,
    histories.earned_units,
    histories.share_public,
    histories.created_at as history_created_at,
    courses.id as course_row_id,
    courses.course_code,
    courses.course_name,
    courses.credits,
    courses.academic_year as course_academic_year,
    courses.semester,
    courses.schedule,
    courses.instructor,
    courses.category,
    courses.module_key,
    courses.day_of_week,
    courses.period,
    courses.special_type
  from latest_histories histories
  left join public.timetable_history_courses courses
    on courses.history_id = histories.id
  order by histories.created_at desc, histories.id, courses.course_code, courses.module_key, courses.day_of_week, courses.period;
$$;

revoke all on function public.list_public_timetable_histories(integer) from public;
grant execute on function public.list_public_timetable_histories(integer) to anon, authenticated;

drop policy if exists "published class reviews are public" on public.class_reviews;
drop policy if exists "owner class reviews are readable" on public.class_reviews;
create policy "owner class reviews are readable"
on public.class_reviews
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

revoke all on public.class_reviews from anon;
revoke all on public.class_reviews from authenticated;
grant select, insert, update, delete on public.class_reviews to authenticated;

create or replace view public.public_class_reviews
with (security_invoker = false)
as
select
  id,
  course_code,
  rating,
  lecture_format,
  test_format,
  difficulty,
  workload,
  attendance,
  past_exam,
  comment,
  anonymous,
  created_at
from public.class_reviews
where status = 'published';

revoke all on public.public_class_reviews from anon, authenticated;
grant select on public.public_class_reviews to anon, authenticated;

create or replace view public.course_learning_stats
with (security_invoker = false)
as
with distinct_public_courses as (
  select distinct
    histories.id as history_id,
    courses.course_code,
    courses.grade
  from public.timetable_history_courses courses
  join public.timetable_histories histories
    on histories.id = courses.history_id
  where histories.share_public = true
    and courses.grade is not null
)
select
  course_code,
  count(*) as sample_count,
  count(*) filter (where grade in ('A+', 'A', 'B', 'C', 'P', '認')) as passed_count,
  count(*) filter (where grade = 'A+') as a_plus_count,
  count(*) filter (where grade = 'A') as a_count,
  count(*) filter (where grade = 'B') as b_count,
  count(*) filter (where grade = 'C') as c_count,
  count(*) filter (where grade = 'D') as d_count,
  count(*) filter (where grade = 'F') as f_count,
  count(*) filter (where grade = 'P') as p_count,
  count(*) filter (where grade = '認') as recognized_count
from distinct_public_courses
group by course_code
having count(*) >= 10;

revoke all on public.course_learning_stats from anon, authenticated;
grant select on public.course_learning_stats to anon, authenticated;
