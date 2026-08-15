insert into public.internships (
  company_name, cover_image_url, title, summary, company_description, job_category, location,
  work_style, is_remote, work_conditions, compensation, description,
  requirements, preferred_skills, acquirable_skills, selection_process,
  tags, deadline, status, is_featured
) values
(
  'ダミー つくばテックラボ',
  '/data/dummy/dummy-internship-engineer.jpg',
  'ダミー｜研究とプロダクトをつなぐWebエンジニア',
  '学生チームと一緒に、学習支援プロダクトを改善します。',
  '教育領域の課題を技術で解決するサンプル企業です。',
  'エンジニア', 'つくば市・オンライン', 'ハイブリッド', true, '週2日以上・1日4時間から', '時給1,300円〜',
  'ReactとTypeScriptを使った機能開発、レビュー、ユーザー調査を行います。',
  '基本的なプログラミング経験、チームで学ぶ姿勢', 'React、TypeScript、Gitの経験', 'Web開発、チーム開発、ユーザー理解',
  '書類確認 → 面談 → 最終面談', array['未経験相談可','学生チーム'], now() + interval '45 days', 'published', true
),
(
  'ダミー 未来営業デザイン',
  '/data/dummy/dummy-internship-sales.jpg',
  'ダミー｜新規事業を支える法人営業インターン',
  '顧客の課題を聞き、提案づくりから商談まで経験します。',
  '地域企業の新規事業を支援するサンプル企業です。',
  '営業・ビジネス', '東京都・オンライン', 'ハイブリッド', true, '週3日以上', '時給1,250円〜＋交通費',
  '顧客リサーチ、提案資料作成、商談同席を担当します。',
  '人と話すことが好きで、主体的に行動できる方', '接客、プレゼンテーション経験', '課題発見、提案、法人営業',
  'カジュアル面談 → 面接', array['1・2年生歓迎','リモート可'], now() + interval '30 days', 'published', true
),
(
  'ダミー ブルームマーケティング',
  '/data/dummy/dummy-internship-marketing.jpg',
  'ダミー｜データから企画するSNSマーケター',
  '発信結果を分析し、次のコンテンツ企画へつなげます。',
  '若者向けサービスのマーケティングを支援するサンプル企業です。',
  'マーケティング', 'つくば市', '出社中心', false, '週2日以上', '時給1,200円〜',
  'SNS運用、数値分析、コンテンツ企画を行います。',
  '文章や企画を考えることが好きな方', 'SNS運用、デザインツールの経験', 'マーケティング分析、企画、編集',
  '課題提出 → 面接', array['企画から参加','服装自由'], now() + interval '21 days', 'published', true
),
(
  'ダミー キャンパスデザイン室',
  '/data/dummy/dummy-internship-marketing.jpg',
  'ダミー｜サービスの見た目をつくるUIデザイナー',
  '学生向けサービスの画面設計と改善を担当します。',
  '学びの体験をデザインするサンプル企業です。',
  'デザイン', 'つくば市・オンライン', 'ハイブリッド', true, '週2日以上', '時給1,250円〜',
  'ワイヤー作成、UI改善、ユーザーテストの記録を行います。',
  'FigmaやCanvaなど、何らかのデザインツールに触れたことがある方', 'Figma、デザインシステム', 'UI設計、ユーザー調査、チーム共有',
  'ポートフォリオ確認 → 面談', array['ポートフォリオ歓迎','リモート可'], now() + interval '28 days', 'published', false
)
on conflict do nothing;

insert into public.alumni_stories (
  university_id, graduation_year, faculty, destination, job_role, title, summary, tags, started_at,
  target_industries, challenge, actions, advice, current_work, cover_image_url, status
) values
(
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
),
(
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
),
(
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
),
(
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
)
on conflict do nothing;

insert into public.internship_universities (internship_id, university_id)
select internships.id, '00000000-0000-4000-8000-000000000001'::uuid
from public.internships
on conflict do nothing;

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
select items.id, '00000000-0000-4000-8000-000000000001'::uuid
from public.news_items items
where items.title like 'ダミー｜%'
on conflict do nothing;
