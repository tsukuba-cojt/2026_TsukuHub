import type { ClassGuideArticleRecord } from "../types/classGuide";
import type { UniversityStatus } from "../types/university";

type PublicUniversity = {
  id: string;
  slug: string;
  name: string;
  status: UniversityStatus;
  university_features: { feature_key: string; status: string }[];
};

async function readRows<T>(table: string, query: Record<string, string>): Promise<T[]> {
  const url = new URL(`/rest/v1/${table}`, import.meta.env.VITE_SUPABASE_URL);
  url.search = new URLSearchParams(query).toString();
  // Only the same public key as the browser is sent. Never forward a visitor's session.
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const response = await fetch(url, { headers: { apikey: key }, signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("公開情報を取得できませんでした。");
  return response.json();
}

export function publicUniversities(slug?: string) {
  return readRows<PublicUniversity>("universities", {
    select: "id,slug,name,status,university_features(feature_key,status)",
    ...(slug ? { slug: `eq.${slug}` } : { status: "eq.active" }),
    order: "slug",
  });
}

export function hasPublicCourses(university: PublicUniversity) {
  return university.status === "active" && university.university_features.some(
    (feature) => feature.feature_key === "courses" && feature.status === "enabled",
  );
}

const guideTargets = "class_guide_article_universities";

function guideQuery(universityId: string, columns: string) {
  return { select: `${columns},${guideTargets}!inner(university_id)`,
    [`${guideTargets}.university_id`]: `eq.${universityId}`, status: "eq.published" };
}

export async function publicGuide(universityId: string, id: string) {
  const rows = await readRows<ClassGuideArticleRecord>("class_guide_articles", {
    ...guideQuery(universityId, "id,title,description,category,cover_image_url,content,read_minutes,published_at"),
    id: `eq.${id}`, limit: "1",
  });
  return rows[0];
}

export async function publicGuideIds(universityId: string) {
  const ids: string[] = [];
  for (;;) {
    const rows = await readRows<{ id: string }>("class_guide_articles", {
      ...guideQuery(universityId, "id"), order: "id", limit: "500", offset: String(ids.length),
    });
    ids.push(...rows.map((row) => row.id));
    if (rows.length < 500) return ids;
  }
}
