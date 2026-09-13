-- The multi-university migration adds applications.university_id, so expose
-- that column through the same student-only column privileges as the other
-- application fields.
grant select (university_id) on public.applications to authenticated;
grant insert (university_id) on public.applications to authenticated;
