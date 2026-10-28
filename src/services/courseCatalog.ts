import type { CatalogCourse, CourseCatalogFile } from "../types/courseCatalog";

const TSUKUBA_UNIVERSITY_ID = "00000000-0000-4000-8000-000000000001";
const CURRENT_CATALOG_ACADEMIC_YEAR = 2026;
const MAX_CACHED_CATALOGS = 2;

const slugByUniversityId: Record<string, string> = {
  [TSUKUBA_UNIVERSITY_ID]: "tsukuba",
};

const catalogCache = new Map<string, Promise<CatalogCourse[]>>();
const courseIndexCache = new Map<string, Promise<Map<string, CatalogCourse>>>();

const emptyCatalog = async (): Promise<CatalogCourse[]> => [];

const catalogKey = (slug: string, academicYear?: number) =>
  `${slug}:${academicYear ?? CURRENT_CATALOG_ACADEMIC_YEAR}`;

const catalogPath = (slug: string, academicYear?: number) =>
  `/data/courses/${slug}-${academicYear ?? CURRENT_CATALOG_ACADEMIC_YEAR}.json`;

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

export const getCatalogCourse = async (
  universitySlug: string | null | undefined,
  courseNumber: string | null | undefined,
  academicYear?: number
) => {
  if (!courseNumber) return null;
  return (await courseIndex(universitySlug, academicYear)).get(courseNumber) ?? null;
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
