alter table public.internships
  add column if not exists company_mission text not null default '',
  add column if not exists company_business text not null default '',
  add column if not exists company_message_to_students text not null default '';

update public.internships
set company_business = company_description
where company_business = '' and company_description <> '';

update public.internships set
  company_mission = '教育領域の課題を技術で解決する',
  company_business = '学習支援プロダクトの企画・開発・改善を行うサンプル企業です。',
  company_message_to_students = '研究と開発をつなぎたい学生と、一緒にプロダクトを良くしていきたいです。'
where company_name = 'ダミー つくばテックラボ';

update public.internships set
  company_mission = '地域企業の新規事業を支援する',
  company_business = '顧客の課題を聞き、提案づくりから商談まで伴走するサンプル企業です。',
  company_message_to_students = '人と話すことが好きで、自分から動ける学生を歓迎します。'
where company_name = 'ダミー 未来営業デザイン';

update public.internships set
  company_mission = '若者向けサービスの成長をデータで支える',
  company_business = 'SNS運用とコンテンツ企画を支援するサンプル企業です。',
  company_message_to_students = '発信を分析して、次の企画まで考えてみたい学生と働きたいです。'
where company_name = 'ダミー ブルームマーケティング';

update public.internships set
  company_mission = '学びの体験をデザインする',
  company_business = '学生向けサービスの画面設計と改善を行うサンプル企業です。',
  company_message_to_students = '見た目だけでなく、使いやすさまで考えたい学生を待っています。'
where company_name = 'ダミー キャンパスデザイン室';
