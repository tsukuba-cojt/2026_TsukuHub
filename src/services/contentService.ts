import { supabase } from "../lib/supabase";
import type {
  AlumniStoryInput,
  AlumniStoryRecord,
  CareerArticleInput,
  CareerArticleRecord,
  ClassAnnouncementInput,
  ClassAnnouncementRecord,
  PublishStatus,
  ReviewReport,
  ReviewReportStatus,
} from "../types/content";

const articleColumns = "id, category, title, description, content, published_at, read_minutes, status, created_at, updated_at";
const alumniColumns = "id, graduation_year, faculty, destination, job_role, title, summary, tags, started_at, target_industries, challenge, actions, advice, current_work, status, created_at, updated_at";
const announcementColumns = "id, category, title, content, published_at, status, created_at, updated_at";
const reportColumns = "id, review_id, course_code, review_snapshot, reporter_id, reason, status, admin_notes, created_at, updated_at";

export async function listPublishedCareerArticles(): Promise<CareerArticleRecord[]> {
  const { data, error } = await supabase.from("career_articles").select(articleColumns).eq("status", "published").order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CareerArticleRecord[];
}

export async function getPublishedCareerArticle(id: string): Promise<CareerArticleRecord | null> {
  const { data, error } = await supabase.from("career_articles").select(articleColumns).eq("id", id).eq("status", "published").maybeSingle();
  if (error) throw error;
  return data as CareerArticleRecord | null;
}

export async function listAdminCareerArticles(): Promise<CareerArticleRecord[]> {
  const { data, error } = await supabase.from("career_articles").select(articleColumns).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CareerArticleRecord[];
}

export async function createCareerArticle(input: CareerArticleInput): Promise<CareerArticleRecord> {
  const { data, error } = await supabase.from("career_articles").insert(input).select(articleColumns).single();
  if (error) throw error;
  return data as CareerArticleRecord;
}

export async function updateCareerArticle(id: string, input: CareerArticleInput): Promise<CareerArticleRecord> {
  const { data, error } = await supabase.from("career_articles").update(input).eq("id", id).select(articleColumns).single();
  if (error) throw error;
  return data as CareerArticleRecord;
}

export async function deleteCareerArticle(id: string): Promise<void> {
  const { error } = await supabase.from("career_articles").delete().eq("id", id);
  if (error) throw error;
}

export async function listPublishedAlumniStories(): Promise<AlumniStoryRecord[]> {
  const { data, error } = await supabase.from("alumni_stories").select(alumniColumns).eq("status", "published").order("graduation_year", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AlumniStoryRecord[];
}

export async function getPublishedAlumniStory(id: string): Promise<AlumniStoryRecord | null> {
  const { data, error } = await supabase.from("alumni_stories").select(alumniColumns).eq("id", id).eq("status", "published").maybeSingle();
  if (error) throw error;
  return data as AlumniStoryRecord | null;
}

export async function listAdminAlumniStories(): Promise<AlumniStoryRecord[]> {
  const { data, error } = await supabase.from("alumni_stories").select(alumniColumns).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AlumniStoryRecord[];
}

export async function createAlumniStory(input: AlumniStoryInput): Promise<AlumniStoryRecord> {
  const { data, error } = await supabase.from("alumni_stories").insert(input).select(alumniColumns).single();
  if (error) throw error;
  return data as AlumniStoryRecord;
}

export async function updateAlumniStory(id: string, input: AlumniStoryInput): Promise<AlumniStoryRecord> {
  const { data, error } = await supabase.from("alumni_stories").update(input).eq("id", id).select(alumniColumns).single();
  if (error) throw error;
  return data as AlumniStoryRecord;
}

export async function deleteAlumniStory(id: string): Promise<void> {
  const { error } = await supabase.from("alumni_stories").delete().eq("id", id);
  if (error) throw error;
}

export async function listPublishedClassAnnouncements(): Promise<ClassAnnouncementRecord[]> {
  const { data, error } = await supabase.from("class_announcements").select(announcementColumns).eq("status", "published").order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClassAnnouncementRecord[];
}

export async function listAdminClassAnnouncements(): Promise<ClassAnnouncementRecord[]> {
  const { data, error } = await supabase.from("class_announcements").select(announcementColumns).order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClassAnnouncementRecord[];
}

export async function createClassAnnouncement(input: ClassAnnouncementInput): Promise<ClassAnnouncementRecord> {
  const { data, error } = await supabase.from("class_announcements").insert(input).select(announcementColumns).single();
  if (error) throw error;
  return data as ClassAnnouncementRecord;
}

export async function updateClassAnnouncement(id: string, input: ClassAnnouncementInput): Promise<ClassAnnouncementRecord> {
  const { data, error } = await supabase.from("class_announcements").update(input).eq("id", id).select(announcementColumns).single();
  if (error) throw error;
  return data as ClassAnnouncementRecord;
}

export async function deleteClassAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from("class_announcements").delete().eq("id", id);
  if (error) throw error;
}

export async function createReviewReport(input: {
  review_id: string;
  course_code: string;
  review_snapshot: string;
  reporter_id: string;
  reason: string;
}): Promise<void> {
  const { error } = await supabase.from("review_reports").insert(input);
  if (error) throw error;
}

export async function listAdminReviewReports(): Promise<ReviewReport[]> {
  const { data, error } = await supabase.from("review_reports").select(reportColumns).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReviewReport[];
}

export async function updateReviewReport(id: string, status: ReviewReportStatus, adminNotes: string): Promise<void> {
  const { error } = await supabase.from("review_reports").update({ status, admin_notes: adminNotes.trim() || null }).eq("id", id);
  if (error) throw error;
}

export async function updateContentStatus(table: "career_articles" | "alumni_stories" | "class_announcements", id: string, status: PublishStatus): Promise<void> {
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) throw error;
}
