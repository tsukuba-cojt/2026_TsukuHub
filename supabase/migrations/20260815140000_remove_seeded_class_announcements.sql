-- Remove placeholder class announcements inserted by the local seed.
delete from public.class_announcements
where created_by is null
  and title in (
    '夏学期の履修登録期間について',
    '2026年度 履修の手引きを公開しました',
    'システムメンテナンスのお知らせ'
  );
