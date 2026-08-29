-- Enable class-related features for Osaka University (sales version demo)

update public.university_features
set status = 'enabled', updated_at = now()
where university_id = '00000000-0000-4000-8000-000000000002'
  and feature_key in (
    'courses',
    'class_reviews',
    'graduation_checker',
    'timetable'
  );
