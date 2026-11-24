create table public.cafeteria_locations (
  university_id uuid not null references public.universities(id) on delete cascade,
  cafeteria_id text not null,
  name text not null,
  primary key (university_id, cafeteria_id)
);
create table public.cafeteria_staff_access (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null,
  cafeteria_id text not null,
  email text not null check (email = lower(trim(email)) and position('@' in email) > 1),
  foreign key (university_id, cafeteria_id) references public.cafeteria_locations on delete cascade,
  unique (university_id, cafeteria_id, email)
);
create table public.cafeteria_menu_publications (
  university_id uuid not null,
  cafeteria_id text not null,
  menu_date date not null,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 100),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  primary key (university_id, cafeteria_id, menu_date),
  foreign key (university_id, cafeteria_id) references public.cafeteria_locations on delete cascade
);

create function public.can_manage_cafeteria(p_university_id uuid, p_cafeteria_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_global_admin() or exists (
    select 1 from public.cafeteria_staff_access
    where university_id = p_university_id and cafeteria_id = p_cafeteria_id
      and email = lower(auth.jwt()->>'email')
      and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = false
      and auth.uid() is not null
  );
$$;
revoke all on function public.can_manage_cafeteria(uuid,text) from public, anon;
grant execute on function public.can_manage_cafeteria(uuid,text) to authenticated;

alter table public.cafeteria_locations enable row level security;
alter table public.cafeteria_staff_access enable row level security;
alter table public.cafeteria_menu_publications enable row level security;
create policy "read cafeteria locations" on public.cafeteria_locations for select to authenticated
using (public.can_access_university(university_id) or public.can_manage_cafeteria(university_id, cafeteria_id));
create policy "admins manage cafeteria locations" on public.cafeteria_locations for all to authenticated
using (public.is_global_admin()) with check (public.is_global_admin());
create policy "admins manage cafeteria staff" on public.cafeteria_staff_access for all to authenticated
using (public.is_global_admin()) with check (public.is_global_admin());
create policy "staff read own assignments" on public.cafeteria_staff_access for select to authenticated
using (email = lower(auth.jwt()->>'email'));
create policy "read cafeteria menus" on public.cafeteria_menu_publications for select to authenticated
using (public.can_access_university(university_id) or public.can_manage_cafeteria(university_id, cafeteria_id));
revoke all on public.cafeteria_locations, public.cafeteria_staff_access, public.cafeteria_menu_publications from public, anon, authenticated;
grant select, insert, update, delete on public.cafeteria_locations, public.cafeteria_staff_access to authenticated;
grant select on public.cafeteria_menu_publications to authenticated;

-- Only the validated RPC can publish menus. Locking prevents concurrent overwrites.
create function public.publish_cafeteria_menu(p_university_id uuid, p_cafeteria_id text, p_menu_date date, p_items jsonb, p_expected_updated_at timestamptz default null)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare previous_time timestamptz; saved_time timestamptz;
begin
  if not public.can_manage_cafeteria(p_university_id, p_cafeteria_id) then raise exception '担当学食の更新権限がありません' using errcode = '42501'; end if;
  if p_menu_date is null or p_menu_date < (now() at time zone 'Asia/Tokyo')::date - 7 or p_menu_date > (now() at time zone 'Asia/Tokyo')::date + 90 then raise exception '掲載日を確認してください'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then raise exception 'メニュー形式が不正です'; end if;
  if jsonb_array_length(p_items) not between 1 and 100 then raise exception 'メニューは1〜100件で登録してください'; end if;
  if exists (select 1 from jsonb_array_elements(p_items) item where
    jsonb_typeof(item) <> 'object' or jsonb_typeof(item->'name') is distinct from 'string'
    or length(trim(item->>'name')) not between 1 and 120
    or jsonb_typeof(item->'price') is distinct from 'number'
    or (item->>'price') !~ '^[0-9]{1,5}$'
    or jsonb_typeof(item->'sold_out') is distinct from 'boolean'
  ) then raise exception '品名・価格・販売状態を確認してください'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_university_id::text || ':' || p_cafeteria_id || ':' || p_menu_date::text, 0));
  select updated_at into previous_time from public.cafeteria_menu_publications
  where university_id = p_university_id and cafeteria_id = p_cafeteria_id and menu_date = p_menu_date;
  if previous_time is distinct from p_expected_updated_at then raise exception '別の担当者が更新しました。再読み込みしてから変更してください' using errcode = '40001'; end if;
  saved_time := clock_timestamp();
  insert into public.cafeteria_menu_publications(university_id, cafeteria_id, menu_date, items, updated_at, updated_by)
  values (p_university_id, p_cafeteria_id, p_menu_date, p_items, saved_time, auth.uid())
  on conflict (university_id, cafeteria_id, menu_date) do update
  set items = excluded.items, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  return saved_time;
end;
$$;
revoke all on function public.publish_cafeteria_menu(uuid,text,date,jsonb,timestamptz) from public, anon;
grant execute on function public.publish_cafeteria_menu(uuid,text,date,jsonb,timestamptz) to authenticated;

-- Keep the existing student signup checks; permit only admin-approved staff emails.
alter function public.assert_signup_allowed(text,text) rename to assert_signup_allowed_before_cafeteria;
create function public.assert_signup_allowed(request_email text, requested_slug text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from public.cafeteria_staff_access staff
    join public.universities university on university.id = staff.university_id
    where staff.email = lower(trim(request_email)) and university.slug = lower(trim(requested_slug))
      and university.status = 'active'
  ) then return; end if;
  perform public.assert_signup_allowed_before_cafeteria(request_email, requested_slug);
end;
$$;
revoke all on function public.assert_signup_allowed(text,text) from public, anon, authenticated;
grant execute on function public.assert_signup_allowed(text,text) to supabase_auth_admin;

insert into public.cafeteria_locations(university_id,cafeteria_id,name)
select universities.id, locations.id, locations.name from public.universities cross join (values
('area1-tsukuba-table', '第1エリア TSUKUBA TABLE'),
('area1-soup-factory', '第1エリア スープファクトリー'),
('area1-suzuya', '第1エリア 鈴家'),
('library-starbucks', '中央図書館 スターバックス'),
('area2-cafeteria', '第2エリア 食堂'),
('area2-noodle', '第2エリア 麺処'),
('area2-marhaban', '第2エリア カフェ マルハバン'),
('area2-kona', '第2エリア 粉とクリーム'),
('area3-cafeteria', '第3エリア 食堂'),
('area3-curry', '第3エリア カレー'),
('area3-kona', '第3エリア 粉とクリーム'),
('area3-suzuya', '第3エリア 鈴家'),
('research-b-suzuya', '総合研究棟B 鈴家'),
('research-b-bento', '総合研究棟B 弁当販売'),
('taigei-cafe', '体芸エリア 喫茶'),
('taigei-bento', '体芸エリア 弁当販売'),
('taigei-bread', '体芸エリア パン販売'),
('kasuga-bento', '春日エリア 弁当販売'),
('medical-doctors-kitchen', '医学エリア Doctor''s Kitchen'),
('medical-lieben', '医学エリア リーベン'),
('medical-suzuya', '医学エリア 鈴家'),
('honbu-cafeteria', '本部棟 食堂'),
('honbu-suzuya', '本部棟 鈴家'),
('kaikan-tsukuba-demi', '大学会館 筑波デミ'),
('kitchen-car', 'キッチンカー')
) as locations(id,name) where universities.slug = 'tsukuba' on conflict do nothing;
