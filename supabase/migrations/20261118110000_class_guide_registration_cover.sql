-- Use the supplied spring library image for the freshman registration guide.
update public.class_guide_articles
set cover_image_url = '/images/class-guides/tsukuba-registration-basics.png',
    content = replace(
      content,
      '![履修の基本](/data/dummy/dummy-internship-engineer.jpg)',
      '![春の大学図書館で学ぶ学生](/images/class-guides/tsukuba-registration-basics.png)'
    )
where category = 'registration_strategy'
  and title in (
    'ダミー｜【全新入生必読】筑波大の履修の基本と注意点まとめ',
    '【全新入生必読】筑波大の履修の基本と注意点まとめ'
  );
