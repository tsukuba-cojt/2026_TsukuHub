export const universityFeatureKeys = [
  "news",
  "career_articles",
  "internships",
  "alumni_stories",
  "courses",
  "class_reviews",
  "graduation_checker",
  "timetable",
] as const;

export type UniversityFeatureKey = (typeof universityFeatureKeys)[number];
export type UniversityFeatureStatus = "enabled" | "coming_soon";
export type UniversityStatus = "active" | "suspended";

export type University = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  tagline: string;
  description: string;
  status: UniversityStatus;
  signup_enabled: boolean;
  created_at: string;
  updated_at: string;
};
export type UniversityFeature = {
  university_id: string;
  feature_key: UniversityFeatureKey;
  status: UniversityFeatureStatus;
};

export type UniversityEmailDomain = {
  id: string;
  university_id: string;
  domain: string;
  enabled: boolean;
};

export type UniversityWithSettings = University & {
  features: Record<UniversityFeatureKey, UniversityFeatureStatus>;
  emailDomains: UniversityEmailDomain[];
};

export const universityFeatureLabels: Record<UniversityFeatureKey, string> = {
  news: "ニュース・トピック",
  career_articles: "キャリア記事",
  internships: "インターン求人",
  alumni_stories: "卒業生体験記",
  courses: "授業検索",
  class_reviews: "授業口コミ",
  graduation_checker: "卒業要件判定",
  timetable: "時間割",
};
