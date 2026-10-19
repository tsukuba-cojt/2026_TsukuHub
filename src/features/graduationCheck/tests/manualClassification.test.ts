import { describe, expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { classifyUncountedCourse } from "../manualClassification";
import { course } from "./helpers";

describe("未分類科目のローカル分類", () => {
  test("関連科目へ移し、区分と全体の単位を再集計する", () => {
    const recognizedCredit = course("", "編入学時の認定科目", 2, "認");
    const original = checkGraduation([recognizedCredit], "mast-22");

    const classified = classifyUncountedCourse(original, 0, "related");

    expect(original.details.uncountedCourses).toEqual([recognizedCredit]);
    expect(classified.details.uncountedCourses).toEqual([]);
    expect(collectCategoryCourses(classified).related).toEqual([
      recognizedCredit,
    ]);
    expect(
      classified.categories.find((category) => category.category === "related")
        ?.earnedUnits,
    ).toBe(2);
    expect(classified.summary.earnedUnits).toBe(2);
    expect(classified.summary.shortageUnits).toBe(
      classified.summary.requiredUnits - 2,
    );
    expect(classified.details.allocationTraces[0].assigned).toMatchObject({
      kind: "select",
      category: "related",
      label: "利用者による分類",
    });
  });

  test("必修へ分類した科目も必修上限を含めて再集計する", () => {
    const recognizedCredit = course("", "認定された必修相当科目", 2, "認");
    const original = checkGraduation([recognizedCredit], "mast-22");

    const classified = classifyUncountedCourse(original, 0, "compulsory");

    expect(collectCategoryCourses(classified).compulsory).toContain(
      recognizedCredit,
    );
    expect(classified.categories[0].earnedUnits).toBe(2);
    expect(classified.details.allocationTraces[0].assigned).toMatchObject({
      kind: "compulsory",
      label: "利用者による分類",
    });
  });
});
