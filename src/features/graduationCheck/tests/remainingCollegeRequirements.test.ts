import { describe, expect, test } from "vitest";
import { checkGraduation } from "../tsukuba";
import { findDepartment, resolveRequirementId } from "../tsukuba/data/supportedDepartments";
import type { RequirementId } from "../core/types";

type RequirementCase = [RequirementId, number[], number];

describe("人文・文化、社会・国際、人間系の卒業要件", () => {
  test.each([
    ["humanities-philosophy-22", [28, 44, 11, 1, 6], 124],
    ["humanities-history-22", [28, 44, 11, 1, 6], 124],
    ["humanities-archaeology-22", [28, 44, 11, 1, 6], 124],
    ["humanities-linguistics-22", [28, 44, 11, 1, 6], 124],
    ["comparative-culture-22", [29, 44, 11, 1, 6], 124],
    ["japanese-culture-22", [26, 43, 14, 1, 6], 124],
    ["social-sociology-22", [32, 49, 8, 1, 12], 126],
    ["social-law-22", [20, 61, 8, 1, 12], 126],
    ["social-politics-22", [20, 61, 8, 1, 12], 126],
    ["social-economics-22", [20, 61, 8, 1, 12], 126],
    ["international-relations-22", [26, 38, 14, 1, 6], 126],
    ["international-development-22", [26, 38, 14, 1, 6], 126],
    ["education-22", [38, 42, 0, 1, 6], 124],
    ["psychology-22", [59, 21, 0, 1, 6], 124],
    ["disability-22", [46, 32, 0, 1, 6], 124],
  ] satisfies RequirementCase[])("%s は公式表の単位内訳を持つ", (id, categories, total) => {
    const report = checkGraduation([], id);
    expect(report.categories.map((category) => category.requiredUnits)).toEqual(categories);
    expect(report.summary.requiredUnits).toBe(total);
  });
});

describe("医学、体育、芸術系の卒業要件", () => {
  test.each([
    ["medicine-22", [186, 0, 5, 1, 7], 199],
    ["new-medicine-22", [186, 0, 5, 1, 7], 199],
    ["nursing-22", [118, 0, 1, 1, 4], 124],
    ["public-health-nursing-22", [131, 0, 1, 1, 4], 137],
    ["medical-science-22", [109, 6, 5, 1, 6], 127],
    ["international-medical-science-22", [35, 55, 27, 1, 6], 124],
    ["physical-education-22", [33, 28, 31, 1, 12], 124],
    ["art-studies-22", [28, 50, 13, 1, 6], 124],
    ["japanese-art-22", [41, 50, 12, 1, 6], 136],
  ] satisfies RequirementCase[])("%s は公式表の単位内訳を持つ", (id, categories, total) => {
    const report = checkGraduation([], id);
    expect(report.categories.map((category) => category.requiredUnits)).toEqual(categories);
    expect(report.summary.requiredUnits).toBe(total);
  });
});

describe("追加した13学類・専門学群の選択肢", () => {
  test("指定された13区分がすべて選べる", () => {
    const keys = [
      "humanities", "comparative-culture", "japanese-culture", "social", "international",
      "education", "psychology", "disability", "medicine", "nursing", "medical-science",
      "physical-education", "art",
    ];
    expect(keys.every((key) => findDepartment(key) !== undefined)).toBe(true);
  });

  test("全専攻で2022〜2026年度を解決できる", () => {
    const keys = [
      "humanities", "comparative-culture", "japanese-culture", "social", "international",
      "education", "psychology", "disability", "medicine", "nursing", "medical-science",
      "physical-education", "art",
    ];
    for (const key of keys) {
      const department = findDepartment(key);
      expect(department).toBeDefined();
      for (const major of department?.majors ?? []) {
        for (const year of [2022, 2023, 2024, 2025, 2026]) {
          expect(resolveRequirementId(key, major.key, year)).not.toBeNull();
        }
      }
    }
  });
});
