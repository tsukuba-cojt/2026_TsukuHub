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

const articleColumns = "id, category, title, description, content, published_at, read_minutes, status, source_type, external_url, created_at, updated_at";
const alumniColumns = "id, university_id, graduation_year, faculty, destination, job_role, title, summary, tags, started_at, target_industries, challenge, actions, advice, current_work, cover_image_url, status, created_at, updated_at";
const announcementColumns = "id, university_id, category, title, content, published_at, status, created_at, updated_at";
const reportColumns = "id, university_id, review_id, course_code, review_snapshot, reporter_id, reason, status, admin_notes, created_at, updated_at";

export async function listPublishedCareerArticles(universityId: string): Promise<CareerArticleRecord[]> {
  const { data, error } = await supabase.from("career_articles").select(`${articleColumns}, career_article_universities!inner(university_id)`).eq("career_article_universities.university_id", universityId).eq("status", "published").order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CareerArticleRecord[];
}

export async function getPublishedCareerArticle(id: string, universityId: string): Promise<CareerArticleRecord | null> {
  const { data, error } = await supabase.from("career_articles").select(`${articleColumns}, career_article_universities!inner(university_id)`).eq("career_article_universities.university_id", universityId).eq("id", id).eq("status", "published").maybeSingle();
  if (error) throw error;
  return data as CareerArticleRecord | null;
}

export async function listAdminCareerArticles(): Promise<CareerArticleRecord[]> {
  const [items, targets] = await Promise.all([
    supabase.from("career_articles").select(articleColumns).order("created_at", { ascending: false }),
    supabase.from("career_article_universities").select("career_article_id, university_id"),
  ]);
  const { data, error } = items;
  if (error) throw error;
  if (targets.error) throw targets.error;
  return ((data ?? []) as CareerArticleRecord[]).map((item) => ({ ...item, university_ids: (targets.data ?? []).filter((target) => target.career_article_id === item.id).map((target) => target.university_id) }));
}

async function setCareerArticleUniversities(id: string, universityIds: string[]) {
  const { error: deleteError } = await supabase.from("career_article_universities").delete().eq("career_article_id", id);
  if (deleteError) throw deleteError;
  if (!universityIds.length) return;
  const { error } = await supabase.from("career_article_universities").insert(universityIds.map((university_id) => ({ career_article_id: id, university_id })));
  if (error) throw error;
}

export async function createCareerArticle(input: CareerArticleInput, universityIds: string[]): Promise<CareerArticleRecord> {
  const { data, error } = await supabase.from("career_articles").insert(input).select(articleColumns).single();
  if (error) throw error;
  await setCareerArticleUniversities((data as CareerArticleRecord).id, universityIds);
  return data as CareerArticleRecord;
}

export async function updateCareerArticle(id: string, input: CareerArticleInput, universityIds: string[]): Promise<CareerArticleRecord> {
  const { data, error } = await supabase.from("career_articles").update(input).eq("id", id).select(articleColumns).single();
  if (error) throw error;
  await setCareerArticleUniversities(id, universityIds);
  return data as CareerArticleRecord;
}

export async function deleteCareerArticle(id: string): Promise<void> {
  const { error } = await supabase.from("career_articles").delete().eq("id", id);
  if (error) throw error;
}

export async function listPublishedAlumniStories(universityId: string): Promise<AlumniStoryRecord[]> {
  const { data, error } = await supabase.from("alumni_stories").select(alumniColumns).eq("university_id", universityId).eq("status", "published").order("graduation_year", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AlumniStoryRecord[];
}

export async function getPublishedAlumniStory(id: string, universityId: string): Promise<AlumniStoryRecord | null> {
  const { data, error } = await supabase.from("alumni_stories").select(alumniColumns).eq("university_id", universityId).eq("id", id).eq("status", "published").maybeSingle();
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

export async function listPublishedClassAnnouncements(universityId: string): Promise<ClassAnnouncementRecord[]> {
  const { data, error } = await supabase.from("class_announcements").select(announcementColumns).eq("university_id", universityId).eq("status", "published").order("published_at", { ascending: false });
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
  university_id: string;
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

export async function uploadArticleImage(file: File, userId: string): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("article-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("article-images").getPublicUrl(path).data.publicUrl;
}
