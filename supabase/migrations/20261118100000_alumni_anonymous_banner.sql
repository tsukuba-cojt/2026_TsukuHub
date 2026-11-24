update public.alumni_stories
set summary = replace(
    summary,
    '筑波大学を卒業し、三大商社の一社で働くToa Yamauchiさん。',
    '三大商社の一社で働く筑波大学の卒業生。'
  ),
  cover_image_url = 'https://znqpvpszmpmcqmeronzd.supabase.co/storage/v1/object/public/article-images/alumni/trading-company-career-banner-20261118.png'
where id = 'b930b785-f48d-48b1-8c41-53628f60bf43';
