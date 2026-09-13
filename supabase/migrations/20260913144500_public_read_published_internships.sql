-- Public pages read internships via security-definer RPCs only.
-- Do not allow anon to select the tables directly (university targeting would leak).
drop policy if exists "published internships are readable" on public.internships;
drop policy if exists "published internship targets are readable" on public.internship_universities;

revoke select on public.internships from anon;
revoke all on public.internship_universities from anon;
