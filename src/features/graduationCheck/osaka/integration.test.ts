import { describe, expect, it } from "vitest";
import { isOsakaGpaExcludedCourse } from "./gpaExclude";
import { checkGraduation } from "./index";
import type { Course } from "../core/types";
import { enrichCoursesWithCatalog, parseGradesCsv, gradRequirementData } from "./index";
import { GRADE_TABLE_HEADER } from "./parseCsv";
import { getGraduationCheckProvider } from "../provider";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CourseCatalogFile } from "../../../types/courseCatalog";

describe("osaka gpaExclude", () => {
  it("excludes other-department sub-genre from GPA target", () => {
    const course: Course = {
      id: "他学科・専攻・教免等科目::",
      name: "他学部科目",
      unit: 2,
      grade: "A",
      year: 2025,
      subjectSubGenre: "他学科・専攻・教免等科目",
    };
    expect(isOsakaGpaExcludedCourse(course)).toBe(true);
  });

  it("checkGraduation excludes other-department courses from GPA units", () => {
    const included: Course = {
      id: "全学共通教育科目::人文科学系科目",
      name: "人文",
      unit: 2,
      grade: "A",
      year: 2025,
    };
    const excluded: Course = {
      id: "他学科・専攻・教免等科目::",
      name: "他学科",
      unit: 2,
      grade: "A",
      year: 2025,
      subjectSubGenre: "他学科・専攻・教免等科目",
    };
    const report = checkGraduation([included, excluded], "osaka-letters-22");
    expect(report.gpa.targetUnits).toBe(2);
  });
});

describe("osaka catalog enrichment integration", () => {
  it("enriches KOAN CSV courses with catalog course numbers", () => {
    const catalogPath = resolve(process.cwd(), "public/data/courses/osaka.json");
    const payload = JSON.parse(readFileSync(catalogPath, "utf8")) as CourseCatalogFile;
    const row = [
      "001",
      "12345678",
      "2025",
      "春学期",
      "1",
      "全学共通教育科目",
      "人文科学系科目",
      "学問への扉",
      "",
      "",
      "2",
      "2025",
      "春学期",
      "A",
      "合",
    ]
      .map((v) => `"${v}"`)
      .join(",");
    const parsed = parseGradesCsv(`${GRADE_TABLE_HEADER}\n${row}`);
    const enriched = enrichCoursesWithCatalog(payload.courses, parsed);
    expect(enriched.courses[0].catalogCourseNumber).toBeTruthy();
  });

  it("provider lists 24 majors across 11 departments", () => {
    const provider = getGraduationCheckProvider("osaka");
    const majorCount = provider.supportedDepartments.reduce(
      (sum, dept) => sum + dept.majors.length,
      0
    );
    expect(majorCount).toBe(24);
    expect(Object.keys(gradRequirementData).length).toBe(24);
  });

  it("tsukuba provider remains unchanged", () => {
    const provider = getGraduationCheckProvider("tsukuba");
    expect(provider.csvSourceName).toBe("TWINS");
    expect(
      provider.resolveRequirementId("humanities", "humanities-philosophy", "2024")
    ).toBe("humanities-philosophy-22");
  });
});
