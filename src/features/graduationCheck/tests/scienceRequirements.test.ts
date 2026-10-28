import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import type { RequirementId } from "../types";
import { course } from "./helpers";

describe("数学類・物理学類の卒業要件", () => {
  test("数学類は公式表の区分下限と選択科目全体92単位を別々に保持する", () => {
    const report = checkGraduation([], "math-22");

    expect(report.requirement).toMatchObject({
      department: "数学類",
      major: "数学",
      enrollYear: "2022~2026",
    });

    expect(report.categories.map((category) => category.requiredUnits)).toEqual([
      32,
      46,
      15,
      1,
      6,
    ]);
    expect(report.summary.requiredUnits).toBe(124);
    expect(
      report.details.requirementItems
        .filter((item) => item.kind === "select")
        .map((item) => item.minimumUnits),
    ).toEqual([46, 15, 1, 0, 6]);
  });

  test.each([
    ["physics-24", [5, 5, 2]],
    ["physics-25", [6, 5, 2]],
  ] satisfies [RequirementId, number[]][])(
    "%s は公式表の区分下限と専門小区分を保持する",
    (requirementId, specializedMinimums) => {
      const report = checkGraduation([], requirementId);

      expect(report.categories.map((category) => category.requiredUnits)).toEqual([
        33,
        35,
        25,
        1,
        6,
      ]);
      expect(report.summary.requiredUnits).toBe(124);
      expect(
        report.details.selectResults[0].minimumIncludedResults?.map((item) => item.minimum),
      ).toEqual(specializedMinimums);
    },
  );
});

describe("化学類の卒業要件", () => {
  test.each([
    ["chem-22", 43, 81, [43, 41, 17, 1, 9]],
    ["chem-23", 42.5, 81.5, [42.5, 42, 17, 1, 9]],
    ["chem-25", 42, 82, [42, 42, 17, 1, 9]],
  ] satisfies [RequirementId, number, number, number[]][])(
    "%s は公式表の必修・選択・区分別最低単位を持つ",
    (requirementId, compulsory, select, categoryMinimums) => {
      const report = checkGraduation([], requirementId);

      expect(report.categories.map((category) => category.requiredUnits)).toEqual(
        categoryMinimums
      );
      expect(report.summary.requiredUnits).toBe(compulsory + select);
      expect(report.summary.requiredUnits).toBe(124);
    }
  );

  test("2026年度の化学基礎セミナーは専門ではなく専門基礎へ数える", () => {
    const report = checkGraduation(
      [course("FE11012", "化学基礎セミナー", 1)],
      "chem-26"
    );
    const [, specialized, foundation] = report.categories;

    expect(specialized.earnedUnits).toBe(0);
    expect(foundation.earnedUnits).toBe(1);
  });
});

describe("応用理工学類の卒業要件", () => {
  const oldIds: RequirementId[] = [
    "applied-physics-22",
    "applied-electron-22",
    "applied-materials-22",
    "applied-molecule-22",
  ];
  const modernIds: RequirementId[] = [
    "applied-physics-24",
    "applied-electron-24",
    "applied-materials-24",
    "applied-molecule-24",
  ];

  test.each(oldIds)("%s は2022〜2023年度の66必修・58選択を持つ", (id) => {
    const report = checkGraduation([], id);
    expect(report.categories.map((category) => category.requiredUnits)).toEqual([
      66,
      35,
      6,
      1,
      12,
    ]);
    expect(report.summary.requiredUnits).toBe(124);
  });

  test.each(modernIds)("%s は2024〜2026年度の49必修・75選択を持つ", (id) => {
    const report = checkGraduation([], id);
    expect(report.categories.map((category) => category.requiredUnits)).toEqual([
      49,
      35,
      21,
      1,
      12,
    ]);
    expect(report.summary.requiredUnits).toBe(124);
  });

  test("FF15科目を他主専攻科目へ誤分類せず専門基礎へ数える", () => {
    const report = checkGraduation(
      [
        course("FF15001", "応用理工基礎科目", 6),
        course("FF35001", "電子・量子工学科目", 4),
      ],
      "applied-physics-24"
    );
    const [, specialized, foundation] = report.categories;
    const otherMajorRule = report.details.selectResults.find(
      (result) => result.message === "実習・輪講・他主専攻科目"
    );

    // 主専攻の必須小区分が不足しているため区分の進捗値は0だが、
    // FF35は他主専攻科目の規則へ正しく分類される。
    expect(specialized.earnedUnits).toBe(0);
    expect(otherMajorRule?.courses.map((item) => item.id)).toEqual(["FF35001"]);
    expect(foundation.earnedUnits).toBe(6);
  });
});
