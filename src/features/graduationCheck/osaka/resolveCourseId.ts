/**
 * 授業名から授業カタログ course_number を解決
 */

import type { Course } from "../core/types";
import type { CatalogCourse } from "../../../types/courseCatalog";

const normalizeName = (name: string): string =>
  name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[（）()]/g, "");

export const resolveCourseId = (
  catalog: CatalogCourse[],
  courseName: string
): string | null => {
  if (!courseName.trim()) return null;
  const normalized = normalizeName(courseName);
  const match = catalog.find(
    (entry) => normalizeName(entry.course_name) === normalized
  );
  return match?.course_number ?? null;
};

export const attachCatalogCourseNumbers = (
  catalog: CatalogCourse[],
  courses: Course[]
): Course[] =>
  courses.map((course) => ({
    ...course,
    catalogCourseNumber:
      course.catalogCourseNumber ?? resolveCourseId(catalog, course.name) ?? undefined,
  }));
