insert into public.internships (
  company_name, title, summary, company_description, job_category, location,
  work_style, is_remote, work_conditions, compensation, description,
  requirements, preferred_skills, acquirable_skills, selection_process,
  tags, deadline, status, is_featured
) values
('つくばテックラボ（サンプル）', '研究とプロダクトをつなぐWebエンジニア', '学生チームと一緒に、学習支援プロダクトを改善します。', '教育領域の課題を技術で解決するサンプル企業です。', 'エンジニア', 'つくば市・オンライン', 'ハイブリッド', true, '週2日以上・1日4時間から', '時給1,300円〜', 'ReactとTypeScriptを使った機能開発、レビュー、ユーザー調査を行います。', '基本的なプログラミング経験、チームで学ぶ姿勢', 'React、TypeScript、Gitの経験', 'Web開発、チーム開発、ユーザー理解', '書類確認 → 面談 → 最終面談', array['未経験相談可','学生チーム'], now() + interval '45 days', 'published', true),
('未来営業デザイン（サンプル）', '新規事業を支える法人営業インターン', '顧客の課題を聞き、提案づくりから商談まで経験します。', '地域企業の新規事業を支援するサンプル企業です。', '営業・ビジネス', '東京都・オンライン', 'ハイブリッド', true, '週3日以上', '時給1,250円〜＋交通費', '顧客リサーチ、提案資料作成、商談同席を担当します。', '人と話すことが好きで、主体的に行動できる方', '接客、プレゼンテーション経験', '課題発見、提案、法人営業', 'カジュアル面談 → 面接', array['1・2年生歓迎','リモート可'], now() + interval '30 days', 'published', false),
('ブルームマーケティング（サンプル）', 'データから企画するSNSマーケター', '発信結果を分析し、次のコンテンツ企画へつなげます。', '若者向けサービスのマーケティングを支援するサンプル企業です。', 'マーケティング', 'つくば市', '出社中心', false, '週2日以上', '時給1,200円〜', 'SNS運用、数値分析、コンテンツ企画を行います。', '文章や企画を考えることが好きな方', 'SNS運用、デザインツールの経験', 'マーケティング分析、企画、編集', '課題提出 → 面接', array['企画から参加','服装自由'], now() + interval '21 days', 'published', false)
on conflict do nothing;
