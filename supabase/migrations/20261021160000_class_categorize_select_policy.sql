-- 未分類科目の自動入力では、ログイン済み利用者が既存の分類回答を取得して
-- クライアント上で科目名・学類ごとに集計する。
alter table public.class_categorize enable row level security;

grant select on table public.class_categorize to authenticated;

drop policy if exists "authenticated users can read class categorize"
on public.class_categorize;

create policy "authenticated users can read class categorize"
on public.class_categorize
for select
to authenticated
using (true);
