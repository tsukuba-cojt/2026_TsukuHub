-- Reviews and activity are shared only by recruiters assigned to the same job.
create table public.company_application_reviews (
  application_id uuid primary key references public.applications(id) on delete cascade,
  notes text not null default '' check (char_length(notes) <= 5000),
  shortlisted boolean not null default false,
  next_action text not null default '' check (char_length(next_action) <= 200),
  next_action_date date,
  interview_at timestamptz,
  interview_url text not null default '' check (
    char_length(interview_url) <= 2000 and (interview_url = '' or interview_url ~ '^https?://[^[:space:]]+$')
  ),
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid references auth.users(id) on delete set null
);
create table public.company_application_activity (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type text not null check (event_type in ('status_changed', 'review_updated')),
  details jsonb not null,
  actor_email text not null,
  created_at timestamptz not null default clock_timestamp()
);
create index company_application_activity_application_idx
  on public.company_application_activity(application_id, created_at desc);
alter table public.company_application_reviews enable row level security;
alter table public.company_application_activity enable row level security;
revoke all on public.company_application_reviews, public.company_application_activity from public, anon, authenticated;
grant all on public.company_application_reviews, public.company_application_activity to service_role;

create or replace function public.company_list_applications(target_id uuid default null)
returns setof jsonb language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'id', a.id, 'internship_id', a.internship_id,
    'applicant_name', a.applicant_name, 'email', a.email, 'faculty', a.faculty,
    'graduation_year', a.graduation_year, 'motivation', a.motivation,
    'skills', a.skills, 'portfolio_url', a.portfolio_url,
    'additional_notes', a.additional_notes, 'status', a.status,
    'created_at', a.created_at, 'updated_at', a.updated_at,
    'review', case when r.application_id is null then null else jsonb_build_object(
      'notes', r.notes, 'shortlisted', r.shortlisted, 'next_action', r.next_action,
      'next_action_date', r.next_action_date, 'interview_at', r.interview_at,
      'interview_url', r.interview_url, 'updated_at', r.updated_at
    ) end,
    'internship', jsonb_build_object('id', i.id, 'title', i.title, 'company_name', i.company_name)
  )
  from public.applications a
  join public.internships i on i.id = a.internship_id
  join public.company_recruiter_access c on c.internship_id = i.id
  join auth.users u on u.id = auth.uid() and lower(u.email) = c.email
  left join public.company_application_reviews r on r.application_id = a.id
  where u.email_confirmed_at is not null and (target_id is null or a.id = target_id)
  order by a.created_at desc;
$$;

create or replace function public.company_update_application(target_id uuid, next_status text)
returns void language plpgsql security definer set search_path = public
as $$
declare previous_status text; recruiter_email text;
begin
  if next_status not in ('submitted', 'reviewing', 'interview', 'accepted', 'rejected') or next_status is null then
    raise exception 'invalid_status' using errcode = '22023';
  end if;
  select a.status, lower(u.email) into previous_status, recruiter_email
  from public.applications a
  join public.company_recruiter_access c on c.internship_id = a.internship_id
  join auth.users u on u.id = auth.uid() and lower(u.email) = c.email
  where a.id = target_id and u.email_confirmed_at is not null and a.status <> 'withdrawn'
  for update of a;
  if not found then raise exception 'application_unavailable' using errcode = '42501'; end if;
  if previous_status = next_status then return; end if;
  update public.applications set status = next_status where id = target_id;
  insert into public.company_application_activity(application_id, event_type, details, actor_email)
  values (target_id, 'status_changed', jsonb_build_object('from', previous_status, 'to', next_status), recruiter_email);
end;
$$;

create function public.company_save_application_review(
  target_id uuid, next_notes text, next_shortlisted boolean, next_action text,
  next_action_date date, next_interview_at timestamptz, next_interview_url text,
  expected_updated_at timestamptz default null
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  recruiter_email text;
  previous public.company_application_reviews%rowtype;
  saved public.company_application_reviews%rowtype;
  changed_fields text[] := '{}';
begin
  select lower(u.email) into recruiter_email
  from public.applications a
  join public.company_recruiter_access c on c.internship_id = a.internship_id
  join auth.users u on u.id = auth.uid() and lower(u.email) = c.email
  where a.id = target_id and u.email_confirmed_at is not null
  for update of a;
  if not found then raise exception 'application_unavailable' using errcode = '42501'; end if;
  if next_notes is null or next_shortlisted is null or next_action is null or next_interview_url is null
    or char_length(next_notes) > 5000 or char_length(next_action) > 200
    or char_length(next_interview_url) > 2000
    or (next_interview_url <> '' and next_interview_url !~ '^https?://[^[:space:]]+$')
  then raise exception 'invalid_review' using errcode = '22023'; end if;
  select * into previous from public.company_application_reviews where application_id = target_id;
  if previous.updated_at is distinct from expected_updated_at then
    raise exception 'review_changed_by_another_recruiter' using errcode = '40001';
  end if;
  if coalesce(previous.notes, '') <> next_notes then changed_fields := array_append(changed_fields, 'notes'); end if;
  if coalesce(previous.shortlisted, false) <> next_shortlisted then changed_fields := array_append(changed_fields, 'shortlisted'); end if;
  if coalesce(previous.next_action, '') <> next_action or previous.next_action_date is distinct from next_action_date
    then changed_fields := array_append(changed_fields, 'next_action'); end if;
  if previous.interview_at is distinct from next_interview_at or coalesce(previous.interview_url, '') <> next_interview_url
    then changed_fields := array_append(changed_fields, 'interview'); end if;
  if cardinality(changed_fields) = 0 and previous.application_id is not null then
    return to_jsonb(previous) - 'application_id' - 'updated_by';
  end if;
  insert into public.company_application_reviews(application_id, notes, shortlisted, next_action,
    next_action_date, interview_at, interview_url, updated_at, updated_by)
  values (target_id, next_notes, next_shortlisted, next_action, next_action_date,
    next_interview_at, next_interview_url, clock_timestamp(), auth.uid())
  on conflict (application_id) do update set notes = excluded.notes, shortlisted = excluded.shortlisted,
    next_action = excluded.next_action, next_action_date = excluded.next_action_date,
    interview_at = excluded.interview_at, interview_url = excluded.interview_url,
    updated_at = excluded.updated_at, updated_by = excluded.updated_by
  returning * into saved;
  if cardinality(changed_fields) > 0 then
    insert into public.company_application_activity(application_id, event_type, details, actor_email)
    values (target_id, 'review_updated', jsonb_build_object('changed_fields', changed_fields), recruiter_email);
  end if;
  return to_jsonb(saved) - 'application_id' - 'updated_by';
end;
$$;

create function public.company_list_application_activity(target_id uuid)
returns setof jsonb language sql stable security definer set search_path = public
as $$
  select jsonb_build_object('id', h.id, 'event_type', h.event_type, 'details', h.details,
    'actor_email', h.actor_email, 'created_at', h.created_at)
  from public.company_application_activity h
  join public.applications a on a.id = h.application_id
  join public.company_recruiter_access c on c.internship_id = a.internship_id
  join auth.users u on u.id = auth.uid() and lower(u.email) = c.email
  where h.application_id = target_id and u.email_confirmed_at is not null
  order by h.created_at desc, h.id;
$$;
revoke all on function public.company_save_application_review(uuid,text,boolean,text,date,timestamptz,text,timestamptz) from public, anon;
revoke all on function public.company_list_application_activity(uuid) from public, anon;
grant execute on function public.company_save_application_review(uuid,text,boolean,text,date,timestamptz,text,timestamptz) to authenticated;
grant execute on function public.company_list_application_activity(uuid) to authenticated;
