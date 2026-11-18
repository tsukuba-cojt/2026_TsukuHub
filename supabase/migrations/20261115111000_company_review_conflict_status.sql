-- A domain conflict must not trigger PostgREST transaction retries.
-- https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b
create or replace function public.company_save_application_review(
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
    raise exception 'review_changed_by_another_recruiter' using errcode = 'PT409';
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
