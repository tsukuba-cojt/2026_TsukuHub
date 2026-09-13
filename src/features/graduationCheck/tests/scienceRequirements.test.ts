import { describe, expect, test } from "vitest";
import { checkGraduation } from "../tsukuba";
import type { RequirementId } from "../core/types";
import { course } from "./helpers";

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

  test("2025年度の化学基礎セミナーは専門ではなく専門基礎へ数える", () => {
    const report = checkGraduation(
      [course("FE12001", "化学基礎セミナー", 1)],
      "chem-25"
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
