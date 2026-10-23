import { describe, expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { gradRequirementData } from "../data/gradRequirementData";
import type { RequirementId } from "../types";
import { course } from "./helpers";

describe("2024年度公式要件の基準値", () => {
  test("情報メディア創成学類の区分別単位数を保持する", () => {
    const requirement = gradRequirementData["mast-22"];

    expect(requirement.header).toMatchObject({
      department: "情報メディア創成学類",
      major: "情報メディア創成",
      enrollYear: "2022~2024",
    });
    expect(requirement.courses.compulsorySumUnit).toBe(50);
    expect(requirement.courses.selectMinimumUnit).toBe(74);
    expect(requirement.courses.groups).toEqual([
      [0, 20, 35, "専門科目選択"],
      [1, 32, 47, "専門基礎科目選択"],
      [2, 1, 10, "共通科目選択"],
      [3, 6, 15, "関連科目選択"],
    ]);
    expect(requirement.courses.compulsory).toEqual(
      expect.arrayContaining([
        "卒業研究A",
        "卒業研究B",
        "情報メディア実験A",
        "情報メディア実験B",
        "コンピュータシステムとOS",
        "データ構造とアルゴリズム実習",
        "データ工学概論",
      ]),
    );
  });

  test.each([
    ["klis-ksc-22", "知識科学", "GE6", "知識科学実習A"],
    [
      "klis-kis-22",
      "知識情報システム",
      "GE7",
      "知識情報システム実習A",
    ],
    ["klis-irm-22", "情報資源経営", "GE8", "情報資源経営実習A"],
  ] as const)(
    "知識情報・図書館学類 %s の区分別単位数を保持する",
    (requirementId, major, principalPrefix, compulsoryName) => {
      const requirement = gradRequirementData[requirementId as RequirementId];

      expect(requirement.header).toMatchObject({
        department: "知識情報・図書館学類",
        major,
        enrollYear: "2022~2024",
      });
      expect(requirement.courses.compulsorySumUnit).toBe(41);
      expect(requirement.courses.selectMinimumUnit).toBe(83);
      expect(requirement.courses.groups).toEqual([
        [0, 24, 44, "専門科目選択"],
        [1, 32, 52, "専門基礎科目選択"],
        [2, 1, 21, "共通科目選択"],
        [3, 6, 26, "関連科目選択"],
      ]);
      expect(requirement.courses.select[0][0]).toEqual([principalPrefix]);
      expect(requirement.courses.compulsory).toContain(compulsoryName);
    },
  );

  test.each([
    ["klis-ksc-22", "GE61234", "知識科学実習A"],
    ["klis-kis-22", "GE71234", "知識情報システム実習A"],
    ["klis-irm-22", "GE81234", "情報資源経営実習A"],
  ] as const)(
    "知識情報・図書館学類 %s の代表科目を実行時に正しく割り当てる",
    (requirementId, specializedCode, compulsoryName) => {
      const compulsory = course("GE00001", compulsoryName, 1, "A");
      const specialized = course(
        specializedCode,
        "主専攻の専門選択科目",
        2,
        "A",
      );
      const specializedFoundation = course(
        "GA11234",
        "専門基礎選択科目",
        2,
        "A",
      );
      const common = course("1226011", "学士基盤科目", 1, "A");
      const related = course("GB12345", "関連科目", 2, "A");
      const recognized = course("", "区分不明の認定科目", 2, "認");

      const report = checkGraduation(
        [
          compulsory,
          specialized,
          specializedFoundation,
          common,
          related,
          recognized,
        ],
        requirementId,
      );
      const categories = collectCategoryCourses(report);

      expect(categories.compulsory).toContain(compulsory);
      expect(categories.specialized).toContain(specialized);
      expect(categories.specializedFoundation).toContain(
        specializedFoundation,
      );
      expect(categories.common).toContain(common);
      expect(categories.related).toContain(related);
      expect(report.details.uncountedCourses).toEqual([recognized]);
    },
  );

  test("情報メディア創成学類は共通科目合計と学士基盤科目を別々に判定する", () => {
    const otherCommon = checkGraduation(
      [course("3100001", "外国語科目", 1, "A")],
      "mast-22",
    );
    const commonCategory = otherCommon.categories.find(
      (category) => category.category === "common",
    );
    const bachelorFoundation = otherCommon.details.requirementItems.find(
      (item) => item.label === "学士基盤科目",
    );

    expect(commonCategory).toMatchObject({
      earnedUnits: 1,
      requiredUnits: 1,
      isSatisfied: false,
      unsatisfiedRequirementCount: 1,
    });
    expect(bachelorFoundation).toMatchObject({
      minimumUnits: 1,
      earnedUnits: 0,
      isSatisfied: false,
    });

    const bachelorOnly = checkGraduation(
      [course("1226011", "学士基盤科目", 1, "A")],
      "mast-22",
    );
    expect(
      bachelorOnly.categories.find((category) => category.category === "common"),
    ).toMatchObject({ earnedUnits: 1, requiredUnits: 1, isSatisfied: true });
    expect(bachelorOnly.summary.requiredUnits).toBe(124);
    expect(bachelorOnly.summary.earnedUnits).toBe(1);
  });

  test("情報メディア創成学類は関連科目合計だけで他学群要件を充足扱いにしない", () => {
    const report = checkGraduation(
      [course("GB12345", "GBの関連科目", 6, "A")],
      "mast-22",
    );

    expect(
      report.categories.find((category) => category.category === "related"),
    ).toMatchObject({ earnedUnits: 6, requiredUnits: 6, isSatisfied: false });
    expect(
      report.details.requirementItems.find(
        (item) => item.label === "他学群の授業科目",
      ),
    ).toMatchObject({ minimumUnits: 6, earnedUnits: 0, isSatisfied: false });
  });

  test.each([
    ["klis-ksc-22", "GE61234"],
    ["klis-kis-22", "GE71234"],
    ["klis-irm-22", "GE81234"],
  ] as const)(
    "知識情報・図書館学類 %s は自主専攻16単位とその他指定8単位を別々に判定する",
    (requirementId, principalCode) => {
      const report = checkGraduation(
        [course(principalCode, "自主専攻科目", 24, "A")],
        requirementId,
      );
      const specialized = report.categories.find(
        (category) => category.category === "specialized",
      );
      const specializedItems = report.details.requirementItems.filter(
        (item) => item.category === "specialized",
      );

      expect(specialized).toMatchObject({
        earnedUnits: 24,
        requiredUnits: 24,
        isSatisfied: false,
        unsatisfiedRequirementCount: 1,
      });
      expect(specializedItems.map((item) => item.minimumUnits)).toEqual([16, 8]);
      expect(specializedItems.map((item) => item.isSatisfied)).toEqual([
        true,
        false,
      ]);
    },
  );
});
