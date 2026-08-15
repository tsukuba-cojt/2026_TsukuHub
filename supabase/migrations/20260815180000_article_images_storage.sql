insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "article images are public" on storage.objects;
create policy "article images are public" on storage.objects
for select using (bucket_id = 'article-images');

drop policy if exists "admins upload article images" on storage.objects;
create policy "admins upload article images" on storage.objects
for insert to authenticated with check (bucket_id = 'article-images' and public.is_admin());

drop policy if exists "admins update article images" on storage.objects;
create policy "admins update article images" on storage.objects
for update to authenticated using (bucket_id = 'article-images' and public.is_admin());

drop policy if exists "admins delete article images" on storage.objects;
create policy "admins delete article images" on storage.objects
for delete to authenticated using (bucket_id = 'article-images' and public.is_admin());
