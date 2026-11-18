alter table public.internships
  add column if not exists cover_image_url text;

alter table public.alumni_stories
  add column if not exists cover_image_url text;

update public.internships
set
  company_name = case
    when company_name like 'ダミー %' then company_name
    else 'ダミー ' || regexp_replace(company_name, '（サンプル）$', '')
  end,
  title = case
    when title like 'ダミー｜%' then title
    else 'ダミー｜' || title
  end,
  cover_image_url = case title
    when '研究とプロダクトをつなぐWebエンジニア' then '/data/dummy/dummy-internship-engineer.jpg'
    when 'ダミー｜研究とプロダクトをつなぐWebエンジニア' then '/data/dummy/dummy-internship-engineer.jpg'
    when '新規事業を支える法人営業インターン' then '/data/dummy/dummy-internship-sales.jpg'
    when 'ダミー｜新規事業を支える法人営業インターン' then '/data/dummy/dummy-internship-sales.jpg'
    when 'データから企画するSNSマーケター' then '/data/dummy/dummy-internship-marketing.jpg'
    when 'ダミー｜データから企画するSNSマーケター' then '/data/dummy/dummy-internship-marketing.jpg'
    else cover_image_url
  end,
  is_featured = true
where title in (
  '研究とプロダクトをつなぐWebエンジニア',
  'ダミー｜研究とプロダクトをつなぐWebエンジニア',
  '新規事業を支える法人営業インターン',
  'ダミー｜新規事業を支える法人営業インターン',
  'データから企画するSNSマーケター',
  'ダミー｜データから企画するSNSマーケター'
);

insert into public.internships (
  company_name, cover_image_url, title, summary, company_description, job_category, location,
  work_style, is_remote, work_conditions, compensation, description,
  requirements, preferred_skills, acquirable_skills, selection_process,
  tags, deadline, status, is_featured
)
select
  'ダミー キャンパスデザイン室',
  '/data/dummy/dummy-internship-marketing.jpg',
  'ダミー｜サービスの見た目をつくるUIデザイナー',
  '学生向けサービスの画面設計と改善を担当します。',
  '学びの体験をデザインするサンプル企業です。',
  'デザイン', 'つくば市・オンライン', 'ハイブリッド', true, '週2日以上', '時給1,250円〜',
  'ワイヤー作成、UI改善、ユーザーテストの記録を行います。',
  'FigmaやCanvaなど、何らかのデザインツールに触れたことがある方', 'Figma、デザインシステム', 'UI設計、ユーザー調査、チーム共有',
  'ポートフォリオ確認 → 面談', array['ポートフォリオ歓迎','リモート可'], now() + interval '28 days', 'published', false
where not exists (
  select 1 from public.internships where title = 'ダミー｜サービスの見た目をつくるUIデザイナー'
);

update public.alumni_stories
set
  title = case
    when title like 'ダミー｜%' then title
    else 'ダミー｜' || title
  end,
  cover_image_url = case title
    when '研究と開発経験を、自分の言葉で結び直した就活' then '/data/dummy/dummy-alumni-engineer.jpg'
    when 'ダミー｜研究と開発経験を、自分の言葉で結び直した就活' then '/data/dummy/dummy-alumni-engineer.jpg'
    when '興味の広さを、課題解決という軸にまとめた' then '/data/dummy/dummy-alumni-consultant.jpg'
    when 'ダミー｜興味の広さを、課題解決という軸にまとめた' then '/data/dummy/dummy-alumni-consultant.jpg'
    else cover_image_url
  end
where title in (
  '研究と開発経験を、自分の言葉で結び直した就活',
  'ダミー｜研究と開発経験を、自分の言葉で結び直した就活',
  '興味の広さを、課題解決という軸にまとめた',
  'ダミー｜興味の広さを、課題解決という軸にまとめた'
);

insert into public.alumni_stories (
  university_id, graduation_year, faculty, destination, job_role, title, summary, tags, started_at,
  target_industries, challenge, actions, advice, current_work, cover_image_url, status
)
select
  '00000000-0000-4000-8000-000000000001',
  2023, '人文・文化学群', '教育業界', '教材企画',
  'ダミー｜教える仕事ではなく、学び方を設計する仕事を選んだ',
  '教員志望から、教材と体験設計の仕事へ進路を広げた体験記です。',
  array['教育','自己分析'], '学部3年の秋', '教育、出版',
  '「先生以外の教育の仕事」が見えにくかったこと',
  '教育系スタートアップの説明会と、卒業生訪問を重ねて仕事内容を分解しました。',
  '職種名より先に、一日の仕事を聞いてみてください。',
  '学習アプリの教材企画',
  '/data/dummy/dummy-alumni-consultant.jpg',
  'published'
where not exists (
  select 1 from public.alumni_stories
  where title = 'ダミー｜教える仕事ではなく、学び方を設計する仕事を選んだ'
);

insert into public.alumni_stories (
  university_id, graduation_year, faculty, destination, job_role, title, summary, tags, started_at,
  target_industries, challenge, actions, advice, current_work, cover_image_url, status
)
select
  '00000000-0000-4000-8000-000000000001',
  2025, '理工学群', '研究職・メーカー', '研究開発',
  'ダミー｜研究室の問いを、企業の研究開発に翻訳した',
  '研究を続けるか就職するか迷った末に、企業の研究開発を選んだ体験記です。',
  array['研究','メーカー'], '修士1年の冬', 'メーカー、研究機関',
  '研究テーマの専門性を、面接でどう話すか',
  '学会発表の資料を、課題・仮説・検証の順に書き直しました。',
  '専門用語を減らして、相手が判断できる粒度まで落とすと伝わります。',
  '材料評価の研究開発',
  '/data/dummy/dummy-alumni-engineer.jpg',
  'published'
where not exists (
  select 1 from public.alumni_stories
  where title = 'ダミー｜研究室の問いを、企業の研究開発に翻訳した'
);

insert into public.internship_universities (internship_id, university_id)
select internships.id, '00000000-0000-4000-8000-000000000001'
from public.internships
where not exists (
  select 1
  from public.internship_universities targets
  where targets.internship_id = internships.id
    and targets.university_id = '00000000-0000-4000-8000-000000000001'
);
