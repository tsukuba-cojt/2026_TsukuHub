create or replace function public.list_published_career_articles_for_university(target_university_id uuid)
returns setof public.career_articles
language sql
stable
security definer
set search_path = public
as $$
  select articles.*
  from public.career_articles articles
  where articles.status = 'published'
    and exists (
      select 1
      from public.career_article_universities targets
      where targets.career_article_id = articles.id
        and targets.university_id = target_university_id
    )
  order by articles.published_at desc, articles.created_at desc;
$$;

create or replace function public.get_published_career_article_for_university(
  target_id uuid,
  target_university_id uuid
)
returns public.career_articles
language sql
stable
security definer
set search_path = public
as $$
  select articles.*
  from public.career_articles articles
  where articles.id = target_id
    and articles.status = 'published'
    and exists (
      select 1
      from public.career_article_universities targets
      where targets.career_article_id = articles.id
        and targets.university_id = target_university_id
    );
$$;

create or replace function public.admin_list_career_articles()
returns setof public.career_articles
language sql
stable
security definer
set search_path = public
as $$
  select articles.*
  from public.career_articles articles
  where public.is_global_admin()
  order by articles.created_at desc;
$$;

create or replace function public.admin_list_career_article_universities()
returns table(career_article_id uuid, university_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select targets.career_article_id, targets.university_id
  from public.career_article_universities targets
  where public.is_global_admin();
$$;

revoke all on function public.admin_list_career_articles() from public;
revoke all on function public.admin_list_career_article_universities() from public;
grant execute on function public.admin_list_career_articles() to authenticated;
grant execute on function public.admin_list_career_article_universities() to authenticated;

revoke all on function public.list_published_career_articles_for_university(uuid) from public;
revoke all on function public.get_published_career_article_for_university(uuid, uuid) from public;
grant execute on function public.list_published_career_articles_for_university(uuid) to anon, authenticated;
grant execute on function public.get_published_career_article_for_university(uuid, uuid) to anon, authenticated;

-- Undo a previous all-rows Osaka mapping, then copy Tsukuba targets only.
delete from public.career_article_universities osaka
where osaka.university_id = '00000000-0000-4000-8000-000000000002'
  and not exists (
    select 1
    from public.career_article_universities tsukuba
    where tsukuba.career_article_id = osaka.career_article_id
      and tsukuba.university_id = '00000000-0000-4000-8000-000000000001'
  );

insert into public.career_article_universities (career_article_id, university_id)
select targets.career_article_id, '00000000-0000-4000-8000-000000000002'::uuid
from public.career_article_universities targets
where targets.university_id = '00000000-0000-4000-8000-000000000001'::uuid
on conflict do nothing;
