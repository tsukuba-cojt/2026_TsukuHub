-- Keep previously selected articles when consolidating the picker into topics.
insert into public.news_item_universities (news_item_id, university_id)
select topic.id, targets.university_id
from public.news_items news
join public.news_items topic on topic.source_path = news.source_path and topic.kind = 'topic'
join public.news_item_universities targets on targets.news_item_id = news.id
where news.kind = 'news' and news.source_path is not null
on conflict do nothing;

update public.news_items topic set status = 'published'
from public.news_items news
where topic.kind = 'topic' and news.kind = 'news'
  and topic.source_path = news.source_path and news.status = 'published';

delete from public.news_items news
using public.news_items topic
where news.kind = 'news' and topic.kind = 'topic'
  and news.source_path = topic.source_path;

update public.news_items set kind = 'topic'
where kind = 'news' and source_path is not null;
