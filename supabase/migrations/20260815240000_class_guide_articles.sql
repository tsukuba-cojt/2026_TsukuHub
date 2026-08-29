-- Class guide articles (履修戦略 / 授業選び) inspired by campus-map program sections.
create table if not exists public.class_guide_articles (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('registration_strategy', 'course_selection')),
  title text not null,
  description text not null default '',
  badge_label text,
  cover_theme text not null default 'strategy'
    check (cover_theme in ('strategy', 'selection')),
  cover_image_url text,
  content text not null default '',
  read_minutes integer not null default 5 check (read_minutes between 1 and 120),
  sort_order integer not null default 0,
  published_at date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_guide_article_universities (
  article_id uuid not null references public.class_guide_articles(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, university_id)
);

create index if not exists class_guide_articles_category_sort_idx
  on public.class_guide_articles(category, sort_order, published_at desc);
create index if not exists class_guide_article_universities_university_idx
  on public.class_guide_article_universities(university_id, article_id);

drop trigger if exists class_guide_articles_set_updated_at on public.class_guide_articles;
create trigger class_guide_articles_set_updated_at
before update on public.class_guide_articles
for each row execute function public.set_updated_at();

alter table public.class_guide_articles enable row level security;
alter table public.class_guide_article_universities enable row level security;

drop policy if exists "university users read targeted class guides" on public.class_guide_articles;
create policy "university users read targeted class guides" on public.class_guide_articles
for select to authenticated using (
  public.is_global_admin()
  or (
    status = 'published'
    and exists (
      select 1 from public.class_guide_article_universities targets
      where targets.article_id = class_guide_articles.id
        and targets.university_id = public.current_user_university_id()
    )
  )
);

drop policy if exists "global admins manage class guides" on public.class_guide_articles;
create policy "global admins manage class guides" on public.class_guide_articles
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

drop policy if exists "read accessible class guide targets" on public.class_guide_article_universities;
create policy "read accessible class guide targets" on public.class_guide_article_universities
for select to authenticated using (public.can_access_university(university_id));

drop policy if exists "global admins manage class guide targets" on public.class_guide_article_universities;
create policy "global admins manage class guide targets" on public.class_guide_article_universities
for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

grant select on public.class_guide_articles, public.class_guide_article_universities to authenticated;
grant insert, update, delete on public.class_guide_articles, public.class_guide_article_universities to authenticated;

with seeded(
  category, cover_theme, badge_label, title, description, read_minutes, sort_order, published_at, content
) as (
  values
    (
      'registration_strategy', 'strategy', '全新入生必読！',
      'ダミー｜【全新入生必読】筑波大の履修の基本と注意点まとめ',
      '履修登録の流れ、単位数、履修上の注意点を1記事に整理しました。',
      8, 1, date '2026-08-14',
      $md$## 見出し画像

![履修の基本](/data/dummy/dummy-internship-engineer.jpg)

## 履修登録の基本

- TWINS で期日までに登録する
- 履修要項と時間割表を必ず確認する
- 履修上の制限（上限単位数・必修科目）を先に把握する

## 注意点

履修登録は「取りたい授業を並べる作業」ではなく、卒業要件と将来の研究・就活を見据えた設計です。1年生のうちに教養科目の全体像を掴んでおくと、後の選択が楽になります。$md$
    ),
    (
      'registration_strategy', 'strategy', '1・2年生必見！',
      'ダミー｜留年・降年を防ぐには？不可を取ったときの対応と成績救済措置',
      '不可や評点不足に直面したときの確認ポイントと、早めに相談すべき窓口をまとめます。',
      7, 2, date '2026-08-12',
      $md$## 不可を取ったら

1. シラバスと成績評価方法を見直す
2. 再履修の可否と時期を確認する
3. 学類事務室・教員オフィスアワーに相談する

## 成績救済措置

大学によって救済制度の名称や条件が異なります。自分の学年・状況に合う制度を、早い段階で確認しておきましょう。$md$
    ),
    (
      'registration_strategy', 'strategy', '人文・文化学群',
      'ダミー｜【人文・文化】前期教養の履修戦略 時間割を組もう！',
      '人文・文化学群1〜2年生向けに、前期教養の組み方の例を紹介します。',
      10, 3, date '2026-08-10',
      $md$## 前期教養の考え方

- 必修の基礎科目を先に確保する
- 広い教養科目で「興味の幅」を確保する
- 後期以降の専門科目に向けて、語学・数学系をバランスよく取る

## 時間割例

月曜は集中しすぎない、水曜を調整日にするなど、生活リズムも含めて設計しましょう。$md$
    ),
    (
      'registration_strategy', 'strategy', '理工学群',
      'ダミー｜【理工】前期教養の履修戦略 時間割を組もう！',
      '理工学群1〜2年生向けに、数学・物理・化学系の履修順序の目安を整理しました。',
      10, 4, date '2026-08-08',
      $md$## 理工系の履修順序

基礎数学・物理学の系列科目は順番が重要です。後から取りたくても履修順制限で取れない科目があるため、先に系列表を確認してください。

## 実験・演習科目

実験科目は時間割上の拘束が大きいので、前期だけでなく通年の見通しを立てておくと安心です。$md$
    ),
    (
      'course_selection', 'selection', '新入生必見！',
      'ダミー｜春学期のおすすめ授業【教養・専門基礎】',
      '初めて履修登録する人向けに、春学期で取りやすい教養・専門基礎科目の選び方を紹介します。',
      6, 1, date '2026-08-14',
      $md$## 春学期の選び方

- 1限に置ける科目を1つ入れて生活リズムを整える
- レポート中心の科目で負担を分散する
- 口コミとシラバスの両方を見る

## おすすめの見方

「単位が取りやすい」だけでなく、「後の専門科目につながるか」を基準に選ぶと、中長期で迷いが減ります。$md$
    ),
    (
      'course_selection', 'selection', '履修の基本',
      'ダミー｜教養科目・専門基礎科目の違いをやさしく解説',
      '科目区分の違いと、それぞれをどのタイミングで取るとよいかを解説します。',
      5, 2, date '2026-08-12',
      $md$## 教養科目

幅広い分野に触れる科目群です。1〜2年生のうちに、自分の興味を広げる役割があります。

## 専門基礎科目

学群・学類の専門に入る前の土台となる科目です。後の専門科目の前提になるため、早めに計画を立てましょう。$md$
    ),
    (
      'course_selection', 'selection', '1・2年生向け',
      'ダミー｜社会に出てから役に立つ！1・2年生におすすめの授業まとめ',
      'プレゼン、統計、情報リテラシーなど、学年が上がる前に触れておきたいテーマを整理しました。',
      7, 3, date '2026-08-10',
      $md$## 低学年で押さえたいスキル

- プレゼンテーション
- データの読み方・統計の基礎
- 情報リテラシーとリサーチスキル

## 選び方のコツ

「就活で使える」だけでなく、「3・4年生の研究や演習で困らないか」も基準にすると選びやすくなります。$md$
    ),
    (
      'course_selection', 'selection', '語学',
      'ダミー｜筑波大の語学の授業まとめ｜英語・第二外国語の内容',
      '英語・第二外国語の代表的な授業タイプと、履修上のポイントをまとめました。',
      6, 4, date '2026-08-08',
      $md$## 英語の授業

読解・スピーキング・プレゼンなど、目的別に科目が分かれています。自分の弱点補強か、将来の留学準備かを決めて選びましょう。

## 第二外国語

語学系科目は継続前提のものが多いので、1年次から履修計画に組み込んでおくと安心です。$md$
    )
)
insert into public.class_guide_articles (
  category, cover_theme, badge_label, title, description, read_minutes,
  sort_order, published_at, content, status
)
select
  category, cover_theme, badge_label, title, description, read_minutes,
  sort_order, published_at, content, 'published'
from seeded
where not exists (
  select 1 from public.class_guide_articles existing
  where existing.category = seeded.category
    and existing.title = seeded.title
);

insert into public.class_guide_article_universities (article_id, university_id)
select articles.id, '00000000-0000-4000-8000-000000000001'
from public.class_guide_articles articles
where articles.title like 'ダミー｜%'
  and not exists (
    select 1
    from public.class_guide_article_universities targets
    where targets.article_id = articles.id
      and targets.university_id = '00000000-0000-4000-8000-000000000001'
  );
