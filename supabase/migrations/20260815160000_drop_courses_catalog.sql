-- Course catalog now lives in year-specific static JSON
-- (public/data/courses/{slug}-{academicYear}.json).
-- Reviews and timetable rows keep course_code as text, not a foreign key.
drop table if exists public.courses cascade;
