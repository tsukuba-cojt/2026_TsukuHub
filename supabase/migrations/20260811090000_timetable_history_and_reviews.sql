create table if not exists public.timetable_histories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  display_name text not null,
  department text not null,
  major text not null default '',
  admission_year integer not null check (admission_year between 1950 and 2100),
  academic_year integer not null check (academic_year between 1950 and 2100),
  student_year_label text not null,
  track_label text not null,
  earned_units numeric not null default 0,
  share_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timetable_history_courses (
  id uuid primary key default gen_random_uuid(),
  history_id uuid not null references public.timetable_histories(id) on delete cascade,
  course_code text not null,
  course_name text not null,
  credits numeric not null default 0,
  grade text check (grade in ('A+', 'A', 'B', 'C', 'D', 'P', 'F', '認', '履修中')),
  academic_year integer not null check (academic_year between 1950 and 2100),
  semester text not null default '',
  schedule text not null default '',
  instructor text,
  category text not null default 'unknown',
  module_key text not null check (module_key in ('springA', 'springB', 'springC', 'fallA', 'fallB', 'fallC', 'other')),
  day_of_week text check (day_of_week in ('月', '火', '水', '木', '金')),
  period integer check (period between 1 and 6),
  special_type text check (special_type in ('intensive', 'consultation', 'anytime', 'nt')),
  created_at timestamptz not null default now()
);

create table if not exists public.class_reviews (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  rating integer not null check (rating between 1 and 5),
  lecture_format text,
  test_format text,
  difficulty text,
  workload text,
  attendance text,
  past_exam text,
  comment text check (char_length(coalesce(comment, '')) <= 1000),
  anonymous boolean not null default true,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_code, user_id)
);

create index if not exists timetable_histories_public_idx on public.timetable_histories(share_public, created_at desc);
create index if not exists timetable_histories_owner_idx on public.timetable_histories(owner_id, created_at desc);
create index if not exists timetable_history_courses_history_idx on public.timetable_history_courses(history_id);
create index if not exists timetable_history_courses_course_idx on public.timetable_history_courses(course_code);
create index if not exists timetable_history_courses_module_idx on public.timetable_history_courses(module_key, day_of_week, period);
create index if not exists class_reviews_course_idx on public.class_reviews(course_code, created_at desc);
create index if not exists class_reviews_user_idx on public.class_reviews(user_id, created_at desc);

drop trigger if exists timetable_histories_set_updated_at on public.timetable_histories;
create trigger timetable_histories_set_updated_at before update on public.timetable_histories
for each row execute function public.set_updated_at();

drop trigger if exists class_reviews_set_updated_at on public.class_reviews;
create trigger class_reviews_set_updated_at before update on public.class_reviews
for each row execute function public.set_updated_at();

alter table public.timetable_histories enable row level security;
alter table public.timetable_history_courses enable row level security;
alter table public.class_reviews enable row level security;

drop policy if exists "public or owner timetable histories are readable" on public.timetable_histories;
create policy "public or owner timetable histories are readable" on public.timetable_histories
for select using (share_public = true or owner_id = auth.uid() or public.is_admin());

drop policy if exists "students create own timetable histories" on public.timetable_histories;
create policy "students create own timetable histories" on public.timetable_histories
for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "students update own timetable histories" on public.timetable_histories;
create policy "students update own timetable histories" on public.timetable_histories
for update to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "students delete own timetable histories" on public.timetable_histories;
create policy "students delete own timetable histories" on public.timetable_histories
for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "public or owner timetable courses are readable" on public.timetable_history_courses;
create policy "public or owner timetable courses are readable" on public.timetable_history_courses
for select using (
  exists (
    select 1
    from public.timetable_histories histories
    where histories.id = timetable_history_courses.history_id
      and (histories.share_public = true or histories.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "students create courses for own histories" on public.timetable_history_courses;
create policy "students create courses for own histories" on public.timetable_history_courses
for insert to authenticated with check (
  exists (
    select 1
    from public.timetable_histories histories
    where histories.id = timetable_history_courses.history_id
      and histories.owner_id = auth.uid()
  )
);

drop policy if exists "students delete courses for own histories" on public.timetable_history_courses;
create policy "students delete courses for own histories" on public.timetable_history_courses
for delete to authenticated using (
  exists (
    select 1
    from public.timetable_histories histories
    where histories.id = timetable_history_courses.history_id
      and (histories.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "published class reviews are public" on public.class_reviews;
create policy "published class reviews are public" on public.class_reviews
for select using (status = 'published' or user_id = auth.uid() or public.is_admin());

drop policy if exists "students create own class reviews" on public.class_reviews;
create policy "students create own class reviews" on public.class_reviews
for insert to authenticated with check (user_id = auth.uid() and status = 'published');

drop policy if exists "students update own class reviews" on public.class_reviews;
create policy "students update own class reviews" on public.class_reviews
for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "students delete own class reviews" on public.class_reviews;
create policy "students delete own class reviews" on public.class_reviews
for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create or replace view public.course_learning_stats
with (security_invoker = true)
as
select
  courses.course_code,
  count(*) filter (where courses.grade is not null) as sample_count,
  count(*) filter (where courses.grade in ('A+', 'A', 'B', 'C', 'P', '認')) as passed_count,
  count(*) filter (where courses.grade = 'A+') as a_plus_count,
  count(*) filter (where courses.grade = 'A') as a_count,
  count(*) filter (where courses.grade = 'B') as b_count,
  count(*) filter (where courses.grade = 'C') as c_count,
  count(*) filter (where courses.grade = 'D') as d_count,
  count(*) filter (where courses.grade = 'F') as f_count,
  count(*) filter (where courses.grade = 'P') as p_count,
  count(*) filter (where courses.grade = '認') as recognized_count
from public.timetable_history_courses courses
join public.timetable_histories histories on histories.id = courses.history_id
where histories.share_public = true
group by courses.course_code;

grant select on public.timetable_histories, public.timetable_history_courses, public.class_reviews, public.course_learning_stats to anon, authenticated;
grant insert, update, delete on public.timetable_histories, public.class_reviews to authenticated;
grant insert, delete on public.timetable_history_courses to authenticated;
