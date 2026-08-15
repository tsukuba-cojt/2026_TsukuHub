# TsukuHub database ER diagram

Snapshot of the running local Supabase `public` schema on 2026-08-15.
The schema contains 18 base tables and 2 read-only views. `auth.users` is shown
as an external Supabase Auth table. To keep the diagrams readable, only keys
and important domain columns are included. Course catalog metadata is not a
database table; it is served from static JSON (`public/data/courses/{slug}.json`).

## University, accounts, and classes

```mermaid
erDiagram
    authUsers ||--o| profiles : owns
    authUsers ||--o{ classReviews : writes
    authUsers ||--o{ reviewReports : files
    authUsers ||--o{ timetableHistories : owns
    authUsers o|..o{ classAnnouncements : creates

    universities o|..o{ profiles : groups
    universities ||--o{ universityEmailDomains : permits
    universities ||--o{ universityFeatures : configures
    universities ||--o{ classAnnouncements : publishes
    universities ||--o{ classReviews : receives
    universities ||--o{ reviewReports : scopes
    universities ||--o{ timetableHistories : stores
    timetableHistories ||--o{ timetableHistoryCourses : contains

    authUsers["auth.users"] {
        uuid id PK
        text email UK
    }
    universities {
        uuid id PK
        text slug UK
        text name
        text short_name
        text status
        bool signup_enabled
    }
    profiles {
        uuid id PK, FK
        uuid university_id FK "Nullable"
        text name
        int grade "Nullable"
        text major
        text role
    }
    platformAdminAllowlist["platform_admin_allowlist"] {
        text email PK
        bool enabled
        datetime created_at
    }
    universityEmailDomains["university_email_domains"] {
        uuid id PK
        uuid university_id FK, UK
        text domain UK
        bool enabled
    }
    universityFeatures["university_features"] {
        uuid university_id PK, FK
        text feature_key PK
        text status
        datetime updated_at
    }
    classAnnouncements["class_announcements"] {
        uuid id PK
        uuid university_id FK
        uuid created_by FK "Nullable"
        text category
        text title
        date published_at
        text status
    }
    classReviews["class_reviews"] {
        uuid id PK
        uuid university_id FK
        uuid user_id FK, UK
        text course_code UK
        int rating
        text comment "Nullable"
        bool anonymous
        text status
    }
    reviewReports["review_reports"] {
        uuid id PK
        uuid university_id FK
        uuid reporter_id FK, UK
        text review_id UK "Not a database FK"
        text course_code
        text reason
        text status
    }
    timetableHistories["timetable_histories"] {
        uuid id PK
        uuid university_id FK
        uuid owner_id FK
        text department
        text major
        int admission_year
        int academic_year
        numeric earned_units
        bool share_public
    }
    timetableHistoryCourses["timetable_history_courses"] {
        uuid id PK
        uuid history_id FK
        text course_code
        text course_name
        numeric credits
        text grade "Nullable"
        int academic_year
        text module_key
    }
```

## Career and published content

```mermaid
erDiagram
    authUsers o|..o{ internships : creates
    authUsers ||--o{ applications : submits
    authUsers o|..o{ alumniStories : creates
    authUsers o|..o{ careerArticles : creates
    authUsers o|..o{ newsItems : creates

    universities ||--o{ applications : scopes
    universities ||--o{ alumniStories : publishes
    universities ||--o{ internshipUniversities : targets
    universities ||--o{ careerArticleUniversities : targets
    universities ||--o{ newsItemUniversities : targets

    internships ||--o{ applications : receives
    internships ||--o{ internshipUniversities : assigned_to
    careerArticles ||--o{ careerArticleUniversities : assigned_to
    newsItems ||--o{ newsItemUniversities : assigned_to

    authUsers["auth.users"] {
        uuid id PK
        text email UK
    }
    universities {
        uuid id PK
        text slug UK
        text name
        text status
    }
    internships {
        uuid id PK
        uuid created_by FK "Nullable"
        text company_name
        text title
        text job_category
        text work_style
        datetime deadline
        text status
    }
    internshipUniversities["internship_universities"] {
        uuid internship_id PK, FK
        uuid university_id PK, FK
        datetime created_at
    }
    applications {
        uuid id PK
        uuid internship_id FK, UK
        uuid university_id FK
        uuid user_id FK, UK
        text applicant_name
        text email
        text status
    }
    alumniStories["alumni_stories"] {
        uuid id PK
        uuid university_id FK
        uuid created_by FK "Nullable"
        int graduation_year
        text faculty
        text destination
        text title
        text status
    }
    careerArticles["career_articles"] {
        uuid id PK
        uuid created_by FK "Nullable"
        text category
        text title
        date published_at
        text status
        text source_type
        text external_url "Nullable"
    }
    careerArticleUniversities["career_article_universities"] {
        uuid career_article_id PK, FK
        uuid university_id PK, FK
        datetime created_at
    }
    newsItems["news_items"] {
        uuid id PK
        uuid created_by FK "Nullable"
        text kind
        text category
        text title
        date published_at
        text status
    }
    newsItemUniversities["news_item_universities"] {
        uuid news_item_id PK, FK
        uuid university_id PK, FK
        datetime created_at
    }
```

## Read-only views

These lines represent view dependencies, not foreign-key constraints.

```mermaid
erDiagram
    classReviews ||..o{ publicClassReviews : exposes
    timetableHistories ||..o{ courseLearningStats : aggregates
    timetableHistoryCourses ||..o{ courseLearningStats : aggregates

    classReviews["class_reviews"] {
        uuid id PK
        uuid university_id FK
        text course_code
        int rating
        text status
    }
    publicClassReviews["public_class_reviews VIEW"] {
        uuid id
        uuid university_id
        text course_code
        int rating
        text comment
        bool anonymous
    }
    timetableHistories["timetable_histories"] {
        uuid id PK
        uuid university_id FK
        bool share_public
    }
    timetableHistoryCourses["timetable_history_courses"] {
        uuid history_id FK
        text course_code
        text grade
    }
    courseLearningStats["course_learning_stats VIEW"] {
        uuid university_id
        text course_code
        bigint sample_count
        bigint passed_count
        bigint a_plus_count
        bigint f_count
    }
```

## Constraints that are easy to miss

- `class_reviews(course_code, user_id)` is unique. `course_code` is a catalog
  key from static JSON, not a database foreign key.
- `review_reports(review_id, reporter_id)` is unique, but `review_id` is stored
  as text and is not a foreign key to `class_reviews`.
- `applications(internship_id, user_id)` is unique.
- University targeting for internships, career articles, and news is modeled
  through junction tables.
- `profiles.university_id` is nullable; most other university-scoped foreign
  keys are required.
