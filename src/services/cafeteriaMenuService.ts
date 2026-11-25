import { supabase } from "../lib/supabase";
import type { PublishedMenuItem } from "../lib/cafeteriaMenu";
export type CafeteriaLocation = { university_id: string; cafeteria_id: string; name: string };
export type MenuPublication = { university_id: string; cafeteria_id: string; menu_date: string; items: PublishedMenuItem[]; updated_at: string };
export type MenuVersion = { university_id: string; cafeteria_id: string; updated_at: string };
export type MenuPhoto = MenuVersion & { menu_date: string; photo_path: string; url: string };
export async function listMenuPhotos(universityId: string, date: string): Promise<MenuPhoto[]> {
  const { data, error } = await supabase.from("cafeteria_menu_photos").select("university_id, cafeteria_id, menu_date, photo_path, updated_at").eq("university_id", universityId).eq("menu_date", date);
  if (error) throw error;
  return Promise.all((data ?? []).map(async (item) => {
    const signed = await supabase.storage.from("cafeteria-menus").createSignedUrl(item.photo_path, 3600);
    if (signed.error) throw signed.error;
    return { ...item, url: signed.data.signedUrl };
  }));
}
export async function uploadMenuPhoto(file: File, userId: string): Promise<string> {
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  if (!extensions[file.type] || file.size > 15 * 1024 * 1024) throw new Error("15MB以下のJPEG・PNG・WebP画像を選んでください。");
  const path = `${userId}/${crypto.randomUUID()}.${extensions[file.type]}`;
  const { error } = await supabase.storage.from("cafeteria-menus").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}
export async function publishMenuPhotos(locations: CafeteriaLocation[], date: string, path: string, versions: Record<string, string>): Promise<MenuVersion[]> {
  if (!locations.length) throw new Error("担当学食を選択してください。");
  const { data, error } = await supabase.rpc("publish_cafeteria_photos", {
    p_targets: locations.map((item) => ({ university_id: item.university_id, cafeteria_id: item.cafeteria_id, expected_updated_at: versions[cafeteriaKey(item)] ?? null })),
    p_menu_date: date, p_photo_path: path,
  });
  if (error) throw error;
  return data as MenuVersion[];
}
export const cafeteriaKey = (location: Pick<CafeteriaLocation, "university_id" | "cafeteria_id">) => `${location.university_id}/${location.cafeteria_id}`;
export async function publishMenus(locations: CafeteriaLocation[], date: string, items: PublishedMenuItem[], versions: Record<string, string>): Promise<MenuVersion[]> {
  if (!locations.length) throw new Error("担当学食を1つ以上選択してください。");
  const { data, error } = await supabase.rpc("publish_cafeteria_menus", {
    p_targets: locations.map((location) => ({ university_id: location.university_id, cafeteria_id: location.cafeteria_id, expected_updated_at: versions[cafeteriaKey(location)] ?? null })),
    p_menu_date: date, p_items: items,
  });
  if (error) throw error;
  return data as MenuVersion[];
}
export async function listStaffCafeterias(): Promise<CafeteriaLocation[]> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user?.email) return [];
  const assignments = await supabase.from("cafeteria_staff_access").select("university_id, cafeteria_id").eq("email", auth.user.email.toLowerCase());
  if (assignments.error) throw assignments.error;
  const locations = await supabase.from("cafeteria_locations").select("university_id, cafeteria_id, name").order("name");
  if (locations.error) throw locations.error;
  return (locations.data ?? []).filter((location) => assignments.data?.some((a) => a.university_id === location.university_id && a.cafeteria_id === location.cafeteria_id));
}
export async function listCafeteriaMenus(universityId: string, date: string): Promise<MenuPublication[]> {
  const { data, error } = await supabase.from("cafeteria_menu_publications").select("university_id, cafeteria_id, menu_date, items, updated_at").eq("university_id", universityId).eq("menu_date", date);
  if (error) throw error;
  return (data ?? []) as MenuPublication[];
}
export async function publishMenu(location: CafeteriaLocation, date: string, items: PublishedMenuItem[], expected: string | null): Promise<string> {
  const { data, error } = await supabase.rpc("publish_cafeteria_menu", { p_university_id: location.university_id, p_cafeteria_id: location.cafeteria_id, p_menu_date: date, p_items: items, p_expected_updated_at: expected });
  if (error) throw error;
  return data as string;
}
