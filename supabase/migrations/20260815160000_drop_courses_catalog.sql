-- Course catalog now lives in static JSON (public/data/courses/{slug}.json).
-- Reviews and timetable rows keep course_code as text, not a foreign key.
drop table if exists public.courses cascade;
