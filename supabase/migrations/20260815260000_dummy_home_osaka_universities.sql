-- Expose dummy home topics/news on Osaka University as well.
insert into public.news_item_universities (news_item_id, university_id)
select items.id, '00000000-0000-4000-8000-000000000002'
from public.news_items items
where items.title like 'ダミー｜%'
  and not exists (
    select 1
    from public.news_item_universities targets
    where targets.news_item_id = items.id
      and targets.university_id = '00000000-0000-4000-8000-000000000002'
  );
