-- 既存の報告テーブルに、登録メール本人によるINSERTだけを許可する。
begin;

alter table public.class_miscategorized_report enable row level security;

grant insert on table public.class_miscategorized_report to authenticated;

drop policy if exists "authenticated users can insert own miscategorized reports"
on public.class_miscategorized_report;

create policy "authenticated users can insert own miscategorized reports"
on public.class_miscategorized_report
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and nullif(btrim(mail), '') is not null
  and lower(btrim(mail)) = lower(btrim((select auth.jwt() ->> 'email')))
);

commit;
