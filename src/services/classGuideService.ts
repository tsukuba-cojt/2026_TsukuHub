import { supabase } from "../lib/supabase";
import type { ClassGuideCategory } from "../data/classGuideCategories";
import type { ClassGuideArticleRecord } from "../types/classGuide";

const columns =
  "id, category, title, description, badge_label, cover_theme, cover_image_url, content, read_minutes, sort_order, published_at, status, created_at, updated_at";

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
