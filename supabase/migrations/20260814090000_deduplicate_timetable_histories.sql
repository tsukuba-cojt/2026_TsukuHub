-- 同じユーザーが卒業要件チェックを繰り返しても、同一年度の時間割を重複公開しない。
-- 既存データは最新の更新日時を持つ1件だけ残す。子の科目行は ON DELETE CASCADE で削除される。
with ranked_histories as (
  select
    id,
    row_number() over (
      partition by owner_id, department, major, admission_year, academic_year
      order by updated_at desc, created_at desc, id desc
    ) as duplicate_rank
  from public.timetable_histories
)
delete from public.timetable_histories histories
using ranked_histories ranked
where histories.id = ranked.id
  and ranked.duplicate_rank > 1;

create unique index if not exists timetable_histories_owner_academic_year_unique
on public.timetable_histories (
  owner_id,
  department,
  major,
  admission_year,
  academic_year
);
