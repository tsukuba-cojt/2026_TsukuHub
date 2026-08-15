import { alumniStories, careerArticles } from "./careerContent";
import type { AlumniStoryRecord, CareerArticleRecord } from "../types/content";

export const fallbackCareerArticles: CareerArticleRecord[] = careerArticles.map(
  (article) => ({
    id: article.id,
    category: article.category,
    title: article.title,
    description: article.description,
    content: article.description,
    published_at: article.publishedAt,
    read_minutes: article.readMinutes,
    status: "published",
    created_at: article.publishedAt,
    updated_at: article.publishedAt,
  }),
);

export const fallbackAlumniStories: AlumniStoryRecord[] = alumniStories.map(
  (story) => ({
    id: story.id,
    university_id: "00000000-0000-4000-8000-000000000001",
    graduation_year: story.graduationYear,
    faculty: story.faculty,
    destination: story.destination,
    job_role: story.role,
    title: story.title,
    summary: story.summary,
    tags: story.tags,
    started_at: story.startedAt,
    target_industries: story.targetIndustries,
    challenge: story.challenge,
    actions: story.actions,
    advice: story.advice,
    current_work: story.currentWork,
    cover_image_url: null,
    status: "published",
    created_at: String(story.graduationYear),
    updated_at: String(story.graduationYear),
  }),
);
