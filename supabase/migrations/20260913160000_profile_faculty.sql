begin;

alter table public.profiles
  add column if not exists faculty text;

comment on column public.profiles.faculty is
  '学群・学部などの上位所属。majorには学類・研究群などの下位所属を保存する';

-- Keep the new field readable under the existing authenticated profile policy.
grant select (faculty) on public.profiles to authenticated;

-- New registrations already send school in user metadata. Persist it as the
-- profile faculty and keep the child selection in major.
update public.profiles profiles
set faculty = coalesce(nullif(profiles.faculty, ''), nullif(users.raw_user_meta_data->>'school', ''))
from auth.users users
where users.id = profiles.id
  and nullif(profiles.faculty, '') is null
  and nullif(users.raw_user_meta_data->>'school', '') is not null;

-- Older registrations stored the upper-level selection in major. Move only
-- known upper-level labels so an existing child selection is never overwritten.
update public.profiles
set faculty = major,
    major = ''
where nullif(faculty, '') is null
  and major in (
    '人文・文化学群', '社会・国際学群', '人間学群', '生命環境学群',
    '理工学群', '情報学群', '医学群', '体育専門学群', '芸術専門学群',
    '総合学域群', '人文社会ビジネス科学学術院', '理工情報生命学術院',
    '人間総合科学学術院', 'グローバル教育院', '文学部', '人間科学部',
    '外国語学部', '法学部', '経済学部', '理学部', '医学部', '歯学部',
    '薬学部', '工学部', '基礎工学部'
  );

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
    id, name, grade, faculty, major, category, university_id, role
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    case
      when new.raw_user_meta_data->>'grade' ~ '^[0-9]+$'
        then (new.raw_user_meta_data->>'grade')::integer
      else null
    end,
    coalesce(new.raw_user_meta_data->>'faculty', new.raw_user_meta_data->>'school', ''),
    coalesce(new.raw_user_meta_data->>'major', ''),
    coalesce(new.raw_user_meta_data->>'category', ''),
    requested_university_id,
    next_role
  )
  on conflict (id) do update set
    university_id = coalesce(public.profiles.university_id, excluded.university_id),
    faculty = coalesce(nullif(public.profiles.faculty, ''), excluded.faculty),
    major = coalesce(nullif(public.profiles.major, ''), excluded.major),
    role = case
      when excluded.role = 'global_admin' then 'global_admin'
      else public.profiles.role
    end;

  return new;
end;
$$;

commit;
