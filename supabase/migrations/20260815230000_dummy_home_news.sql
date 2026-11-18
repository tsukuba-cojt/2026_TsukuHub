-- Dummy home topics and news for TsukuHub preview. Admin-created rows are untouched.
with seeded(kind, category, title, description, published_at) as (
  values
    ('topic', '就活・キャリア', 'ダミー｜【6/9（月）】夏インターンの探し方と選考対策ガイド', '就活Hubのサンプルトピックです。', date '2026-08-10'),
    ('topic', '授業・履修', 'ダミー｜春Aにとるべきおすすめ授業【学類別】', '授業Hubのサンプルトピックです。', date '2026-08-08'),
    ('topic', 'サークル・課外活動', 'ダミー｜2026年度 新歓情報', 'サークル活動のサンプルトピックです。', date '2026-08-05'),
    ('topic', '生活・便利情報', 'ダミー｜一人暮らし始め方完全ガイド', '生活情報のサンプルトピックです。', date '2026-08-01'),
    ('news', '就活・キャリア', 'ダミー｜【締切間近】大手IT企業 サマーインターン募集開始！', 'お知らせバーに表示されるサンプルです。', date '2026-08-14'),
    ('news', 'イベント', 'ダミー｜中高生合同　交流会のお知らせ', 'イベント情報のサンプルです。', date '2026-08-12'),
    ('news', 'サークル・課外活動', 'ダミー｜軽音サークルライブ開催決定！', 'サークル情報のサンプルです。', date '2026-08-11'),
    ('news', '授業・履修', 'ダミー｜「統計学入門」の資料を追加しました', '授業情報のサンプルです。', date '2026-08-09')
)
insert into public.news_items (kind, category, title, description, published_at, status)
select kind, category, title, description, published_at, 'published'
from seeded
where not exists (
  select 1 from public.news_items existing
  where existing.kind = seeded.kind
    and existing.title = seeded.title
);

insert into public.news_item_universities (news_item_id, university_id)
select items.id, '00000000-0000-4000-8000-000000000001'
from public.news_items items
where items.title like 'ダミー｜%'
  and not exists (
    select 1
    from public.news_item_universities targets
    where targets.news_item_id = items.id
      and targets.university_id = '00000000-0000-4000-8000-000000000001'
  );
