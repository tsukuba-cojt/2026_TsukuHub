import { supabase } from "../lib/supabase";
import type { NewsItemInput, NewsItemKind, NewsItemRecord } from "../types/news";

const columns = "id, kind, category, title, description, published_at, status, created_at, updated_at";

export async function listPublishedNews(
  universityId: string,
  kind?: NewsItemKind,
): Promise<NewsItemRecord[]> {
  let query = supabase
    .from("news_items")
    .select(`${columns}, news_item_universities!inner(university_id)`)
    .eq("news_item_universities.university_id", universityId)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as NewsItemRecord[];
}
export async function listAdminNews(): Promise<NewsItemRecord[]> {
  const [items, targets] = await Promise.all([
    supabase.from("news_items").select(columns).order("published_at", { ascending: false }),
    supabase.from("news_item_universities").select("news_item_id, university_id"),
  ]);
  if (items.error) throw items.error;
  if (targets.error) throw targets.error;
  return ((items.data ?? []) as NewsItemRecord[]).map((item) => ({
    ...item,
    university_ids: (targets.data ?? []).filter((target) => target.news_item_id === item.id).map((target) => target.university_id),
  }));
}

async function setTargets(id: string, universityIds: string[]) {
  const { error: deleteError } = await supabase.from("news_item_universities").delete().eq("news_item_id", id);
  if (deleteError) throw deleteError;
  if (!universityIds.length) return;
  const { error } = await supabase.from("news_item_universities").insert(universityIds.map((university_id) => ({ news_item_id: id, university_id })));
  if (error) throw error;
}

export async function createNews(input: NewsItemInput, universityIds: string[]) {
  const { data, error } = await supabase.from("news_items").insert(input).select(columns).single();
  if (error) throw error;
  await setTargets((data as NewsItemRecord).id, universityIds);
}

export async function updateNews(id: string, input: NewsItemInput, universityIds: string[]) {
  const { error } = await supabase.from("news_items").update(input).eq("id", id);
  if (error) throw error;
  await setTargets(id, universityIds);
}

export async function deleteNews(id: string) {
  const { error } = await supabase.from("news_items").delete().eq("id", id);
  if (error) throw error;
}
