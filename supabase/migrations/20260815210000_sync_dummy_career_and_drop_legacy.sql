-- Align leftover remote-only schema and dummy career listings with local.
-- Legacy tables are dropped only when empty so real user data is never removed.

drop view if exists public.reviews_with_counts;

do $$
begin
  if to_regclass('public.review_helpfuls') is not null
     and (select count(*) from public.review_helpfuls) = 0 then
    drop table public.review_helpfuls cascade;
  end if;

  if to_regclass('public.reviews') is not null
     and (select count(*) from public.reviews) = 0 then
    drop table public.reviews cascade;
  end if;

  if to_regclass('public.student_records') is not null
     and (select count(*) from public.student_records) = 0 then
    drop table public.student_records cascade;
  end if;
end $$;

insert into public.internships (
  company_name, cover_image_url, title, summary, company_description, job_category, location,
  work_style, is_remote, work_conditions, compensation, description,
  requirements, preferred_skills, acquirable_skills, selection_process,
  tags, deadline, status, is_featured
)
select
  'ダミー つくばテックラボ',
  '/data/dummy/dummy-internship-engineer.jpg',
  'ダミー｜研究とプロダクトをつなぐWebエンジニア',
  '学生チームと一緒に、学習支援プロダクトを改善します。',
  '教育領域の課題を技術で解決するサンプル企業です。',
  'エンジニア', 'つくば市・オンライン', 'ハイブリッド', true, '週2日以上・1日4時間から', '時給1,300円〜',
  'ReactとTypeScriptを使った機能開発、レビュー、ユーザー調査を行います。',
  '基本的なプログラミング経験、チームで学ぶ姿勢', 'React、TypeScript、Gitの経験', 'Web開発、チーム開発、ユーザー理解',
  '書類確認 → 面談 → 最終面談', array['未経験相談可','学生チーム'], now() + interval '45 days', 'published', true
where not exists (
  select 1 from public.internships where title = 'ダミー｜研究とプロダクトをつなぐWebエンジニア'
);

insert into public.internships (
  company_name, cover_image_url, title, summary, company_description, job_category, location,
  work_style, is_remote, work_conditions, compensation, description,
  requirements, preferred_skills, acquirable_skills, selection_process,
  tags, deadline, status, is_featured
)
select
  'ダミー 未来営業デザイン',
  '/data/dummy/dummy-internship-sales.jpg',
  'ダミー｜新規事業を支える法人営業インターン',
  '顧客の課題を聞き、提案づくりから商談まで経験します。',
  '地域企業の新規事業を支援するサンプル企業です。',
  '営業・ビジネス', '東京都・オンライン', 'ハイブリッド', true, '週3日以上', '時給1,250円〜＋交通費',
  '顧客リサーチ、提案資料作成、商談同席を担当します。',
  '人と話すことが好きで、主体的に行動できる方', '接客、プレゼンテーション経験', '課題発見、提案、法人営業',
  'カジュアル面談 → 面接', array['1・2年生歓迎','リモート可'], now() + interval '30 days', 'published', true
where not exists (
  select 1 from public.internships where title = 'ダミー｜新規事業を支える法人営業インターン'
);

insert into public.internships (
  company_name, cover_image_url, title, summary, company_description, job_category, location,
  work_style, is_remote, work_conditions, compensation, description,
  requirements, preferred_skills, acquirable_skills, selection_process,
  tags, deadline, status, is_featured
)
select
  'ダミー ブルームマーケティング',
  '/data/dummy/dummy-internship-marketing.jpg',
  'ダミー｜データから企画するSNSマーケター',
  '発信結果を分析し、次のコンテンツ企画へつなげます。',
  '若者向けサービスのマーケティングを支援するサンプル企業です。',
  'マーケティング', 'つくば市', '出社中心', false, '週2日以上', '時給1,200円〜',
  'SNS運用、数値分析、コンテンツ企画を行います。',
  '文章や企画を考えることが好きな方', 'SNS運用、デザインツールの経験', 'マーケティング分析、企画、編集',
  '課題提出 → 面接', array['企画から参加','服装自由'], now() + interval '21 days', 'published', true
where not exists (
  select 1 from public.internships where title = 'ダミー｜データから企画するSNSマーケター'
);

insert into public.alumni_stories (
  university_id, graduation_year, faculty, destination, job_role, title, summary, tags, started_at,
  target_industries, challenge, actions, advice, current_work, cover_image_url, status
)
select
  '00000000-0000-4000-8000-000000000001',
  2025, '情報学群', 'IT・SaaS業界', 'ソフトウェアエンジニア',
  'ダミー｜研究と開発経験を、自分の言葉で結び直した就活',
  '大学院進学と就職で迷いながら、自分が大切にしたい働き方を整理した体験記です。',
  array['エンジニア','長期インターン'], '学部3年の夏', 'IT、教育サービス',
  '研究内容と企業での仕事のつながりを説明すること',
  '長期インターンでチーム開発を経験し、週ごとに学びを言語化しました。',
  '周囲の速さではなく、自分が確かめたいことから行動を決めてください。',
  '学習支援プロダクトの機能開発',
  '/data/dummy/dummy-alumni-engineer.jpg',
  'published'
where not exists (
  select 1 from public.alumni_stories
  where title = 'ダミー｜研究と開発経験を、自分の言葉で結び直した就活'
);

insert into public.alumni_stories (
  university_id, graduation_year, faculty, destination, job_role, title, summary, tags, started_at,
  target_industries, challenge, actions, advice, current_work, cover_image_url, status
)
select
  '00000000-0000-4000-8000-000000000001',
  2024, '社会・国際学群', 'コンサルティング業界', 'ビジネスコンサルタント',
  'ダミー｜興味の広さを、課題解決という軸にまとめた',
  '業界を絞れない悩みから、仕事選びの軸を見つけた体験記です。',
  array['ビジネス','自己分析'], '学部3年の春', 'コンサルティング、メーカー',
  '関心のある業界が多く、志望理由がぼやけたこと',
  'OB・OG訪問のたびに仕事内容と自分の反応を記録しました。',
  '最初から一つに決めず、会った人や仕事から仮説を更新してみてください。',
  '地域企業の新規事業支援',
  '/data/dummy/dummy-alumni-consultant.jpg',
  'published'
where not exists (
  select 1 from public.alumni_stories
  where title = 'ダミー｜興味の広さを、課題解決という軸にまとめた'
);

insert into public.internship_universities (internship_id, university_id)
select internships.id, '00000000-0000-4000-8000-000000000001'
from public.internships
where internships.title like 'ダミー｜%'
  and not exists (
    select 1
    from public.internship_universities targets
    where targets.internship_id = internships.id
      and targets.university_id = '00000000-0000-4000-8000-000000000001'
  );
