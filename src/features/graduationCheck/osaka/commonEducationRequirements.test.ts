import { describe, expect, it } from "vitest";
import { checkGraduation, gradRequirementData } from "./index";
import { getCommonEducationSpec } from "./data/requirements/commonEducation";
import { SUB } from "./data/subGenreMaster";
import type { Course } from "../core/types";

const koanCourse = (
  subGenre: string,
  name: string,
  unit: number
): Course => ({
  id: subGenre,
  name,
  unit,
  grade: "A",
  year: 2025,
  subjectGenre: subGenre.split("::")[0],
  subjectSubGenre: subGenre.split("::")[1],
});

describe("osaka common education requirements", () => {
  it("letters spec defines humanities 12 and social 6", () => {
    const spec = getCommonEducationSpec("letters");
    expect(spec.humanities).toBe(12);
    expect(spec.social).toBe(6);
    expect(spec.specialized).toBe(96);
  });

  it("osaka-letters-22 requires 144 units total", () => {
    const report = checkGraduation([], "osaka-letters-22");
    expect(report.summary.requiredUnits).toBe(144);
    const common = report.categories.find((c) => c.category === "common");
    expect(common?.requiredUnits).toBe(22);
  });

  it("counts courses by KOAN sub-genre prefix via selectResults", () => {
    const courses = [
      koanCourse(SUB.humanities, "人文科目A", 2),
      koanCourse(SUB.humanities, "人文科目B", 2),
      koanCourse(SUB.social, "社会科目A", 2),
      koanCourse(SUB.firstForeign, "英語I", 2),
    ];
    const report = checkGraduation(courses, "osaka-letters-22");
    const humanities = report.details.selectResults.find((result) =>
      result.message.includes("人文科学系科目")
    );
    const social = report.details.selectResults.find((result) =>
      result.message.includes("社会科学系科目")
    );
    const firstForeign = report.details.selectResults.find((result) =>
      result.message.includes("第１外国語")
    );

    expect(humanities?.courses).toHaveLength(2);
    expect(social?.courses).toHaveLength(1);
    expect(firstForeign?.courses).toHaveLength(1);
  });

  it("science-math enforces select minimums and excludes natural sciences", () => {
    const spec = getCommonEducationSpec("science-math");
    expect(spec.humanities).toBe(6);
    expect(spec.social).toBe(0);
    expect(spec.excludeNaturalSciences).toBe(true);
    expect(spec.foundation).toBe(37);

    const report = checkGraduation([], "osaka-science-math-22");
    const common = report.categories.find((c) => c.category === "common");
    expect(common?.requiredUnits).toBe(8);
    expect(
      gradRequirementData["osaka-science-math-22"].courses.enforceSelectMinimums
    ).toBe(true);
    expect(
      report.details.selectResults.some((result) =>
        result.message.includes("自然科学系科目")
      )
    ).toBe(false);
  });
});
