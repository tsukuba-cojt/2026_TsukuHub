import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import type { CourseCatalogFile } from "../types/courseCatalog";

const expectedCatalogs = [
  {
    year: 2023,
    updated: "2024-03-31",
    courses: 15_943,
    rows: 16_010,
    skipped: 67,
    warnings: 6,
    sha256: "8aca44f7c164d35bbb4449a5198610260c96713a759de0d1f295d36127cbbeff",
  },
  {
    year: 2024,
    updated: "2025-03-31",
    courses: 14_822,
    rows: 14_822,
    skipped: 0,
    warnings: 6,
    sha256: "3a74de3ea118a85c420cf67728a42f7155c834f6afff8682b8d15142139fbe15",
  },
  {
    year: 2025,
    updated: "2025-10-31",
    courses: 13_888,
    rows: 13_888,
    skipped: 0,
    warnings: 5,
    sha256: "ed59d7f92b9faf6e60d9adbb7d50747027e4cdc9469b3a3e6154254205fdf13b",
  },
  {
    year: 2026,
    updated: "2026-10-16",
    courses: 13_496,
    rows: 13_496,
    skipped: 0,
    warnings: 0,
    sha256: "b46050ba62c0ffa989402ef688321144118ea461262a68534b529f8c04988ca5",
  },
] as const;

describe("annual course catalog assets", () => {
  test.each(expectedCatalogs)(
    "$year年度JSONの出典・件数・年度を保持する",
    async ({ year, updated, courses, rows, skipped, warnings, sha256 }) => {
      const file = await readFile(
        resolve(`public/data/courses/tsukuba-${year}.json`),
        "utf8"
      );
      const payload = JSON.parse(file) as CourseCatalogFile;

      expect(payload).toEqual(
        expect.objectContaining({
          schema_version: "course-catalog-file-2.0.0",
          university: "tsukuba",
          academic_year: year,
          updated,
          source_sha256: sha256,
          source_row_count: rows,
          skipped_row_count: skipped,
          duplicate_course_code_count: 0,
          parse_warning_count: warnings,
        })
      );
      expect(payload.courses).toHaveLength(courses);
      expect(
        payload.courses.every((course) => course.academic_year === year)
      ).toBe(true);
      expect(
        new Set(payload.courses.map((course) => course.course_number)).size
      ).toBe(courses);
      expect(
        payload.courses.every((course) => "classroom" in course)
      ).toBe(true);
      expect(
        payload.courses.some((course) => Boolean(course.instructor.trim()))
      ).toBe(true);
    }
  );
});
