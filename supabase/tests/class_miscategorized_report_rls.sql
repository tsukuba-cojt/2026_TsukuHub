-- INSERT用migration適用後、SQL EditorまたはローカルPostgresで実行する。
-- テストレコードは最後にすべてロールバックする。
begin;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","email":"report-test@example.com","role":"authenticated"}', true);
set local role authenticated;

-- 自分の登録メールで、科目番号が空でも保存できる。
insert into public.class_miscategorized_report
  (mail, classname, classnumber, miscategorize, suggestedcategorize)
values
  ('report-test@example.com', 'RLS test course', '', 'unclassified', 'common');

-- メールの詐称と空メールは拒否する。
do $$
declare
  invalid_mail text;
begin
  foreach invalid_mail in array array['other@example.com', '', '   '] loop
    begin
      insert into public.class_miscategorized_report
        (mail, classname, classnumber, miscategorize, suggestedcategorize)
      values
        (invalid_mail, 'RLS test course', '', 'unclassified', 'common');
      raise exception 'RLS test failed: invalid mail was accepted';
    exception when insufficient_privilege then
      null;
    end;
  end loop;
end;
$$;

reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

-- 未ログインでは保存できない。
do $$
begin
  begin
    insert into public.class_miscategorized_report
      (mail, classname, classnumber, miscategorize, suggestedcategorize)
    values
      ('report-test@example.com', 'RLS test course', '', 'unclassified', 'common');
    raise exception 'RLS test failed: anonymous insert was accepted';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

reset role;
rollback;
