alter table public.news_items add column if not exists source_path text;
create unique index if not exists news_items_source_kind_unique
  on public.news_items (source_path, kind) where source_path is not null;
