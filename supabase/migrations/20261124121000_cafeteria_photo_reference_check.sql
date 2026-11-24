create function public.is_cafeteria_photo_unused(p_path text)
returns boolean language sql stable security definer set search_path=public as $$
  select not exists(select 1 from public.cafeteria_menu_photos where photo_path=p_path);
$$;
revoke all on function public.is_cafeteria_photo_unused(text) from public,anon;
grant execute on function public.is_cafeteria_photo_unused(text) to authenticated;
alter policy "staff delete unused cafeteria photos" on storage.objects using (
  bucket_id='cafeteria-menus' and (storage.foldername(name))[1]=auth.uid()::text
  and public.is_cafeteria_photo_unused(name)
);
