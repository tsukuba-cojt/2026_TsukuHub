-- Expose dummy career content on Osaka University as well as Tsukuba.
insert into public.internship_universities (internship_id, university_id)
select internships.id, '00000000-0000-4000-8000-000000000002'
from public.internships internships
where internships.title like 'ダミー｜%'
  and not exists (
    select 1
    from public.internship_universities targets
    where targets.internship_id = internships.id
      and targets.university_id = '00000000-0000-4000-8000-000000000002'
  );

insert into public.alumni_stories (
  university_id, graduation_year, faculty, destination, job_role, title, summary, tags, started_at,
  target_industries, challenge, actions, advice, current_work, cover_image_url, status
)
select
  '00000000-0000-4000-8000-000000000002',
  graduation_year, faculty, destination, job_role, title, summary, tags, started_at,
  target_industries, challenge, actions, advice, current_work, cover_image_url, status
from public.alumni_stories source
where source.university_id = '00000000-0000-4000-8000-000000000001'
  and source.title like 'ダミー｜%'
  and not exists (
    select 1
    from public.alumni_stories existing
    where existing.university_id = '00000000-0000-4000-8000-000000000002'
      and existing.title = source.title
  );

insert into public.class_guide_article_universities (article_id, university_id)
select articles.id, '00000000-0000-4000-8000-000000000002'
from public.class_guide_articles articles
where articles.title like 'ダミー｜%'
  and not exists (
    select 1
    from public.class_guide_article_universities targets
    where targets.article_id = articles.id
      and targets.university_id = '00000000-0000-4000-8000-000000000002'
  );
