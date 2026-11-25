-- Supabase default privileges may grant table writes automatically.
revoke all on public.cafeteria_locations, public.cafeteria_staff_access, public.cafeteria_menu_publications from public, anon, authenticated;
grant select, insert, update, delete on public.cafeteria_locations, public.cafeteria_staff_access to authenticated;
grant select on public.cafeteria_menu_publications to authenticated;
