create table if not exists public.internship_recruiter_contacts (
  internship_id uuid primary key references public.internships(id) on delete cascade,
  email text not null default '' check (char_length(email) <= 254)
);

alter table public.internship_recruiter_contacts enable row level security;

drop policy if exists "global admins manage recruiter contacts" on public.internship_recruiter_contacts;
create policy "global admins manage recruiter contacts"
  on public.internship_recruiter_contacts for all to authenticated
  using (public.is_global_admin())
  with check (public.is_global_admin());

revoke all on public.internship_recruiter_contacts from anon;
grant select, insert, update, delete on public.internship_recruiter_contacts to authenticated;
