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
    expect(
      classified.details.requirementItems.find(
        (item) => item.label === "利用者による分類",
      ),
    ).toMatchObject({
      category: "related",
      earnedUnits: 2,
      isSatisfied: true,
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

  test("複数の未分類科目を続けて別々の区分へ分類できる", () => {
    const relatedCredit = course("", "関連科目として認定された単位", 2, "認");
    const commonCredit = course("", "共通科目として認定された単位", 1, "認");
    const original = checkGraduation([relatedCredit, commonCredit], "mast-22");

    const firstClassified = classifyUncountedCourse(original, 0, "related");
    const fullyClassified = classifyUncountedCourse(
      firstClassified,
      0,
      "common",
    );

    expect(firstClassified.details.uncountedCourses).toEqual([commonCredit]);
    expect(fullyClassified.details.uncountedCourses).toEqual([]);
    expect(collectCategoryCourses(fullyClassified).related).toContain(
      relatedCredit,
    );
    expect(collectCategoryCourses(fullyClassified).common).toContain(
      commonCredit,
    );
    expect(fullyClassified.summary.earnedUnits).toBe(3);
    expect(original.details.uncountedCourses).toEqual([
      relatedCredit,
      commonCredit,
    ]);
  });

  test("小区分最低単位を使う要件でも手動分類分を取得済み単位へ加算する", () => {
    const recognizedCredit = course("", "専門基礎として認定された単位", 2, "認");
    const original = checkGraduation([recognizedCredit], "coins-ss-22");

    const classified = classifyUncountedCourse(
      original,
      0,
      "specializedFoundation",
    );
    const foundation = classified.categories.find(
      (category) => category.category === "specializedFoundation",
    );

    expect(foundation?.earnedUnits).toBe(2);
    expect(classified.summary.earnedUnits).toBe(2);
    expect(
      classified.details.requirementItems.find(
        (item) => item.isManualClassification,
      ),
    ).toMatchObject({
      category: "specializedFoundation",
      earnedUnits: 2,
    });
  });
});
