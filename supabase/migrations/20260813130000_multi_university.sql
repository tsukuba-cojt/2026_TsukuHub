-- Multi-university foundation for TsukuHub.
-- Existing records are preserved and assigned to University of Tsukuba.

begin;

create extension if not exists pgcrypto;

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z][a-z0-9-]*$'),
  name text not null,
  short_name text not null,
  tagline text not null default '',
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'suspended')),
  signup_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.university_email_domains (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  domain text not null check (domain = lower(domain) and domain !~ '[@[:space:]]'),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (university_id, domain)
);

create table if not exists public.university_features (
  university_id uuid not null references public.universities(id) on delete cascade,
  feature_key text not null check (feature_key in (
    'news', 'career_articles', 'internships', 'alumni_stories',
    'courses', 'class_reviews', 'graduation_checker', 'timetable'
  )),
  status text not null default 'coming_soon' check (status in ('enabled', 'coming_soon')),
  updated_at timestamptz not null default now(),
  primary key (university_id, feature_key)
);

create table if not exists public.platform_admin_allowlist (
  email text primary key check (email = lower(email)),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.universities (
  id, slug, name, short_name, tagline, description, status, signup_enabled
) values
  (
    '00000000-0000-4000-8000-000000000001',
    'tsukuba',
    '筑波大学',
    '筑波大',
    '筑波大生のためのキャンパス情報ポータル',
    '授業、履修、キャリアなど、筑波大生に必要な情報をまとめて確認できます。',
    'active',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'osaka',
    '大阪大学',
    '阪大',
    '大阪大生のためのキャンパス情報ポータル',
    'キャリア、インターン、卒業生の体験記など、大阪大生向けの情報を確認できます。',
    'active',
    false
  )
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  tagline = excluded.tagline,
  description = excluded.description;

insert into public.university_email_domains (university_id, domain, enabled)
values
  ('00000000-0000-4000-8000-000000000001', 'u.tsukuba.ac.jp', true),
  ('00000000-0000-4000-8000-000000000002', 'ecs.osaka-u.ac.jp', true)
on conflict (university_id, domain) do update set enabled = excluded.enabled;

insert into public.platform_admin_allowlist (email, enabled) values
  ('u867137d@ecs.osaka-u.ac.jp', true),
  ('s2412438@u.tsukuba.ac.jp', true)
on conflict (email) do update set enabled = excluded.enabled;

with feature_defaults(feature_key) as (
  values
    ('news'), ('career_articles'), ('internships'), ('alumni_stories'),
    ('courses'), ('class_reviews'), ('graduation_checker'), ('timetable')
)
insert into public.university_features (university_id, feature_key, status)
select
  universities.id,
  feature_defaults.feature_key,
  case
    when universities.slug = 'tsukuba' then 'enabled'
    when feature_defaults.feature_key in ('news', 'career_articles', 'internships', 'alumni_stories') then 'enabled'
    else 'coming_soon'
  end
from public.universities universities
cross join feature_defaults
where universities.slug in ('tsukuba', 'osaka')
on conflict (university_id, feature_key) do update set status = excluded.status;

drop trigger if exists universities_set_updated_at on public.universities;
create trigger universities_set_updated_at before update on public.universities
for each row execute function public.set_updated_at();

create or replace function public.prevent_university_slug_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.slug is distinct from old.slug then
    raise exception 'university_slug_is_immutable' using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists universities_immutable_slug on public.universities;
create trigger universities_immutable_slug
before update of slug on public.universities
for each row execute function public.prevent_university_slug_change();

-- Identity and authorization helpers.
alter table public.profiles add column if not exists university_id uuid references public.universities(id);

update public.profiles
set university_id = '00000000-0000-4000-8000-000000000001'
where university_id is null;

alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'global_admin' where role = 'admin';
alter table public.profiles
  add constraint profiles_role_check check (role in ('student', 'global_admin'));
alter table public.profiles drop constraint if exists profiles_student_university_check;
alter table public.profiles
  add constraint profiles_student_university_check check (
    role = 'global_admin' or university_id is not null
  );

create or replace function public.current_user_university_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select university_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_global_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'global_admin'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_global_admin();
$$;

create or replace function public.can_access_university(target_university_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    public.is_global_admin()
    or public.current_user_university_id() = target_university_id
  );
$$;

revoke all on function public.current_user_university_id() from public;
revoke all on function public.is_global_admin() from public;
revoke all on function public.can_access_university(uuid) from public;
grant execute on function public.current_user_university_id() to authenticated;
grant execute on function public.is_global_admin() to authenticated;
grant execute on function public.can_access_university(uuid) to authenticated;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_global_admin() then
    if tg_op = 'INSERT' and (new.role <> 'student' or new.university_id is null) then
      raise exception 'profile_privilege_escalation_not_allowed' using errcode = '42501';
    end if;
    if tg_op = 'UPDATE' and (
      new.role is distinct from old.role
      or new.university_id is distinct from old.university_id
    ) then
      raise exception 'profile_privilege_escalation_not_allowed' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
before insert or update of role, university_id on public.profiles
for each row execute function public.protect_profile_role();

create or replace function public.assert_signup_allowed(request_email text, requested_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(coalesce(request_email, '')));
  normalized_slug text := lower(trim(coalesce(requested_slug, '')));
  target_university public.universities%rowtype;
  allowlisted boolean;
begin
  select exists (
    select 1 from public.platform_admin_allowlist
    where email = normalized_email and enabled
  ) into allowlisted;

  -- Allowlisted platform-only administrators may intentionally have no university.
  if allowlisted and normalized_slug = '' then
    return;
  end if;

  select * into target_university
  from public.universities
  where slug = normalized_slug;

  if target_university.id is null then
    raise exception 'invalid_university' using errcode = '22023';
  end if;
  if target_university.status <> 'active' then
    raise exception 'university_suspended' using errcode = '42501';
  end if;
  if allowlisted then
    return;
  end if;
  if not target_university.signup_enabled then
    raise exception 'university_signup_disabled' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.university_email_domains domains
    where domains.university_id = target_university.id
      and domains.enabled
      and domains.domain = split_part(normalized_email, '@', 2)
  ) then
    raise exception 'email_domain_not_allowed' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.hook_restrict_signup_by_university(event jsonb)
returns jsonb
language plpgsql
set search_path = public
as $$
begin
  perform public.assert_signup_allowed(
    event->'user'->>'email',
    event->'user'->'user_metadata'->>'university_slug'
  );
  return '{}'::jsonb;
exception
  when others then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', sqlerrm
      )
    );
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_restrict_signup_by_university(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_restrict_signup_by_university(jsonb) from anon, authenticated, public;
revoke execute on function public.assert_signup_allowed(text, text) from anon, authenticated, public;

-- The trigger gives local development and direct Auth API calls the same protection.
create or replace function public.validate_auth_user_university()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_signup_allowed(
    new.email,
    new.raw_user_meta_data->>'university_slug'
  );
  return new;
end;
$$;

drop trigger if exists validate_auth_user_university on auth.users;
create trigger validate_auth_user_university
before insert on auth.users
for each row execute function public.validate_auth_user_university();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_university_id uuid;
  next_role text := 'student';
begin
  select id into requested_university_id
  from public.universities
  where slug = lower(new.raw_user_meta_data->>'university_slug');

  if exists (
    select 1 from public.platform_admin_allowlist
    where email = lower(new.email) and enabled
  ) then
    next_role := 'global_admin';
  end if;

  insert into public.profiles (
    id, name, grade, major, category, university_id, role
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    case
      when new.raw_user_meta_data->>'grade' ~ '^[0-9]+$'
        then (new.raw_user_meta_data->>'grade')::integer
      else null
    end,
    coalesce(new.raw_user_meta_data->>'major', ''),
    coalesce(new.raw_user_meta_data->>'category', ''),
    requested_university_id,
    next_role
  )
  on conflict (id) do update set
    university_id = coalesce(public.profiles.university_id, excluded.university_id),
    role = case
      when excluded.role = 'global_admin' then 'global_admin'
      else public.profiles.role
    end;

  return new;
end;
$$;

-- University ownership for university-specific records.
alter table public.courses add column if not exists university_id uuid references public.universities(id);
alter table public.alumni_stories add column if not exists university_id uuid references public.universities(id);
alter table public.class_announcements add column if not exists university_id uuid references public.universities(id);
alter table public.class_reviews add column if not exists university_id uuid references public.universities(id);
alter table public.review_reports add column if not exists university_id uuid references public.universities(id);
alter table public.timetable_histories add column if not exists university_id uuid references public.universities(id);
alter table public.applications add column if not exists university_id uuid references public.universities(id);

update public.courses set university_id = '00000000-0000-4000-8000-000000000001' where university_id is null;
update public.alumni_stories set university_id = '00000000-0000-4000-8000-000000000001' where university_id is null;
update public.class_announcements set university_id = '00000000-0000-4000-8000-000000000001' where university_id is null;
update public.class_reviews set university_id = '00000000-0000-4000-8000-000000000001' where university_id is null;
update public.review_reports set university_id = '00000000-0000-4000-8000-000000000001' where university_id is null;
update public.timetable_histories set university_id = '00000000-0000-4000-8000-000000000001' where university_id is null;
update public.applications set university_id = '00000000-0000-4000-8000-000000000001' where university_id is null;

alter table public.courses alter column university_id set not null;
alter table public.alumni_stories alter column university_id set not null;
alter table public.class_announcements alter column university_id set not null;
alter table public.class_reviews alter column university_id set not null;
alter table public.review_reports alter column university_id set not null;
alter table public.timetable_histories alter column university_id set not null;
alter table public.applications alter column university_id set not null;

alter table public.class_reviews alter column university_id set default public.current_user_university_id();
alter table public.review_reports alter column university_id set default public.current_user_university_id();
alter table public.timetable_histories alter column university_id set default public.current_user_university_id();
alter table public.applications alter column university_id set default public.current_user_university_id();

create index if not exists courses_university_number_idx on public.courses(university_id, course_number);
create index if not exists alumni_stories_university_status_idx on public.alumni_stories(university_id, status, graduation_year desc);
create index if not exists class_announcements_university_status_idx on public.class_announcements(university_id, status, published_at desc);
create index if not exists class_reviews_university_course_idx on public.class_reviews(university_id, course_code, created_at desc);
create index if not exists timetable_histories_university_idx on public.timetable_histories(university_id, created_at desc);
create index if not exists applications_university_idx on public.applications(university_id, created_at desc);

-- Shared content and target universities.
create table if not exists public.internship_universities (
  internship_id uuid not null references public.internships(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (internship_id, university_id)
);

create table if not exists public.career_article_universities (
  career_article_id uuid not null references public.career_articles(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (career_article_id, university_id)
);

alter table public.career_articles add column if not exists source_type text not null default 'internal'
  check (source_type in ('internal', 'external'));
alter table public.career_articles add column if not exists external_url text;

create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('news', 'topic')),
  category text not null,
  title text not null,
  description text not null default '',
  published_at date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_item_universities (
  news_item_id uuid not null references public.news_items(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (news_item_id, university_id)
);

drop trigger if exists news_items_set_updated_at on public.news_items;
create trigger news_items_set_updated_at before update on public.news_items
for each row execute function public.set_updated_at();

insert into public.internship_universities (internship_id, university_id)
select id, '00000000-0000-4000-8000-000000000001' from public.internships
on conflict do nothing;

insert into public.career_article_universities (career_article_id, university_id)
select id, '00000000-0000-4000-8000-000000000001' from public.career_articles
on conflict do nothing;

with note_articles(title, external_url) as (
  values
    ('就活・長期インターンの基礎知識', 'https://note.com/embed/notes/n9d23f6f78b8e'),
    ('キャリア・就活に関するnote記事 1', 'https://note.com/embed/notes/n249800e92c19'),
    ('キャリア・就活に関するnote記事 2', 'https://note.com/embed/notes/ndac6a2ffd3b6')
)
insert into public.career_articles (
  category, title, description, content, published_at, read_minutes,
  status, source_type, external_url
)
select '就活準備', title, title, '', current_date, 5, 'published', 'external', external_url
from note_articles
where not exists (
  select 1 from public.career_articles existing
  where existing.external_url = note_articles.external_url
);

insert into public.career_article_universities (career_article_id, university_id)
select id, '00000000-0000-4000-8000-000000000001'
from public.career_articles
where source_type = 'external'
on conflict do nothing;

with seeded(kind, category, title, description, published_at) as (
  values
    ('topic', '就活・キャリア', '【6/9（月）】夏インターンの探し方と選考対策ガイド', '', date '2026-05-10'),
    ('topic', '授業・履修', '春Aにとるべきおすすめ授業【学類別】', '', date '2026-05-12'),
    ('topic', 'サークル・課外活動', '2026年度 新歓情報', '', date '2026-04-30'),
    ('topic', '生活・便利情報', '一人暮らし始め方完全ガイド', '', date '2026-04-10'),
    ('news', '就活・キャリア', '【締切間近】大手IT企業 サマーインターン募集開始！', '', date '2026-05-12'),
    ('news', 'イベント', '中高生合同　交流会のお知らせ', '', date '2026-05-11'),
    ('news', 'サークル・課外活動', '軽音サークルライブ開催決定！', '', date '2026-05-11'),
    ('news', '授業・履修', '「統計学入門」の資料を追加しました', '', date '2026-05-09')
)
insert into public.news_items (kind, category, title, description, published_at, status)
select kind, category, title, description, published_at, 'published'
from seeded
where not exists (
  select 1 from public.news_items existing
  where existing.kind = seeded.kind and existing.title = seeded.title
);

insert into public.news_item_universities (news_item_id, university_id)
select id, '00000000-0000-4000-8000-000000000001'
from public.news_items
on conflict do nothing;

-- RLS for university configuration.
alter table public.universities enable row level security;
alter table public.university_email_domains enable row level security;
alter table public.university_features enable row level security;
alter table public.platform_admin_allowlist enable row level security;
alter table public.internship_universities enable row level security;
alter table public.career_article_universities enable row level security;
alter table public.news_items enable row level security;
alter table public.news_item_universities enable row level security;

drop policy if exists "universities are publicly readable" on public.universities;
create policy "universities are publicly readable" on public.universities for select using (true);
drop policy if exists "global admins manage universities" on public.universities;
create policy "global admins manage universities" on public.universities
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "email domains are publicly readable" on public.university_email_domains;
create policy "email domains are publicly readable" on public.university_email_domains for select using (true);
drop policy if exists "global admins manage email domains" on public.university_email_domains;
create policy "global admins manage email domains" on public.university_email_domains
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "features are publicly readable" on public.university_features;
create policy "features are publicly readable" on public.university_features for select using (true);
drop policy if exists "global admins manage features" on public.university_features;
create policy "global admins manage features" on public.university_features
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "global admins manage allowlist" on public.platform_admin_allowlist;
create policy "global admins manage allowlist" on public.platform_admin_allowlist
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

alter table public.profiles enable row level security;
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_global_admin());
drop policy if exists "global admins manage profiles" on public.profiles;
create policy "global admins manage profiles" on public.profiles
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

grant select on public.universities, public.university_email_domains, public.university_features to anon, authenticated;
grant insert, update on public.universities, public.university_email_domains, public.university_features to authenticated;
grant select, insert, update on public.platform_admin_allowlist to authenticated;

-- Replace public content policies with university-aware authenticated access.
drop policy if exists "published internships are public" on public.internships;
drop policy if exists "admins read all internships" on public.internships;
drop policy if exists "admins create internships" on public.internships;
drop policy if exists "admins update internships" on public.internships;
drop policy if exists "admins delete internships" on public.internships;
create policy "university users read targeted internships" on public.internships
for select to authenticated using (
  public.is_global_admin()
  or (
    status = 'published'
    and exists (
      select 1 from public.internship_universities targets
      where targets.internship_id = internships.id
        and targets.university_id = public.current_user_university_id()
    )
  )
);
create policy "global admins manage internships" on public.internships
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "read accessible internship targets" on public.internship_universities;
create policy "read accessible internship targets" on public.internship_universities
for select to authenticated using (public.can_access_university(university_id));
create policy "global admins manage internship targets" on public.internship_universities
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "published career articles are public" on public.career_articles;
drop policy if exists "admins manage career articles" on public.career_articles;
create policy "university users read targeted career articles" on public.career_articles
for select to authenticated using (
  public.is_global_admin()
  or (
    status = 'published'
    and exists (
      select 1 from public.career_article_universities targets
      where targets.career_article_id = career_articles.id
        and targets.university_id = public.current_user_university_id()
    )
  )
);
create policy "global admins manage career articles" on public.career_articles
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

create policy "read accessible career article targets" on public.career_article_universities
for select to authenticated using (public.can_access_university(university_id));
create policy "global admins manage career article targets" on public.career_article_universities
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

create policy "university users read targeted news" on public.news_items
for select to authenticated using (
  public.is_global_admin()
  or (
    status = 'published'
    and exists (
      select 1 from public.news_item_universities targets
      where targets.news_item_id = news_items.id
        and targets.university_id = public.current_user_university_id()
    )
  )
);
create policy "global admins manage news" on public.news_items
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy "read accessible news targets" on public.news_item_universities
for select to authenticated using (public.can_access_university(university_id));
create policy "global admins manage news targets" on public.news_item_universities
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "published alumni stories are public" on public.alumni_stories;
drop policy if exists "admins manage alumni stories" on public.alumni_stories;
create policy "university users read alumni stories" on public.alumni_stories
for select to authenticated using (
  public.can_access_university(university_id)
  and (status = 'published' or public.is_global_admin())
);
create policy "global admins manage alumni stories" on public.alumni_stories
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "published class announcements are public" on public.class_announcements;
drop policy if exists "admins manage class announcements" on public.class_announcements;
create policy "university users read class announcements" on public.class_announcements
for select to authenticated using (
  public.can_access_university(university_id)
  and (status = 'published' or public.is_global_admin())
);
create policy "global admins manage class announcements" on public.class_announcements
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "courses are readable" on public.courses;
create policy "university users read courses" on public.courses
for select to authenticated using (public.can_access_university(university_id));

drop policy if exists "owner class reviews are readable" on public.class_reviews;
drop policy if exists "students create own class reviews" on public.class_reviews;
drop policy if exists "students update own class reviews" on public.class_reviews;
drop policy if exists "students delete own class reviews" on public.class_reviews;
create policy "owners and admins read class reviews" on public.class_reviews
for select to authenticated using (user_id = auth.uid() or public.is_global_admin());
create policy "students create university reviews" on public.class_reviews
for insert to authenticated with check (
  user_id = auth.uid()
  and university_id = public.current_user_university_id()
  and status = 'published'
);
create policy "owners update class reviews" on public.class_reviews
for update to authenticated
using (user_id = auth.uid() or public.is_global_admin())
with check (
  public.is_global_admin()
  or (user_id = auth.uid() and university_id = public.current_user_university_id())
);
create policy "owners delete class reviews" on public.class_reviews
for delete to authenticated using (user_id = auth.uid() or public.is_global_admin());

drop policy if exists "students create review reports" on public.review_reports;
drop policy if exists "admins manage review reports" on public.review_reports;
create policy "students create university review reports" on public.review_reports
for insert to authenticated with check (
  reporter_id = auth.uid()
  and university_id = public.current_user_university_id()
  and status = 'pending'
  and admin_notes is null
);
create policy "global admins manage review reports" on public.review_reports
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "owner timetable histories are readable" on public.timetable_histories;
drop policy if exists "students create own timetable histories" on public.timetable_histories;
drop policy if exists "students update own timetable histories" on public.timetable_histories;
drop policy if exists "students delete own timetable histories" on public.timetable_histories;
create policy "owners and admins read timetable histories" on public.timetable_histories
for select to authenticated using (owner_id = auth.uid() or public.is_global_admin());
create policy "students create university timetable histories" on public.timetable_histories
for insert to authenticated with check (
  owner_id = auth.uid() and university_id = public.current_user_university_id()
);
create policy "owners update timetable histories" on public.timetable_histories
for update to authenticated
using (owner_id = auth.uid() or public.is_global_admin())
with check (
  public.is_global_admin()
  or (owner_id = auth.uid() and university_id = public.current_user_university_id())
);
create policy "owners delete timetable histories" on public.timetable_histories
for delete to authenticated using (owner_id = auth.uid() or public.is_global_admin());

drop policy if exists "owner timetable courses are readable" on public.timetable_history_courses;
drop policy if exists "students create courses for own histories" on public.timetable_history_courses;
drop policy if exists "students delete courses for own histories" on public.timetable_history_courses;
create policy "owners and admins read timetable courses" on public.timetable_history_courses
for select to authenticated using (
  exists (
    select 1 from public.timetable_histories histories
    where histories.id = timetable_history_courses.history_id
      and (histories.owner_id = auth.uid() or public.is_global_admin())
  )
);
create policy "students create own timetable courses" on public.timetable_history_courses
for insert to authenticated with check (
  exists (
    select 1 from public.timetable_histories histories
    where histories.id = timetable_history_courses.history_id
      and histories.owner_id = auth.uid()
      and histories.university_id = public.current_user_university_id()
  )
);
create policy "owners delete timetable courses" on public.timetable_history_courses
for delete to authenticated using (
  exists (
    select 1 from public.timetable_histories histories
    where histories.id = timetable_history_courses.history_id
      and (histories.owner_id = auth.uid() or public.is_global_admin())
  )
);

drop policy if exists "students read own applications" on public.applications;
drop policy if exists "students apply to open internships" on public.applications;
create policy "students read own applications" on public.applications
for select to authenticated using (user_id = auth.uid());
create policy "students apply to targeted internships" on public.applications
for insert to authenticated with check (
  user_id = auth.uid()
  and university_id = public.current_user_university_id()
  and status = 'submitted'
  and admin_notes is null
  and exists (
    select 1
    from public.internships internships
    join public.internship_universities targets on targets.internship_id = internships.id
    where internships.id = applications.internship_id
      and targets.university_id = applications.university_id
      and internships.status = 'published'
      and internships.deadline >= now()
  )
);

-- Authenticated-only safe views and RPCs.
drop view if exists public.public_class_reviews;
create or replace view public.public_class_reviews
with (security_invoker = false)
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
  and public.can_access_university(university_id);

revoke all on public.public_class_reviews from anon, authenticated;
grant select on public.public_class_reviews to authenticated;

drop view if exists public.course_learning_stats;
create or replace view public.course_learning_stats
with (security_invoker = false)
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
    and public.can_access_university(histories.university_id)
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

revoke all on public.course_learning_stats from anon, authenticated;
grant select on public.course_learning_stats to authenticated;

drop function if exists public.list_public_timetable_histories(integer);
create or replace function public.list_public_timetable_histories(
  target_university_id uuid,
  max_count integer default 48
)
returns table (
  history_id uuid,
  university_id uuid,
  display_name text,
  department text,
  major text,
  admission_year integer,
  academic_year integer,
  student_year_label text,
  track_label text,
  earned_units numeric,
  share_public boolean,
  history_created_at timestamptz,
  course_row_id uuid,
  course_code text,
  course_name text,
  credits numeric,
  course_academic_year integer,
  semester text,
  schedule text,
  instructor text,
  category text,
  module_key text,
  day_of_week text,
  period integer,
  special_type text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_access_university(target_university_id) then
    raise exception 'university_access_denied' using errcode = '42501';
  end if;

  return query
  with latest_histories as (
    select histories.*
    from public.timetable_histories histories
    where histories.share_public = true
      and histories.university_id = target_university_id
    order by histories.created_at desc
    limit least(greatest(coalesce(max_count, 48), 1), 100)
  )
  select
    histories.id,
    histories.university_id,
    histories.display_name,
    histories.department,
    histories.major,
    histories.admission_year,
    histories.academic_year,
    histories.student_year_label,
    histories.track_label,
    histories.earned_units,
    histories.share_public,
    histories.created_at,
    courses.id,
    courses.course_code,
    courses.course_name,
    courses.credits,
    courses.academic_year,
    courses.semester,
    courses.schedule,
    courses.instructor,
    courses.category,
    courses.module_key,
    courses.day_of_week,
    courses.period,
    courses.special_type
  from latest_histories histories
  left join public.timetable_history_courses courses on courses.history_id = histories.id
  order by histories.created_at desc, histories.id, courses.course_code;
end;
$$;

revoke all on function public.list_public_timetable_histories(uuid, integer) from public;
grant execute on function public.list_public_timetable_histories(uuid, integer) to authenticated;

-- Admin application RPCs remain global-admin-only and now expose university ownership.
create or replace function public.admin_list_applications()
returns setof jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_global_admin() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  return query
    select to_jsonb(applications) || jsonb_build_object(
      'internship', jsonb_build_object(
        'id', internships.id,
        'title', internships.title,
        'company_name', internships.company_name
      )
    )
    from public.applications applications
    join public.internships internships on internships.id = applications.internship_id
    order by applications.created_at desc;
end;
$$;

create or replace function public.admin_get_application(target_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if not public.is_global_admin() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;
  select to_jsonb(applications) || jsonb_build_object(
    'internship', jsonb_build_object(
      'id', internships.id,
      'title', internships.title,
      'company_name', internships.company_name
    )
  ) into result
  from public.applications applications
  join public.internships internships on internships.id = applications.internship_id
  where applications.id = target_id;
  return result;
end;
$$;

-- Remove anonymous access to university content; only the portal configuration stays public.
revoke select on public.internships, public.career_articles, public.alumni_stories,
  public.class_announcements, public.courses from anon;
revoke all on public.news_items, public.news_item_universities,
  public.internship_universities, public.career_article_universities from anon;

grant select, insert, update, delete on public.news_items,
  public.news_item_universities, public.internship_universities,
  public.career_article_universities to authenticated;
grant select on public.courses to authenticated;

comment on function public.hook_restrict_signup_by_university(jsonb) is
  'Configure as the Supabase Before User Created auth hook in deployed environments.';

commit;
