-- Run with psql against a migrated local/test database. All fixtures roll back.
\set ON_ERROR_STOP on
begin;

insert into public.internships (id, company_name, title, summary, company_description,
  job_category, location, work_style, work_conditions, compensation, description,
  requirements, selection_process, deadline)
values
  ('91000000-0000-4000-8000-000000000001', 'Company A', 'Job A', '', '', '', '', '', '', '', '', '', '', now() + interval '1 month'),
  ('91000000-0000-4000-8000-000000000002', 'Company B', 'Job B', '', '', '', '', '', '', '', '', '', '', now() + interval '1 month');
insert into public.company_recruiter_access (internship_id, email) values
  ('91000000-0000-4000-8000-000000000001', 'company-a@example.test'),
  ('91000000-0000-4000-8000-000000000002', 'company-b@example.test'),
  ('91000000-0000-4000-8000-000000000001', 'unverified@example.test');

-- Invitation accepts company email, while uninvited signups still fail.
select public.assert_signup_allowed('company-a@example.test', null);
select public.assert_signup_allowed('company-regression@u.tsukuba.ac.jp', 'tsukuba');
do $$ begin
  begin
    perform public.assert_signup_allowed('outsider@example.test', null);
    raise exception 'uninvited signup succeeded';
  exception when sqlstate '22023' then null;
  end;
  begin
    perform public.assert_signup_allowed('company-a@example.test', 'tsukuba');
    raise exception 'company invitation bypassed student email restriction';
  exception when insufficient_privilege then null;
  end;
end $$;

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at) values
  ('92000000-0000-4000-8000-000000000001', 'company-a@example.test', now(), '{}', '{}', 'authenticated', 'authenticated', now(), now()),
  ('92000000-0000-4000-8000-000000000002', 'company-b@example.test', now(), '{}', '{}', 'authenticated', 'authenticated', now(), now()),
  ('92000000-0000-4000-8000-000000000003', 'unverified@example.test', null, '{}', '{}', 'authenticated', 'authenticated', now(), now());
do $$ begin
  if exists (select 1 from public.profiles where id::text like '92000000-%') then
    raise exception 'company signup unexpectedly created student access';
  end if;
end $$;

insert into public.applications (id, internship_id, user_id, university_id, applicant_name, email,
  faculty, graduation_year, motivation, skills, admin_notes)
values
  ('93000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Student A', 'student-a@example.test', 'Faculty', 2028, 'Motivation A', 'Skills A', 'Private admin note'),
  ('93000000-0000-4000-8000-000000000002', '91000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Student B', 'student-b@example.test', 'Faculty', 2028, 'Motivation B', 'Skills B', 'Private admin note');

set local role authenticated;
select set_config('request.jwt.claim.sub', '92000000-0000-4000-8000-000000000001', true);
do $$ declare application jsonb; begin
  if public.is_global_admin() then raise exception 'company gained administrator access'; end if;
  if (select count(*) from public.company_list_jobs()) <> 1 then raise exception 'job isolation failed'; end if;
  if (select count(*) from public.company_list_applications()) <> 1 then raise exception 'application isolation failed'; end if;
  select * into application from public.company_list_applications('93000000-0000-4000-8000-000000000001');
  if application->>'motivation' <> 'Motivation A' or application ? 'admin_notes' then raise exception 'incorrect application projection'; end if;
  if exists (select 1 from public.company_list_applications('93000000-0000-4000-8000-000000000002')) then raise exception 'foreign ID leaked information'; end if;
  perform public.company_update_application('93000000-0000-4000-8000-000000000001', 'interview');
  if (select value->>'status' from public.company_list_applications() value) <> 'interview' then raise exception 'status update failed'; end if;
  begin
    perform public.company_update_application('93000000-0000-4000-8000-000000000002', 'accepted');
    raise exception 'foreign application update succeeded';
  exception when insufficient_privilege then null; end;
  begin
    perform public.company_update_application('93000000-0000-4000-8000-000000000001', 'withdrawn');
    raise exception 'company withdrew application';
  exception when invalid_parameter_value then null; end;
  if exists (select 1 from public.company_recruiter_access) then raise exception 'company can read grants'; end if;
  begin
    insert into public.company_recruiter_access values ('91000000-0000-4000-8000-000000000002', 'company-a@example.test', now());
    raise exception 'company self-granted access';
  exception when insufficient_privilege then null; end;
end $$;

-- Shared private reviews, activity logs and optimistic concurrency.
do $$ declare saved jsonb; updated jsonb; count_before integer; begin
  saved := public.company_save_application_review(
    '93000000-0000-4000-8000-000000000001', 'Private recruiter note', true,
    'Contact applicant', '2026-11-16', '2026-11-17T01:00:00Z', 'https://example.com/meeting', null);
  if saved->>'notes' <> 'Private recruiter note' then raise exception 'review was not saved'; end if;
  if (select value->'review'->>'notes' from public.company_list_applications() value) <> 'Private recruiter note' then raise exception 'review was not projected'; end if;
  if not exists(select 1 from public.company_list_application_activity('93000000-0000-4000-8000-000000000001') value where value->>'event_type' = 'status_changed') then raise exception 'status history missing'; end if;
  select count(*) into count_before from public.company_list_application_activity('93000000-0000-4000-8000-000000000001');
  perform public.company_save_application_review(
    '93000000-0000-4000-8000-000000000001', 'Private recruiter note', true,
    'Contact applicant', '2026-11-16', '2026-11-17T01:00:00Z', 'https://example.com/meeting', (saved->>'updated_at')::timestamptz);
  if (select count(*) from public.company_list_application_activity('93000000-0000-4000-8000-000000000001')) <> count_before then raise exception 'no-op save duplicated history'; end if;
  begin
    perform public.company_save_application_review('93000000-0000-4000-8000-000000000001', 'Overwrite', false, '', null, null, '', null);
    raise exception 'stale review overwrote a newer one';
  exception when sqlstate 'PT409' then null; end;
  begin
    perform public.company_save_application_review('93000000-0000-4000-8000-000000000002', 'Foreign note', false, '', null, null, '', null);
    raise exception 'foreign review write succeeded';
  exception when insufficient_privilege then null; end;
  begin
    perform public.company_save_application_review('93000000-0000-4000-8000-000000000001', '', false, '', null, null, 'javascript:alert(1)', (saved->>'updated_at')::timestamptz);
    raise exception 'unsafe meeting URL was accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.company_save_application_review('93000000-0000-4000-8000-000000000001', repeat('x',5001), false, '', null, null, '', (saved->>'updated_at')::timestamptz);
    raise exception 'oversized note was accepted';
  exception when invalid_parameter_value then null; end;
  updated := public.company_save_application_review('93000000-0000-4000-8000-000000000001', 'Updated note', false, '', null, null, '', (saved->>'updated_at')::timestamptz);
  if updated->>'notes' <> 'Updated note' or updated->>'interview_at' is not null then raise exception 'review update/clearing failed'; end if;
  begin
    perform 1 from public.company_application_reviews;
    raise exception 'private review table was directly readable';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '92000000-0000-4000-8000-000000000002', true);
do $$ begin
  if exists (select 1 from public.company_list_application_activity('93000000-0000-4000-8000-000000000001')) then raise exception 'foreign history leaked'; end if;
  if exists (select 1 from public.company_list_applications('93000000-0000-4000-8000-000000000001')) then raise exception 'foreign review leaked'; end if;
end $$;

select set_config('request.jwt.claim.sub', '92000000-0000-4000-8000-000000000003', true);
do $$ begin
  if exists (select 1 from public.company_list_jobs()) or exists (select 1 from public.company_list_applications()) then raise exception 'unverified email gained access'; end if;
  begin
    perform public.company_update_application('93000000-0000-4000-8000-000000000001', 'accepted');
    raise exception 'unverified account updated application';
  exception when insufficient_privilege then null; end;
  begin
    perform public.company_save_application_review('93000000-0000-4000-8000-000000000001', '', false, '', null, null, '', null);
    raise exception 'unverified account saved a review';
  exception when insufficient_privilege then null; end;
  if exists (select 1 from public.company_list_application_activity('93000000-0000-4000-8000-000000000001')) then raise exception 'unverified account read history'; end if;
end $$;

reset role;
update public.applications set status = 'withdrawn' where id = '93000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '92000000-0000-4000-8000-000000000001', true);
do $$ begin
  begin
    perform public.company_update_application('93000000-0000-4000-8000-000000000001', 'accepted');
    raise exception 'withdrawn application was reopened';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
delete from public.company_recruiter_access where email = 'company-a@example.test';
set local role authenticated;
do $$ begin
  if exists (select 1 from public.company_list_applications()) then raise exception 'revoked access still works'; end if;
  if exists (select 1 from public.company_list_application_activity('93000000-0000-4000-8000-000000000001')) then raise exception 'revoked history access still works'; end if;
  begin
    perform public.company_save_application_review('93000000-0000-4000-8000-000000000001', '', false, '', null, null, '', null);
    raise exception 'revoked review access still works';
  exception when insufficient_privilege then null; end;
  begin
    perform public.company_update_application('93000000-0000-4000-8000-000000000001', 'accepted');
    raise exception 'revoked update succeeded';
  exception when insufficient_privilege then null; end;
end $$;

set local role anon;
do $$ begin
  begin
    perform public.company_list_applications();
    raise exception 'anonymous access succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
