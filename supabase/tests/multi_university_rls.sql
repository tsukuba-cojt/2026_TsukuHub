\set ON_ERROR_STOP on

begin;

do $$
begin
  perform public.assert_signup_allowed('s0000001@u.tsukuba.ac.jp', 'tsukuba');

  begin
    perform public.assert_signup_allowed('student@ecs.osaka-u.ac.jp', 'osaka');
    raise exception 'Osaka public signup unexpectedly succeeded';
  exception when sqlstate '42501' then
    if sqlerrm <> 'university_signup_disabled' then raise; end if;
  end;

  perform public.assert_signup_allowed('u867137d@ecs.osaka-u.ac.jp', 'osaka');
  perform public.assert_signup_allowed('u867137d@ecs.osaka-u.ac.jp', null);

  begin
    perform public.assert_signup_allowed('u867137d@ecs.osaka-u.ac.jp', 'missing');
    raise exception 'Unknown university unexpectedly succeeded';
  exception when sqlstate '22023' then
    if sqlerrm <> 'invalid_university' then raise; end if;
  end;

  begin
    update public.universities set slug = 'changed' where slug = 'tsukuba';
    raise exception 'University slug unexpectedly changed';
  exception when sqlstate '22023' then
    if sqlerrm <> 'university_slug_is_immutable' then raise; end if;
  end;
end;
$$;

-- Create rollback-only users for each access class.
update public.universities set signup_enabled = true where slug = 'osaka';
insert into public.university_email_domains (university_id, domain)
values ('00000000-0000-4000-8000-000000000002', 'test.osaka-u.ac.jp');
insert into public.platform_admin_allowlist (email) values ('rls-admin@example.test');

insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at)
values
  ('10000000-0000-4000-8000-000000000001', 'rls-test@u.tsukuba.ac.jp', '{"university_slug":"tsukuba","name":"RLS Tsukuba"}', '{}', 'authenticated', 'authenticated', now(), now()),
  ('10000000-0000-4000-8000-000000000002', 'rls-test@test.osaka-u.ac.jp', '{"university_slug":"osaka","name":"RLS Osaka"}', '{}', 'authenticated', 'authenticated', now(), now()),
  ('10000000-0000-4000-8000-000000000003', 'rls-admin@example.test', '{"university_slug":"osaka","name":"RLS Admin"}', '{}', 'authenticated', 'authenticated', now(), now());

insert into public.news_items (id, kind, category, title, description, published_at, status)
values
  ('20000000-0000-4000-8000-000000000001', 'news', 'test', 'Tsukuba-only test', '', current_date, 'published'),
  ('20000000-0000-4000-8000-000000000002', 'news', 'test', 'Osaka-only test', '', current_date, 'published');
insert into public.news_item_universities (news_item_id, university_id)
values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002');

do $$
begin
  if not has_table_privilege('anon', 'public.universities', 'select') then
    raise exception 'Anonymous role cannot select university portal settings';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$
begin
  if public.current_user_university_id() <> '00000000-0000-4000-8000-000000000001' then
    raise exception 'Tsukuba profile university mismatch';
  end if;
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'Tsukuba user can read another profile';
  end if;
  if (select count(*) from public.news_items where id in (
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002'
  )) <> 1 then
    raise exception 'Tsukuba news isolation failed';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$
begin
  if (select count(*) from public.news_items where id in (
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002'
  )) <> 1 then
    raise exception 'Osaka news isolation failed';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
do $$
begin
  if not public.is_global_admin() then raise exception 'Allowlisted user is not global admin'; end if;
  if (select count(*) from public.news_items where id in (
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002'
  )) <> 2 then
    raise exception 'Global admin cannot read all universities';
  end if;
end;
$$;

reset role;
rollback;

\echo 'multi_university_rls: ok'
