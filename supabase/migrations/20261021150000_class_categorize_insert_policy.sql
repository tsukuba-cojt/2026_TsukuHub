-- 卒業要件チェッカーは RequireUniversityAccess 配下にあり、分類回答の保存時は
-- authenticated ロールを使用する。
alter table public.class_categorize enable row level security;

grant insert on table public.class_categorize to authenticated;

drop policy if exists "authenticated users can insert class categorize"
on public.class_categorize;

create policy "authenticated users can insert class categorize"
on public.class_categorize
for insert
to authenticated
with check (true);

comment on table public.class_categorize is
'User-confirmed classifications for courses left unclassified by the graduation checker.';
