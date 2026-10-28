import { describe, expect, test } from "vitest";
import { categoryOrder } from "../categoryMapping";
import { checkGraduation, checkGraduationWithCatalog } from "../checkGraduation";
import { gradRequirementData } from "../data/gradRequirementData";
import { classifyUncountedCourse } from "../manualClassification";
import { calculateGraduationProgress } from "../progress";
import type { GradRequirement, RequirementId } from "../types";
import { course } from "./helpers";

const requirement: GradRequirement = {
  header: { department: "テスト", major: "テスト", enrollYear: 2022 },
  courses: {
    compulsory: [], compulsorySumUnit: 2, selectMinimumUnit: 10,
    groups: [[0, 4, 8, "専門科目選択"], [1, 0, 2, "専門基礎科目選択"],
      [2, 1, 2, "共通科目選択"], [3, 2, 6, "関連科目選択"]],
    select: [], enforceSelectMinimums: true,
  },
};

describe("プロトタイプの5分類集計", () => {
  test("小区分不足・上限と必修個別条件を進捗に混ぜず、区分上限は守る", () => {
    const compulsory = [{ name: "必修群", isCourseGroup: true, minimumUnit: 1,
      passed: false, courses: [course("REQ", "必修", 2)] }];
    const selected = [
      { codes: [], minimum: 4, maximum: 1, isExcludeRequirement: false,
        message: "小区分", group: 0, courses: [course("SP", "専門", 9)] },
      { codes: [], minimum: 4, maximum: 4, isExcludeRequirement: false,
        message: "不足小区分", group: 0, courses: [] },
      { codes: [], minimum: 0, maximum: 1, isExcludeRequirement: false,
        message: "共通", group: 2, courses: [course("CO", "共通", 1)] },
      { codes: [], minimum: 0, maximum: 6, isExcludeRequirement: false,
        message: "関連", group: 3, courses: [course("RE", "関連", 2)] },
    ];
    const coarse = calculateGraduationProgress(requirement, compulsory, selected, "five-category");
    expect(coarse.categories.map((item) => item.category)).toEqual(categoryOrder);
    expect(coarse.categories[0].earnedUnits).toBe(2);
    expect(coarse.categories[1]).toMatchObject({ earnedUnits: 8, isSatisfied: true });
    expect(coarse.summary).toMatchObject({ earnedUnits: 12, shortageUnits: 0, isSatisfied: true });
    expect(coarse.requirementItems.some((item) => !item.isSatisfied)).toBe(true);
    expect(calculateGraduationProgress(requirement, compulsory, selected).summary.isSatisfied).toBe(false);
  });

  test("総単位に届いても区分不足を0単位や充足にしない", () => {
    const progress = calculateGraduationProgress(requirement,
      [{ name: "必修", isCourseGroup: false, passed: true, courses: [course("R", "必修", 2)] }],
      [{ codes: [], minimum: 0, maximum: 8, isExcludeRequirement: false,
        message: "専門", group: 0, courses: [course("S", "専門", 8)] },
      { codes: [], minimum: 0, maximum: 6, isExcludeRequirement: false,
        message: "関連", group: 3, courses: [course("X", "関連", 6)] }], "five-category");
    expect(progress.summary).toMatchObject({ earnedUnits: 12, shortageUnits: 1, isSatisfied: false });
  });

  test("画面用APIはコース未選択でも5分類を返し、手動分類後も方式を保つ", async () => {
    const credits = categoryOrder.map((category) => course("", category, 1, "認", 2022));
    const original = await checkGraduationWithCatalog(credits, "bioresources-24", "tsukuba");
    let report = original;
    for (const category of categoryOrder) report = classifyUncountedCourse(report, 0, category);
    expect(report.evaluationMode).toBe("five-category");
    expect(report.studentContext).toBeUndefined();
    expect(report.details.uncountedCourses).toHaveLength(0);
    expect(report.categories.map((item) => item.earnedUnits)).toEqual([1, 1, 1, 1, 1]);
    expect(report.summary.earnedUnits).toBe(5);
    expect(original.details.uncountedCourses).toHaveLength(5);
    expect(() => classifyUncountedCourse(report, 0, "related")).toThrow();
  });

  test("不合格は加算せず、履修中は見込みだけに加える", async () => {
    let report = await checkGraduationWithCatalog([
      course("", "不合格D", 2, "D", 2022), course("", "不合格F", 2, "F", 2022),
      course("", "履修中", 3, "履修中", 2022), course("", "合格", 2, "P", 2022),
    ], "bioresources-24", "tsukuba");
    while (report.details.uncountedCourses.length) report = classifyUncountedCourse(report, 0, "specialized");
    expect(report.summary).toMatchObject({ earnedUnits: 2, prospectiveUnits: 5 });
  });

  test("科目数上限は詳細判定に保持し、5分類では同じ区分の科目を未分類へ落とさない", () => {
    const courses = [course("EB16913", "臨海1", 1), course("EB16933", "臨海2", 1)];
    const coarse = checkGraduation(courses, "biology-24", undefined, "five-category");
    expect(coarse.categories[1].earnedUnits).toBe(2);
    expect(coarse.details.uncountedCourses).toHaveLength(0);
    expect(checkGraduation(courses, "biology-24").details.uncountedCourses).toHaveLength(1);
  });

  test("所属コース・授業形態が不明でも専門の粗い単位充足を妨げない", () => {
    const report = checkGraduation([course("EC31001", "専門科目", 53)],
      "bioresources-24", undefined, "five-category");
    expect(report.categories[1]).toMatchObject({ earnedUnits: 53, isSatisfied: true });
    expect(report.details.requirementItems.some((item) =>
      item.attributeEvaluation?.status === "unknown")).toBe(true);
  });

  test("全要件IDで5分類が一度ずつ並び、空入力は単位を生まない", () => {
    for (const id of Object.keys(gradRequirementData) as RequirementId[]) {
      const report = checkGraduation([], id, undefined, "five-category");
      expect(report.categories.map((item) => item.category), id).toEqual(categoryOrder);
      expect(report.summary.earnedUnits, id).toBe(0);
      expect(report.summary.isSatisfied, id).toBe(false);
    }
  });
});
