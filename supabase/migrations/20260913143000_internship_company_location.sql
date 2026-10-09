alter table public.internships
  add column if not exists company_address text not null default '',
  add column if not exists company_map_url text not null default '';

update public.internships set company_address = '茨城県つくば市天王台1丁目1-1'
where company_name = 'ダミー つくばテックラボ';

update public.internships set company_address = '東京都千代田区丸の内1丁目9-2'
where company_name = 'ダミー 未来営業デザイン';

update public.internships set company_address = '茨城県つくば市研究学園5丁目19'
where company_name = 'ダミー ブルームマーケティング';

update public.internships set company_address = '茨城県つくば市吾妻1丁目8-10'
where company_name = 'ダミー キャンパスデザイン室';
