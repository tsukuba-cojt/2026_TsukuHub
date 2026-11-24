-- Cafeteria pages allow guests. Only published photos for active universities
-- are public; future photos, staff accounts and writes remain protected.
create function public.is_published_cafeteria_photo(p_university_id uuid,p_menu_date date)
returns boolean language sql stable security definer set search_path=public as $$
  select p_menu_date <= (now() at time zone 'Asia/Tokyo')::date
    and exists(select 1 from public.universities where id=p_university_id and status='active');
$$;
revoke all on function public.is_published_cafeteria_photo(uuid,date) from public;
grant execute on function public.is_published_cafeteria_photo(uuid,date) to anon,authenticated;
grant select(university_id,cafeteria_id,menu_date,photo_path,updated_at) on public.cafeteria_menu_photos to anon;
create policy "guests read published cafeteria photos" on public.cafeteria_menu_photos
for select to anon,authenticated
using (public.is_published_cafeteria_photo(university_id,menu_date));
create policy "guests read published cafeteria image files" on storage.objects
for select to anon,authenticated using (
  bucket_id='cafeteria-menus' and exists(
    select 1 from public.cafeteria_menu_photos photo
    where photo.photo_path=name and public.is_published_cafeteria_photo(photo.university_id,photo.menu_date)
  )
);
