import { describe, expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { findDepartment, resolveRequirementId } from "../data/supportedDepartments";
import type { RequirementId } from "../types";
import { course } from "./helpers";

type RequirementCase = [RequirementId, number[], number];

describe("人文・文化、社会・国際、人間系の卒業要件", () => {
  test.each([
    ["humanities-philosophy-22", [28, 44, 11, 1, 6], 124],
    ["humanities-history-22", [28, 44, 11, 1, 6], 124],
    ["humanities-archaeology-22", [28, 44, 11, 1, 6], 124],
    ["humanities-linguistics-22", [28, 44, 11, 1, 6], 124],
    ["comparative-culture-23", [29, 44, 11, 1, 6], 124],
    ["comparative-culture-26", [29, 44, 11, 1, 6], 124],
    ["japanese-culture-22", [26, 43, 14, 1, 6], 124],
    ["japanese-culture-23", [26, 48, 16, 1, 6], 124],
    ["japanese-culture-26", [26, 43, 14, 1, 6], 124],
    ["social-sociology-22", [32, 49, 8, 1, 12], 126],
    ["social-sociology-23", [32, 49, 8, 1, 12], 126],
    ["social-law-22", [20, 61, 8, 1, 12], 126],
    ["social-law-23", [20, 61, 8, 1, 12], 126],
    ["social-politics-22", [20, 61, 8, 1, 12], 126],
    ["social-politics-23", [20, 61, 8, 1, 12], 126],
    ["social-economics-22", [20, 61, 8, 1, 12], 126],
    ["social-economics-23", [20, 61, 8, 1, 12], 126],
    ["international-relations-22", [26, 38, 14, 1, 6], 126],
    ["international-relations-23", [26, 38, 14, 1, 6], 126],
    ["international-development-22", [26, 38, 14, 1, 6], 126],
    ["international-development-23", [26, 38, 14, 1, 6], 126],
    ["education-22", [38, 42, 0, 1, 6], 124],
    ["education-23", [38, 42, 0, 1, 6], 124],
    ["psychology-22", [59, 21, 0, 1, 6], 124],
    ["disability-22", [46, 32, 0, 1, 6], 124],
  ] satisfies RequirementCase[])("%s は公式表の単位内訳を持つ", (id, categories, total) => {
    const report = checkGraduation([], id);
    expect(report.categories.map((category) => category.requiredUnits)).toEqual(categories);
    expect(report.summary.requiredUnits).toBe(total);
  });

  test.each([
    "humanities-philosophy-22",
    "social-sociology-22",
    "education-22",
  ] satisfies RequirementId[])(
    "%s は他の共通科目だけで学士基盤科目要件を満たさない",
    (requirementId) => {
      const otherCommon = checkGraduation(
        [course("2000001", "選択体育", 1, "A", 2024)],
        requirementId,
      );
      const bachelorFoundation = otherCommon.details.requirementItems.find(
        (item) => item.label === "学士基盤科目",
      );

      expect(bachelorFoundation).toMatchObject({
        minimumUnits: 1,
        earnedUnits: 0,
        isSatisfied: false,
      });

      const bachelor = checkGraduation(
        [course("1200001", "学士基盤科目", 1, "A", 2024)],
        requirementId,
      );
      expect(
        bachelor.details.requirementItems.find(
          (item) => item.label === "学士基盤科目",
        ),
      ).toMatchObject({ earnedUnits: 1, isSatisfied: true });
    },
  );

  test("人文学類は関連科目2系統の最低単位を個別に判定する", () => {
    const firstFamily = course("AA20001", "第1系統の関連科目", 6, "A", 2024);
    const report = checkGraduation(
      [firstFamily],
      "humanities-philosophy-22",
    );
    const relatedItems = report.details.requirementItems.filter(
      (item) => item.category === "related",
    );

    expect(relatedItems.map((item) => item.minimumUnits)).toEqual([4, 2, 0, 0, 0]);
    expect(relatedItems.map((item) => item.isSatisfied)).toEqual([
      true,
      false,
      true,
      true,
      true,
    ]);
    expect(
      report.categories.find((category) => category.category === "related"),
    ).toMatchObject({ requiredUnits: 6, isSatisfied: false });
  });

  test("社会学類は関連科目2系統の最低単位を個別に判定する", () => {
    const firstFamily = course("E000001", "E系の関連科目", 12, "A", 2024);
    const report = checkGraduation([firstFamily], "social-sociology-22");
    const relatedItems = report.details.requirementItems.filter(
      (item) => item.category === "related",
    );

    expect(relatedItems.map((item) => item.minimumUnits)).toEqual([2, 10, 0, 0]);
    expect(
      report.categories.find((category) => category.category === "related"),
    ).toMatchObject({ requiredUnits: 12, isSatisfied: false });
  });

  test.each([
    ["social-sociology-22", "BB10001", [30, 12, 6, 19]],
    ["social-law-22", "BB20001", [40, 4, 6, 21, 0]],
    ["social-politics-22", "BB31001", [24, 6, 31]],
    ["social-economics-22", "BB40001", [32, 4, 8, 29]],
  ] satisfies [RequirementId, string, number[]][])(
    "%s は主専攻別の専門科目最低単位を個別に判定する",
    (requirementId, courseNumber, minimumUnits) => {
      const report = checkGraduation(
        [course(courseNumber, "専門科目", 61, "A", 2024)],
        requirementId,
      );
      const specializedItems = report.details.requirementItems.filter(
        (item) => item.category === "specialized",
      );

      expect(specializedItems.map((item) => item.minimumUnits)).toEqual(
        minimumUnits,
      );
      expect(
        report.categories.find(
          (category) => category.category === "specialized",
        ),
      ).toMatchObject({ isSatisfied: false });
    },
  );

  test.each([
    ["international-relations-23", "BC12001"],
    ["international-development-23", "BC11001"],
  ] satisfies [RequirementId, string][])(
    "%s は他主専攻側の専門科目だけでは14単位条件を満たさない",
    (requirementId, courseNumber) => {
      const report = checkGraduation(
        [course(courseNumber, "他主専攻側の専門科目", 38, "A", 2024)],
        requirementId,
      );
      const specializedItems = report.details.requirementItems.filter(
        (item) => item.category === "specialized",
      );

      expect(specializedItems.map((item) => item.minimumUnits)).toEqual([
        32, 14, 6, 0,
      ]);
      expect(specializedItems[1]).toMatchObject({
        earnedUnits: 0,
        isSatisfied: false,
      });
    },
  );

  test("国際総合学類のBC13は専門科目へ分類し6単位条件を判定する", () => {
    const specialized = course("BC13001", "専門科目", 2, "A", 2024);
    const report = checkGraduation(
      [specialized],
      "international-relations-23",
    );
    const categories = collectCategoryCourses(report);

    expect(categories.specialized).toContain(specialized);
    expect(categories.specializedFoundation).not.toContain(specialized);
    expect(
      report.details.requirementItems.find(
        (item) => item.label === "国際専門科目（BC13）",
      ),
    ).toMatchObject({ minimumUnits: 6, earnedUnits: 2, isSatisfied: false });
  });

  test("教職・博物館科目を人文学類の関連科目へ数える", () => {
    const teaching = course("9000001", "教職科目", 2, "A", 2024);
    const museum = course("9900001", "博物館科目", 2, "A", 2024);
    const report = checkGraduation(
      [teaching, museum],
      "humanities-philosophy-22",
    );

    expect(collectCategoryCourses(report).related).toEqual([
      teaching,
      museum,
    ]);
  });

  test("教育学類はCC・CE科目を専門科目の追加枠へ分類する", () => {
    const specialized = course("CB20001", "教育学専門科目", 2, "A", 2024);
    const related = course("CC50001", "心理学類科目", 2, "A", 2024);
    const report = checkGraduation(
      [specialized, related],
      "education-23",
    );
    const categories = collectCategoryCourses(report);

    expect(categories.specialized).toContain(specialized);
    expect(categories.specialized).toContain(related);
    expect(categories.related).not.toContain(related);
  });

  test("心理学類はCC27の6単位条件を専門合計と別に判定する", () => {
    const report = checkGraduation(
      [course("CC50001", "その他の心理学専門科目", 21, "A", 2024)],
      "psychology-22",
    );
    const specializedItems = report.details.requirementItems.filter(
      (item) => item.category === "specialized",
    );

    expect(specializedItems.map((item) => item.minimumUnits)).toEqual([21, 6, 0]);
    expect(
      report.categories.find(
        (category) => category.category === "specialized",
      ),
    ).toMatchObject({ requiredUnits: 21, isSatisfied: false });
  });

  test("心理学類は卒業要件外と明記された教職2科目を数えない", () => {
    const excluded = [
      course("9000001", "こころの発達", 2, "A", 2024),
      course("9000002", "学習の心理", 2, "A", 2024),
    ];
    const report = checkGraduation(excluded, "psychology-22");

    expect(report.details.uncountedCourses).toEqual(excluded);
  });

  test("障害科学類2022は専門32単位と指定2群各4単位を個別に判定する", () => {
    const report = checkGraduation(
      [course("CE20001", "その他の障害科学専門科目", 32, "A", 2024)],
      "disability-22",
    );
    const specializedItems = report.details.requirementItems.filter(
      (item) => item.category === "specialized",
    );

    expect(specializedItems.map((item) => item.minimumUnits)).toEqual([32, 4, 4, 0]);
    expect(specializedItems.map((item) => item.isSatisfied)).toEqual([
      true,
      false,
      false,
      true,
    ]);
    expect(
      report.categories.find(
        (category) => category.category === "specialized",
      ),
    ).toMatchObject({ requiredUnits: 32, isSatisfied: false });
  });
});

describe("医学、体育、芸術系の卒業要件", () => {
  test.each([
    ["medicine-22", [186, 0, 5, 1, 7], 199],
    ["medicine-26", [186, 0, 5, 1, 7], 199],
    ["new-medicine-22", [186, 0, 5, 1, 7], 199],
    ["new-medicine-26", [186, 0, 5, 1, 7], 199],
    ["nursing-22", [118, 0, 1, 1, 4], 124],
    ["nursing-25", [118, 0, 1, 1, 4], 124],
    ["nursing-26", [118, 0, 1, 1, 4], 124],
    ["public-health-nursing-22", [131, 0, 1, 1, 4], 137],
    ["public-health-nursing-25", [131, 0, 1, 1, 4], 137],
    ["public-health-nursing-26", [131, 0, 1, 1, 4], 137],
    ["medical-science-22", [109, 6, 5, 1, 6], 127],
    ["medical-science-24", [109, 6, 5, 1, 6], 127],
    ["medical-science-25", [109, 6, 5, 1, 6], 127],
    ["medical-science-26", [109, 6, 5, 1, 6], 127],
    ["international-medical-science-22", [35, 55, 27, 1, 6], 124],
    ["international-medical-science-24", [35, 55, 27, 1, 6], 124],
    ["international-medical-science-25", [35, 55, 27, 1, 6], 124],
    ["international-medical-science-26", [35, 55, 27, 1, 6], 124],
    ["physical-education-22", [33, 28, 31, 1, 12], 124],
    ["art-studies-22", [28, 50, 13, 1, 6], 124],
    ["japanese-art-22", [41, 50, 12, 1, 6], 136],
  ] satisfies RequirementCase[])("%s は公式表の単位内訳を持つ", (id, categories, total) => {
    const report = checkGraduation([], id);
    expect(report.categories.map((category) => category.requiredUnits)).toEqual(categories);
    expect(report.summary.requiredUnits).toBe(total);
  });

  test.each([
    "medicine-22",
    "nursing-22",
    "physical-education-22",
    "art-studies-22",
  ] satisfies RequirementId[])(
    "%s は他の共通科目だけで学士基盤科目要件を満たさない",
    (requirementId) => {
      const report = checkGraduation(
        [course("2000001", "選択体育", 1, "A", 2024)],
        requirementId,
      );

      expect(
        report.details.requirementItems.find(
          (item) => item.label === "学士基盤科目",
        ),
      ).toMatchObject({ earnedUnits: 0, isSatisfied: false });
    },
  );
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

  test("全専攻で宣言した対応年度を解決できる", () => {
    const keys = [
      "humanities", "comparative-culture", "japanese-culture", "social", "international",
      "education", "psychology", "disability", "medicine", "nursing", "medical-science",
      "physical-education", "art",
    ];
    for (const key of keys) {
      const department = findDepartment(key);
      expect(department).toBeDefined();
      for (const major of department?.majors ?? []) {
        const admissionYears = major.requirements.flatMap(
          (requirement) => requirement.admissionYears,
        );
        expect(admissionYears.length).toBeGreaterThan(0);
        for (const year of admissionYears) {
          expect(resolveRequirementId(key, major.key, year)).not.toBeNull();
        }
      }
    }
  });
});
