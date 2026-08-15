import type { CatalogCourse, CourseCatalogFile } from "../types/courseCatalog";

const TSUKUBA_UNIVERSITY_ID = "00000000-0000-4000-8000-000000000001";

const slugByUniversityId: Record<string, string> = {
  [TSUKUBA_UNIVERSITY_ID]: "tsukuba",
};

const catalogCache = new Map<string, Promise<CatalogCourse[]>>();
const courseIndexCache = new Map<string, Promise<Map<string, CatalogCourse>>>();

const emptyCatalog = async (): Promise<CatalogCourse[]> => [];

const loadCatalog = async (slug: string): Promise<CatalogCourse[]> => {
  const response = await fetch(`/data/courses/${slug}.json`);
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error("授業カタログの取得に失敗しました。");
  }
  const payload = (await response.json()) as CourseCatalogFile | CatalogCourse[];
  return Array.isArray(payload) ? payload : payload.courses ?? [];
};

export const listCatalogCourses = (universitySlug: string | null | undefined) => {
  const slug = universitySlug?.trim() ?? "";
  if (!slug) return emptyCatalog();
  const cached = catalogCache.get(slug);
  if (cached) return cached;
  const request = loadCatalog(slug);
  catalogCache.set(slug, request);
  return request;
};

const courseIndex = (universitySlug: string | null | undefined) => {
  const slug = universitySlug?.trim() ?? "";
  if (!slug) return Promise.resolve(new Map<string, CatalogCourse>());
  const cached = courseIndexCache.get(slug);
  if (cached) return cached;
  const request = listCatalogCourses(slug).then(
    (courses) => new Map(courses.map((course) => [course.course_number, course])),
  );
  courseIndexCache.set(slug, request);
  return request;
};

export const getCatalogCourse = async (
  universitySlug: string | null | undefined,
  courseNumber: string | null | undefined,
) => {
  if (!courseNumber) return null;
  return (await courseIndex(universitySlug)).get(courseNumber) ?? null;
};

export const getCatalogCoursesByCodes = async (
  universityIdOrSlug: string,
  courseNumbers: string[],
) => {
  const slug = slugByUniversityId[universityIdOrSlug] ?? universityIdOrSlug;
  const index = await courseIndex(slug);
  const matches = new Map<string, CatalogCourse>();
  for (const code of courseNumbers) {
    const course = index.get(code);
    if (course) matches.set(code, course);
  }
  return matches;
};
