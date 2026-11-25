-- Run with: supabase db query --linked --file supabase/tests/cafeteria_menu.sql
-- All fixtures and publications are rolled back.
begin;
insert into public.cafeteria_staff_access(university_id,cafeteria_id,email)
select university_id,cafeteria_id,'cafeteria-test@example.invalid'
from public.cafeteria_locations where cafeteria_id in ('area1-tsukuba-table','area3-suzuya');
insert into auth.users(id,email,raw_user_meta_data,email_confirmed_at,aud,role)
values ('fcafe000-0000-4000-8000-000000000001','cafeteria-test@example.invalid','{"university_slug":"tsukuba","name":"Test"}',now(),'authenticated','authenticated');
select set_config('request.jwt.claims','{"sub":"fcafe000-0000-4000-8000-000000000001","email":"cafeteria-test@example.invalid","role":"authenticated"}',true);
set local role authenticated;
do $$
declare school uuid; initial_time timestamptz; next_time timestamptz; test_date date := (now() at time zone 'Asia/Tokyo')::date + 89;
begin
  select distinct university_id into strict school from public.cafeteria_staff_access where email = 'cafeteria-test@example.invalid';
  if not public.can_manage_cafeteria(school,'area1-tsukuba-table') then raise exception 'Assigned cafeteria rejected'; end if;
  if public.can_manage_cafeteria(school,'area1-soup-factory') then raise exception 'Other cafeteria allowed'; end if;
  begin
    perform public.publish_cafeteria_menu(school,'area1-soup-factory',test_date,'[{"name":"test","price":500,"sold_out":false}]',null);
    raise exception 'Unauthorized publish allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.publish_cafeteria_menu(school,'area1-tsukuba-table',test_date,'[{"name":"test","price":-1,"sold_out":false}]',null);
    raise exception 'Invalid price allowed' using errcode = 'XX000';
  exception when raise_exception then null; end;
  initial_time := public.publish_cafeteria_menu(school,'area1-tsukuba-table',test_date,'[{"name":"test","price":500,"sold_out":false}]',null);
  begin
    perform public.publish_cafeteria_menu(school,'area1-tsukuba-table',test_date,'[{"name":"test","price":600,"sold_out":false}]',null);
    raise exception 'Stale write allowed';
  exception when serialization_failure then null; end;
  next_time := public.publish_cafeteria_menu(school,'area1-tsukuba-table',test_date,'[{"name":"test","price":600,"sold_out":true}]',initial_time);
  if not exists(select 1 from public.cafeteria_menu_publications where university_id=school and cafeteria_id='area1-tsukuba-table' and menu_date=test_date and updated_at=next_time and items->0->>'sold_out'='true') then raise exception 'Menu not saved'; end if;
  begin
    perform public.publish_cafeteria_menus(jsonb_build_array(
      jsonb_build_object('university_id', school,'cafeteria_id','area1-tsukuba-table','expected_updated_at',next_time),
      jsonb_build_object('university_id', school,'cafeteria_id','zz-unassigned','expected_updated_at',null)
    ),test_date,'[{"name":"must rollback","price":700,"sold_out":false}]');
    raise exception 'Unauthorized batch allowed';
  exception when insufficient_privilege then null; end;
  if exists(select 1 from public.cafeteria_menu_publications where university_id=school and cafeteria_id='area1-tsukuba-table' and menu_date=test_date and updated_at <> next_time) then raise exception 'Partial batch write persisted'; end if;
  perform public.publish_cafeteria_menus(jsonb_build_array(
    jsonb_build_object('university_id', school,'cafeteria_id','area1-tsukuba-table','expected_updated_at',next_time),
    jsonb_build_object('university_id', school,'cafeteria_id','area3-suzuya','expected_updated_at',null)
  ),test_date,'[{"name":"batch","price":700,"sold_out":false}]');
  if (select count(*) from public.cafeteria_menu_publications where university_id=school and menu_date=test_date and items->0->>'name'='batch') <> 2 then raise exception 'Batch publish did not update both cafeterias'; end if;
  begin
    delete from public.cafeteria_menu_publications where university_id=school;
    raise exception 'Direct delete allowed';
  exception when insufficient_privilege then null; end;
end;
$$;
rollback;
