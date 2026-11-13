import { describe, expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { gradRequirementData } from "../data/gradRequirementData";
import type { RequirementId } from "../types";
import { course } from "./helpers";

type RequirementCase = [RequirementId, number[]];

describe("生命環境学群の卒業要件", () => {
  test.each([
    ["biology-22", [44, 40, 0, 1, 17]],
    ["biology-24", [40, 40, 0, 1, 21]],
    ["bioresources-22", [30, 53, 17, 1, 10]],
    ["bioresources-24", [29, 53, 18, 1, 10]],
    ["bioresources-25", [29, 53, 18, 1, 10]],
    ["bioresources-26", [29, 53, 18, 1, 10]],
    ["bioresources-interdisciplinary-22", [29, 45, 14, 1, 13]],
    ["bioresources-interdisciplinary-24", [28, 45, 15, 1, 13]],
    ["bioresources-interdisciplinary-25", [28, 45, 15, 1, 13]],
    ["earth-environment-22", [29, 45, 14, 1, 13]],
    ["earth-environment-24", [33, 40, 18, 1, 4]],
    ["earth-environment-26", [32, 41, 16, 1, 6]],
    ["earth-evolution-22", [30, 40, 15, 1, 13]],
    ["earth-evolution-24", [33, 40, 18, 1, 4]],
    ["earth-evolution-26", [33, 40, 16, 1, 6]],
    ["earth-interdisciplinary-22", [43, 47, 10, 1, 13]],
    ["earth-interdisciplinary-24", [41.5, 47, 11.5, 1, 9]],
  ] satisfies RequirementCase[])(
    "%s は公式表の区分別最低単位と合計124単位を持つ",
    (requirementId, minimums) => {
      const report = checkGraduation([], requirementId);

      expect(report.categories.map((category) => category.requiredUnits)).toEqual(
        minimums
      );
      expect(report.summary.requiredUnits).toBe(124);
    }
  );

  test.each([
    ["earth-environment-24", [10, 0]],
    ["earth-evolution-24", [18, 9]],
    ["earth-environment-26", [10, 1, 0]],
    ["earth-evolution-26", [18, 9]],
  ] satisfies Array<[RequirementId, number[]]>)(
    "%s は分野別の専門科目最低単位を保持する",
    (requirementId, minimums) => {
      const report = checkGraduation([], requirementId);

      expect(
        report.details.requirementItems
          .filter((item) => item.category === "specialized")
          .map((item) => item.minimumUnits),
      ).toEqual(minimums);
    },
  );

  test("2024年度の科目名指定科目はEE1でも専門科目へ分類する", () => {
    const namedSpecialized = course(
      "EE11881",
      "地球基礎数学・物理学",
      1,
      "A",
      2024,
    );
    const report = checkGraduation(
      [namedSpecialized],
      "earth-environment-24",
    );
    const categories = collectCategoryCourses(report);

    expect(categories.specialized).toContain(namedSpecialized);
    expect(categories.specializedFoundation).not.toContain(namedSpecialized);
  });

  test("地球学類の必修英語名と2026年度地球環境学の年度差を保持する", () => {
    const environment2024 =
      gradRequirementData["earth-environment-24"].courses.compulsory;
    const environment2026 =
      gradRequirementData["earth-environment-26"].courses.compulsory;
    const evolution2026 =
      gradRequirementData["earth-evolution-26"].courses.compulsory;

    expect(environment2024).toEqual(
      expect.arrayContaining([
        "地球学専門英語1A",
        "地球学専門英語1B",
        "地球学専門英語2A",
        "地球学専門英語2B",
      ]),
    );
    expect(environment2024).not.toEqual(
      expect.arrayContaining(["地球科学専門実習2A", "地球科学専門実習2B"]),
    );
    expect(environment2026).toContain("地球学専門英語2A");
    expect(environment2026).not.toContain("地球学専門英語2B");
    expect(evolution2026).toContain("地球学専門英語2B");
  });

  test("2024年度の指定関連科目は最低4単位を個別判定する", () => {
    const otherRelated = course("X000001", "その他の関連科目", 4, "A", 2024);
    const report = checkGraduation(
      [otherRelated],
      "earth-environment-24",
    );
    const related = report.categories.find(
      (category) => category.category === "related",
    );

    expect(collectCategoryCourses(report).related).toContain(otherRelated);
    expect(related).toMatchObject({
      requiredUnits: 4,
      earnedUnits: 0,
      isSatisfied: false,
      unsatisfiedRequirementCount: 1,
    });
  });
});

describe("社会工学類の卒業要件", () => {
  test.each([
    ["policy-economics-22", [29, 52, 11, 1, 6]],
    ["policy-engineering-22", [31, 50, 11, 1, 6]],
    ["policy-urban-22", [36, 45, 11, 1, 6]],
  ] satisfies RequirementCase[])(
    "%s は公式表の区分別最低単位と合計124単位を持つ",
    (requirementId, minimums) => {
      const report = checkGraduation([], requirementId);

      expect(report.categories.map((category) => category.requiredUnits)).toEqual(
        minimums
      );
      expect(report.summary.requiredUnits).toBe(124);
    }
  );
});
