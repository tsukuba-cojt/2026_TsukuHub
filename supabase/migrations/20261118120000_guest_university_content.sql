begin;

create function public.is_public_university_feature(target_university uuid, target_feature text)
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists (
    select 1 from public.university_features f
    join public.universities u on u.id = f.university_id
    where u.id = target_university and u.status = 'active'
      and f.feature_key = target_feature and f.status = 'enabled'
  );
$$;

-- Replace any default table-level SELECT grants with explicit public columns.
revoke select on public.internships, public.career_articles, public.news_items,
  public.class_guide_articles, public.alumni_stories, public.class_announcements,
  public.internship_universities, public.career_article_universities,
  public.news_item_universities, public.class_guide_article_universities from anon;

grant select (id, company_name, company_logo_url, cover_image_url, title, summary, job_category, location, work_style, is_remote, compensation, tags, deadline, is_featured, created_at, status) on public.internships to anon;
grant select (internship_id, university_id) on public.internship_universities to anon;
create policy "guests read active university targets" on public.internship_universities
for select to anon using (public.is_public_university_feature(university_id, 'internships'));
create policy "guests read published content" on public.internships
for select to anon using (
  status = 'published' and exists (
    select 1 from public.internship_universities t where t.internship_id = internships.id
  )
);

grant select (id, category, title, description, content, published_at, read_minutes, status, source_type, external_url, created_at, updated_at) on public.career_articles to anon;
grant select (career_article_id, university_id) on public.career_article_universities to anon;
create policy "guests read active university targets" on public.career_article_universities
for select to anon using (public.is_public_university_feature(university_id, 'career_articles'));
create policy "guests read published content" on public.career_articles
for select to anon using (
  status = 'published' and exists (
    select 1 from public.career_article_universities t where t.career_article_id = career_articles.id
  )
);

grant select (id, kind, category, title, description, published_at, status, created_at, updated_at) on public.news_items to anon;
grant select (news_item_id, university_id) on public.news_item_universities to anon;
create policy "guests read active university targets" on public.news_item_universities
for select to anon using (public.is_public_university_feature(university_id, 'news'));
create policy "guests read published content" on public.news_items
for select to anon using (
  status = 'published' and exists (
    select 1 from public.news_item_universities t where t.news_item_id = news_items.id
  )
);

grant select (id, category, title, description, badge_label, cover_theme, cover_image_url, content, read_minutes, sort_order, published_at, status, created_at, updated_at) on public.class_guide_articles to anon;
grant select (article_id, university_id) on public.class_guide_article_universities to anon;
create policy "guests read active university targets" on public.class_guide_article_universities
for select to anon using (public.is_public_university_feature(university_id, 'courses'));
create policy "guests read published content" on public.class_guide_articles
for select to anon using (
  status = 'published' and exists (
    select 1 from public.class_guide_article_universities t where t.article_id = class_guide_articles.id
  )
);

grant select (id, university_id, graduation_year, faculty, destination, job_role, title, summary, tags, started_at, target_industries, challenge, actions, advice, current_work, cover_image_url, status, created_at, updated_at) on public.alumni_stories to anon;
create policy "guests read published content" on public.alumni_stories
for select to anon using (
  status = 'published' and public.is_public_university_feature(university_id, 'alumni_stories')
);

grant select (id, university_id, category, title, content, published_at, status, created_at, updated_at) on public.class_announcements to anon;
create policy "guests read published content" on public.class_announcements
for select to anon using (
  status = 'published' and public.is_public_university_feature(university_id, 'courses')
);

-- These views omit student identifiers and only expose published reviews
-- and aggregate grade counts. The timetable RPC retains its own access check.
create function public.can_read_course_insights(target_university uuid, target_feature text)
returns boolean language sql stable security definer set search_path = '' as $$
  select case when auth.uid() is null
    then public.is_public_university_feature(target_university, target_feature)
    else public.can_access_university(target_university)
  end;
$$;

create or replace view public.public_class_reviews
with (security_invoker = false, security_barrier = true)
as
select
  id,
  university_id,
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
where status = 'published'
  and public.can_read_course_insights(university_id, 'class_reviews');

create or replace view public.course_learning_stats
with (security_invoker = false, security_barrier = true)
as
with distinct_courses as (
  select distinct
    histories.id as history_id,
    histories.university_id,
    courses.course_code,
    courses.grade
  from public.timetable_history_courses courses
  join public.timetable_histories histories on histories.id = courses.history_id
  where histories.share_public = true
    and courses.grade is not null
    and public.can_read_course_insights(histories.university_id, 'courses')
)
select
  university_id,
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
from distinct_courses
group by university_id, course_code
having count(*) >= 10;

grant select on public.public_class_reviews, public.course_learning_stats to anon;
revoke execute on function public.list_public_timetable_histories(uuid, integer) from anon, public;

commit;
