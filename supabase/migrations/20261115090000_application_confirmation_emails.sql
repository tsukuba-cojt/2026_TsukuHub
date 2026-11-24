-- Track applicant confirmations independently from recruiter notifications.
create table public.application_confirmation_emails (
  application_id uuid primary key references public.applications(id) on delete cascade,
  resend_id text not null,
  sent_at timestamptz not null default now()
);
alter table public.application_confirmation_emails enable row level security;
revoke all on public.application_confirmation_emails from anon, authenticated;
grant all on public.application_confirmation_emails to service_role;
