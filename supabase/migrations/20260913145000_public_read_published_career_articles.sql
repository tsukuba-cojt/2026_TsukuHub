-- Public pages read career articles via security-definer RPCs only.
drop policy if exists "published career articles are readable" on public.career_articles;
drop policy if exists "published career article targets are readable" on public.career_article_universities;

revoke select on public.career_articles from anon;
revoke all on public.career_article_universities from anon;
