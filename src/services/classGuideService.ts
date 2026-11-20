import { supabase } from "../lib/supabase";
import type { ClassGuideCategory } from "../data/classGuideCategories";
import type { ClassGuideArticleInput, ClassGuideArticleRecord } from "../types/classGuide";

const columns =
  "id, category, title, description, badge_label, cover_theme, cover_image_url, content, read_minutes, sort_order, published_at, status, created_at, updated_at";

export async function listAdminClassGuides(): Promise<ClassGuideArticleRecord[]> {
  const { data, error } = await supabase.from("class_guide_articles")
    .select(`${columns}, class_guide_article_universities(university_id)`)
    .order("sort_order").order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(({ class_guide_article_universities: targets, ...item }) => ({ ...item, university_ids: targets.map((target) => target.university_id) })) as ClassGuideArticleRecord[];
}

export async function saveClassGuide(id: string | null, input: ClassGuideArticleInput, universityIds: string[]): Promise<string> {
  if (!universityIds.length) throw new Error("掲載対象大学を選択してください。");
  const result = id
    ? await supabase.from("class_guide_articles").update(input).eq("id", id).select("id").single()
    : await supabase.from("class_guide_articles").insert(input).select("id").single();
  if (result.error) throw result.error;
  const articleId = result.data.id;
  const { data: previous, error: readError } = await supabase.from("class_guide_article_universities").select("university_id").eq("article_id", articleId);
  if (readError) throw readError;
  const { error: addError } = await supabase.from("class_guide_article_universities").upsert(universityIds.map((university_id) => ({ article_id: articleId, university_id })), { onConflict: "article_id,university_id" });
  if (addError) throw addError;
  const removed = (previous ?? []).map((target) => target.university_id).filter((target) => !universityIds.includes(target));
  if (removed.length) {
    const { error } = await supabase.from("class_guide_article_universities").delete().eq("article_id", articleId).in("university_id", removed);
    if (error) throw error;
  }
  return articleId;
}

export async function deleteClassGuide(id: string): Promise<void> {
  const { error } = await supabase.from("class_guide_articles").delete().eq("id", id);
  if (error) throw error;
}

export async function listPublishedClassGuides(
  universityId: string,
  category?: ClassGuideCategory,
): Promise<ClassGuideArticleRecord[]> {
  let query = supabase
    .from("class_guide_articles")
    .select(`${columns}, class_guide_article_universities!inner(university_id)`)
    .eq("class_guide_article_universities.university_id", universityId)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ClassGuideArticleRecord[];
}

export async function getPublishedClassGuide(
  id: string,
  universityId: string,
): Promise<ClassGuideArticleRecord | null> {
  const { data, error } = await supabase
    .from("class_guide_articles")
    .select(`${columns}, class_guide_article_universities!inner(university_id)`)
    .eq("class_guide_article_universities.university_id", universityId)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data as ClassGuideArticleRecord | null;
}
