create table public.cafeteria_menu_photos (
  university_id uuid not null,
  cafeteria_id text not null,
  menu_date date not null,
  photo_path text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (university_id,cafeteria_id,menu_date),
  foreign key (university_id,cafeteria_id) references public.cafeteria_locations on delete cascade
);
alter table public.cafeteria_menu_photos enable row level security;
revoke all on public.cafeteria_menu_photos from public, anon, authenticated;
grant select on public.cafeteria_menu_photos to authenticated;
create policy "read cafeteria menu photos" on public.cafeteria_menu_photos for select to authenticated
using (public.can_access_university(university_id) or public.can_manage_cafeteria(university_id,cafeteria_id));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('cafeteria-menus','cafeteria-menus',false,15728640,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "staff upload cafeteria photos" on storage.objects for insert to authenticated with check (
  bucket_id='cafeteria-menus' and (storage.foldername(name))[1]=auth.uid()::text
  and exists(select 1 from public.cafeteria_staff_access where email=lower(auth.jwt()->>'email'))
);
create policy "read assigned cafeteria photos" on storage.objects for select to authenticated using (
  bucket_id='cafeteria-menus' and (
    (storage.foldername(name))[1]=auth.uid()::text
    or exists(select 1 from public.cafeteria_menu_photos photo where photo.photo_path=name
      and (public.can_access_university(photo.university_id) or public.can_manage_cafeteria(photo.university_id,photo.cafeteria_id)))
  )
);
create policy "staff delete unused cafeteria photos" on storage.objects for delete to authenticated using (
  bucket_id='cafeteria-menus' and (storage.foldername(name))[1]=auth.uid()::text
  and not exists(select 1 from public.cafeteria_menu_photos photo where photo.photo_path=name)
);

create function public.publish_cafeteria_photos(p_targets jsonb,p_menu_date date,p_photo_path text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare target jsonb; old_time timestamptz; saved_time timestamptz; results jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then raise exception 'ログインしてください' using errcode='42501'; end if;
  if p_targets is null or jsonb_typeof(p_targets)<>'array' then raise exception '担当学食を選択してください'; end if;
  if jsonb_array_length(p_targets) not between 1 and 100 then raise exception '担当学食を選択してください'; end if;
  if p_menu_date is null or p_menu_date < (now() at time zone 'Asia/Tokyo')::date - 7 or p_menu_date > (now() at time zone 'Asia/Tokyo')::date + 90 then raise exception '掲載日を確認してください'; end if;
  if p_photo_path is null or split_part(p_photo_path,'/',1)<>auth.uid()::text
    or not exists(select 1 from storage.objects where bucket_id='cafeteria-menus' and name=p_photo_path)
    then raise exception 'アップロードした写真を確認してください' using errcode='42501'; end if;
  if exists(select 1 from jsonb_array_elements(p_targets) value group by value->>'university_id',value->>'cafeteria_id' having count(*)>1) then raise exception '学食が重複しています'; end if;
  for target in select value from jsonb_array_elements(p_targets) order by value->>'university_id',value->>'cafeteria_id'
  loop
    if not public.can_manage_cafeteria((target->>'university_id')::uuid,target->>'cafeteria_id') then raise exception '担当学食の更新権限がありません' using errcode='42501'; end if;
    perform pg_advisory_xact_lock(hashtextextended('photo:' || (target->>'university_id') || ':' || (target->>'cafeteria_id') || ':' || p_menu_date::text,0));
    select updated_at into old_time from public.cafeteria_menu_photos where university_id=(target->>'university_id')::uuid and cafeteria_id=target->>'cafeteria_id' and menu_date=p_menu_date;
    if old_time is distinct from (target->>'expected_updated_at')::timestamptz then raise exception '別の担当者が更新しました。再読み込みしてください' using errcode='40001'; end if;
    saved_time:=clock_timestamp();
    insert into public.cafeteria_menu_photos(university_id,cafeteria_id,menu_date,photo_path,updated_at,updated_by)
    values((target->>'university_id')::uuid,target->>'cafeteria_id',p_menu_date,p_photo_path,saved_time,auth.uid())
    on conflict(university_id,cafeteria_id,menu_date) do update set photo_path=excluded.photo_path,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
    results:=results || jsonb_build_array(jsonb_build_object('university_id',target->>'university_id','cafeteria_id',target->>'cafeteria_id','updated_at',saved_time));
  end loop;
  return results;
end;
$$;
revoke all on function public.publish_cafeteria_photos(jsonb,date,text) from public,anon;
grant execute on function public.publish_cafeteria_photos(jsonb,date,text) to authenticated;
