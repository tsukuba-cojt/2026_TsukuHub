alter table public.applications
  add column if not exists phone text not null default '';

grant select (phone) on public.applications to authenticated;
grant insert (phone) on public.applications to authenticated;
