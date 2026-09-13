import { describe, expect, it } from "vitest";
import { resolveCourseId, attachCatalogCourseNumbers } from "./resolveCourseId";
import type { Course } from "../core/types";
import type { CatalogCourse } from "../../../types/courseCatalog";

const catalog: CatalogCourse[] = [
  {
    course_number: "OU-CE001",
    course_name: "学問への扉",
    method: "1",
    credits: "2",
    target_year: "1",
    semester: "春",
    schedule: "",
    instructor: "",
    overview: "",
    remarks: "",
  },
  {
    course_number: "OU-CE002",
    course_name: "実践英語(e-learning)",
    method: "1",
    credits: "2",
    target_year: "1",
    semester: "通年",
    schedule: "",
    instructor: "",
    overview: "",
    remarks: "",
  },
];

describe("resolveCourseId", () => {
  it("matches course name with normalized whitespace and case", () => {
    expect(resolveCourseId(catalog, "学問への扉")).toBe("OU-CE001");
    expect(resolveCourseId(catalog, "  学問への扉  ")).toBe("OU-CE001");
  });

  it("returns null when no catalog entry matches", () => {
    expect(resolveCourseId(catalog, "存在しない科目")).toBeNull();
    expect(resolveCourseId(catalog, "")).toBeNull();
  });

  it("attaches catalogCourseNumber without overwriting existing values", () => {
    const courses: Course[] = [
      {
        id: "全学共通教育科目::人文科学系科目",
        name: "学問への扉",
        unit: 2,
        grade: "A",
        year: 2025,
      },
      {
        id: "国際性涵養教育系科目::第１外国語",
        name: "実践英語(e-learning)",
        unit: 2,
        grade: "A",
        year: 2025,
        catalogCourseNumber: "PRESET",
      },
    ];

    const enriched = attachCatalogCourseNumbers(catalog, courses);
    expect(enriched[0].catalogCourseNumber).toBe("OU-CE001");
    expect(enriched[1].catalogCourseNumber).toBe("PRESET");
  });
});
