create table if not exists public.career_articles (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  description text not null,
  content text not null default '',
  published_at date not null default current_date,
  read_minutes integer not null default 5 check (read_minutes between 1 and 120),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alumni_stories (
  id uuid primary key default gen_random_uuid(),
  graduation_year integer not null check (graduation_year between 1950 and 2100),
  faculty text not null,
  destination text not null,
  job_role text not null,
  title text not null,
  summary text not null,
  tags text[] not null default '{}',
  started_at text not null,
  target_industries text not null,
  challenge text not null,
  actions text not null,
  advice text not null,
  current_work text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_announcements (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  content text not null default '',
  published_at date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id text not null,
  course_code text not null,
  review_snapshot text not null,
  reporter_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (review_id, reporter_id)
);

create index if not exists career_articles_status_date_idx on public.career_articles(status, published_at desc);
create index if not exists alumni_stories_status_created_idx on public.alumni_stories(status, created_at desc);
create index if not exists class_announcements_status_date_idx on public.class_announcements(status, published_at desc);
create index if not exists review_reports_status_created_idx on public.review_reports(status, created_at desc);
create index if not exists review_reports_course_idx on public.review_reports(course_code);

drop trigger if exists career_articles_set_updated_at on public.career_articles;
create trigger career_articles_set_updated_at before update on public.career_articles
for each row execute function public.set_updated_at();

drop trigger if exists alumni_stories_set_updated_at on public.alumni_stories;
create trigger alumni_stories_set_updated_at before update on public.alumni_stories
for each row execute function public.set_updated_at();

drop trigger if exists class_announcements_set_updated_at on public.class_announcements;
create trigger class_announcements_set_updated_at before update on public.class_announcements
for each row execute function public.set_updated_at();

drop trigger if exists review_reports_set_updated_at on public.review_reports;
create trigger review_reports_set_updated_at before update on public.review_reports
for each row execute function public.set_updated_at();

alter table public.career_articles enable row level security;
alter table public.alumni_stories enable row level security;
alter table public.class_announcements enable row level security;
alter table public.review_reports enable row level security;

drop policy if exists "published career articles are public" on public.career_articles;
create policy "published career articles are public" on public.career_articles
for select using (status = 'published');
drop policy if exists "admins manage career articles" on public.career_articles;
create policy "admins manage career articles" on public.career_articles
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published alumni stories are public" on public.alumni_stories;
create policy "published alumni stories are public" on public.alumni_stories
for select using (status = 'published');
drop policy if exists "admins manage alumni stories" on public.alumni_stories;
create policy "admins manage alumni stories" on public.alumni_stories
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published class announcements are public" on public.class_announcements;
create policy "published class announcements are public" on public.class_announcements
for select using (status = 'published');
drop policy if exists "admins manage class announcements" on public.class_announcements;
create policy "admins manage class announcements" on public.class_announcements
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "students create review reports" on public.review_reports;
create policy "students create review reports" on public.review_reports
for insert to authenticated with check (
  reporter_id = auth.uid()
  and status = 'pending'
  and admin_notes is null
);
drop policy if exists "admins manage review reports" on public.review_reports;
create policy "admins manage review reports" on public.review_reports
for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.career_articles, public.alumni_stories, public.class_announcements to anon, authenticated;
grant insert, update, delete on public.career_articles, public.alumni_stories, public.class_announcements to authenticated;
grant select, insert, update, delete on public.review_reports to authenticated;
