-- Preserve existing recruiter addresses in the private contact table.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'internships' and column_name = 'company_contact_email'
  ) then
    execute $copy$
      insert into public.internship_recruiter_contacts (internship_id, email)
      select id, trim(company_contact_email) from public.internships
      where nullif(trim(company_contact_email), '') is not null
      on conflict (internship_id) do nothing
    $copy$;
  end if;
end;
$$;

create table if not exists public.application_email_notifications (
  application_id uuid primary key references public.applications(id) on delete cascade,
  resend_id text not null,
  sent_at timestamptz not null default now()
);
alter table public.application_email_notifications enable row level security;
revoke all on public.application_email_notifications from anon, authenticated;
grant all on public.application_email_notifications to service_role;
