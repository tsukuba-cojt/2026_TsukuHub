import { catalogYears, courseBucket, courseDetails, currentYear } from "../seo/catalog";
import type { CatalogCourse, CourseCatalogFile } from "../types/courseCatalog";

const TSUKUBA_UNIVERSITY_ID = "00000000-0000-4000-8000-000000000001";
const MAX_CACHED_CATALOGS = 2;

const slugByUniversityId: Record<string, string> = {
  [TSUKUBA_UNIVERSITY_ID]: "tsukuba",
};

const catalogCache = new Map<string, Promise<CatalogCourse[]>>();
const courseIndexCache = new Map<string, Promise<Map<string, CatalogCourse>>>();

const emptyCatalog = async (): Promise<CatalogCourse[]> => [];

const catalogKey = (slug: string, academicYear?: number) =>
  `${slug}:${academicYear ?? currentYear}`;

const catalogPath = (slug: string, academicYear?: number) =>
  `/data/courses/${slug}-${academicYear ?? currentYear}.json`;

const touchCatalogCache = (
  key: string,
  catalog: Promise<CatalogCourse[]>,
) => {
  catalogCache.delete(key);
  catalogCache.set(key, catalog);
};

const cacheCatalog = (key: string, catalog: Promise<CatalogCourse[]>) => {
  while (catalogCache.size >= MAX_CACHED_CATALOGS) {
    const oldestKey = catalogCache.keys().next().value;
    if (!oldestKey) break;
    catalogCache.delete(oldestKey);
    courseIndexCache.delete(oldestKey);
  }
  catalogCache.set(key, catalog);
};

const loadCatalog = async (
  slug: string,
  academicYear?: number
): Promise<CatalogCourse[]> => {
  const response = await fetch(catalogPath(slug, academicYear));
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error("授業カタログの取得に失敗しました。");
  }
  // SPA配信では、存在しない年度のJSONにもindex.htmlが200で返る場合がある。
  // カタログ未対応年度は404と同様に扱い、成績CSVの科目情報で処理を続ける。
  if (response.headers.get("content-type")?.includes("text/html")) return [];
  const payload = (await response.json()) as CourseCatalogFile | CatalogCourse[];
  return Array.isArray(payload) ? payload : payload.courses ?? [];
};

export const listCatalogCourses = (
  universitySlug: string | null | undefined,
  academicYear?: number
) => {
  const slug = universitySlug?.trim() ?? "";
  if (!slug) return emptyCatalog();
  const key = catalogKey(slug, academicYear);
  const cached = catalogCache.get(key);
  if (cached) {
    touchCatalogCache(key, cached);
    return cached;
  }
  const request = loadCatalog(slug, academicYear);
  cacheCatalog(key, request);
  request.catch(() => {
    if (catalogCache.get(key) === request) catalogCache.delete(key);
    courseIndexCache.delete(key);
  });
  return request;
};

const courseIndex = (
  universitySlug: string | null | undefined,
  academicYear?: number
) => {
  const slug = universitySlug?.trim() ?? "";
  if (!slug) return Promise.resolve(new Map<string, CatalogCourse>());
  const key = catalogKey(slug, academicYear);
  const cached = courseIndexCache.get(key);
  if (cached) {
    const catalog = catalogCache.get(key);
    if (catalog) touchCatalogCache(key, catalog);
    return cached;
  }
  const request = listCatalogCourses(slug, academicYear).then(
    (courses) => new Map(courses.map((course) => [course.course_number, course])),
  );
  courseIndexCache.set(key, request);
  return request;
};

export async function getCourseDetails(slug: string, code: string, year: number) {
  const cached = catalogCache.get(catalogKey(slug, year));
  if (cached) return courseDetails(await cached, code);
  if (slug !== "tsukuba" || !catalogYears.includes(year)) {
    return courseDetails(await listCatalogCourses(slug, year), code);
  }
  const response = await fetch(`/data/course-pages/tsukuba/${year}/${courseBucket(code)}.json`);
  if (!response.ok) throw new Error("授業情報の取得に失敗しました。");
  return courseDetails(await response.json() as CatalogCourse[], code);
}

export const getCatalogCourse = async (
  universitySlug: string | null | undefined,
  courseNumber: string | null | undefined,
  academicYear?: number
) => {
  const slug = universitySlug?.trim();
  if (!slug || !courseNumber) return null;
  return (await getCourseDetails(slug, courseNumber, academicYear ?? currentYear)).course;
};

export const getCatalogCoursesByCodes = async (
  universityIdOrSlug: string,
  courseNumbers: string[],
  academicYear?: number
) => {
  const slug = slugByUniversityId[universityIdOrSlug] ?? universityIdOrSlug;
  const index = await courseIndex(slug, academicYear);
  const matches = new Map<string, CatalogCourse>();
  for (const code of courseNumbers) {
    const course = index.get(code);
    if (course) matches.set(code, course);
  }
  return matches;
};
