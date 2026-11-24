import type { CatalogCourse } from "../types/courseCatalog";

export const catalogYears = [2026, 2025, 2024, 2023];
export const currentYear = catalogYears[0];
export const courseBucketCount = 256;

export function catalogYear(params: URLSearchParams) {
  const year = Number(params.get("year"));
  return catalogYears.includes(year) ? year : currentYear;
}

// Keep adjacent course codes together so related links need no second fetch.
export function courseBucket(code: string) {
  let hash = 0;
  for (const char of code.slice(0, 4)) hash = hash * 31 + char.charCodeAt(0);
  return hash % courseBucketCount;
}

export function coursePath(slug: string, code: string, year: number) {
  return `/${encodeURIComponent(slug)}/class/${encodeURIComponent(code)}?year=${year}`;
}

export function courseDetails(rows: CatalogCourse[], code: string) {
  const course = rows.find((row) => row.course_number === code) ?? null;
  const related = course ? rows.filter((row) => row.course_number !== code
    && row.course_number.startsWith(code.slice(0, 4))).slice(0, 2) : [];
  return { course, related };
}
