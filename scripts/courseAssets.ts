import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defaultFilters, filterCourses } from "../src/lib/courseSearch";
import { catalogYears, courseBucket, courseBucketCount } from "../src/seo/catalog";
import type { CatalogCourse, CourseCatalogFile } from "../src/types/courseCatalog";

// These assets are derived from the same snapshots as search and graduation checks.
export async function generateCourseAssets(publicDir: string) {
  for (const year of catalogYears) {
    const source = join(publicDir, "data/courses", `tsukuba-${year}.json`);
    const { courses }: CourseCatalogFile = JSON.parse(await readFile(source, "utf8"));
    const dir = join(publicDir, "data/course-pages", "tsukuba", String(year));
    await mkdir(dir, { recursive: true });
    const groups = Array.from({ length: courseBucketCount }, (): CatalogCourse[] => []);
    for (const course of courses) groups[courseBucket(course.course_number)].push(course);
    await Promise.all(groups.map((rows, i) => writeFile(join(dir, `${i}.json`), JSON.stringify(rows))));
    const listing = filterCourses(courses, defaultFilters).map((row) => [row.course_number, row.course_name]);
    await writeFile(join(dir, "listing.json"), JSON.stringify(listing));
    await writeFile(join(dir, "codes.json"), JSON.stringify(courses.map((row) => row.course_number)));
  }
}
