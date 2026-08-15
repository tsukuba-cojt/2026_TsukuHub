-- Remove the placeholder topics and news that were inserted during the
-- multi-university migration. Content created from the admin screen is kept.
with seeded(kind, title, published_at) as (
  values
    ('topic', '【6/9（月）】夏インターンの探し方と選考対策ガイド', date '2026-05-10'),
    ('topic', '春Aにとるべきおすすめ授業【学類別】', date '2026-05-12'),
    ('topic', '2026年度 新歓情報', date '2026-04-30'),
    ('topic', '一人暮らし始め方完全ガイド', date '2026-04-10'),
    ('news', '【締切間近】大手IT企業 サマーインターン募集開始！', date '2026-05-12'),
    ('news', '中高生合同　交流会のお知らせ', date '2026-05-11'),
    ('news', '軽音サークルライブ開催決定！', date '2026-05-11'),
    ('news', '「統計学入門」の資料を追加しました', date '2026-05-09')
)
delete from public.news_items as item
using seeded
where item.kind = seeded.kind
  and item.title = seeded.title
  and item.published_at = seeded.published_at
  and item.created_by is null;
