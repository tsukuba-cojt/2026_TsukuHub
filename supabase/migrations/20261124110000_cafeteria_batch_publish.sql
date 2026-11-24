create function public.publish_cafeteria_menus(p_targets jsonb, p_menu_date date, p_items jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare target jsonb; saved_time timestamptz; results jsonb := '[]'::jsonb;
begin
  if p_targets is null or jsonb_typeof(p_targets) <> 'array' then raise exception '担当学食を選択してください'; end if;
  if jsonb_array_length(p_targets) not between 1 and 100 then raise exception '担当学食を選択してください'; end if;
  if exists(select 1 from jsonb_array_elements(p_targets) value
    group by value->>'university_id', value->>'cafeteria_id' having count(*) > 1)
    then raise exception '担当学食が重複しています'; end if;
  -- Consistent lock ordering avoids deadlocks. Any failure rolls back every target.
  for target in select value from jsonb_array_elements(p_targets)
    order by value->>'university_id', value->>'cafeteria_id'
  loop
    saved_time := public.publish_cafeteria_menu(
      (target->>'university_id')::uuid, target->>'cafeteria_id', p_menu_date, p_items,
      (target->>'expected_updated_at')::timestamptz
    );
    results := results || jsonb_build_array(jsonb_build_object(
      'university_id', target->>'university_id', 'cafeteria_id', target->>'cafeteria_id', 'updated_at', saved_time
    ));
  end loop;
  return results;
end;
$$;
revoke all on function public.publish_cafeteria_menus(jsonb,date,jsonb) from public, anon;
grant execute on function public.publish_cafeteria_menus(jsonb,date,jsonb) to authenticated;
