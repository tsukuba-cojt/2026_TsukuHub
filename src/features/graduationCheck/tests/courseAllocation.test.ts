import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { course } from "./helpers";

describe("科目割り当ての監査情報", () => {
  test("最終割り当てと、定義順で消費される前の候補を残す", () => {
    const report = checkGraduation(
      [course("GC51234", "専門科目", 2), course("ZZ00001", "自由科目", 1)],
      "mast-22"
    );
    const specialized = report.details.allocationTraces.find(
      (trace) => trace.course.id === "GC51234"
    );
    const related = report.details.allocationTraces.find(
      (trace) => trace.course.id === "ZZ00001"
    );

    expect(specialized?.assigned).toMatchObject({
      kind: "select",
      label: "GC5, GA4",
      category: "specialized",
    });
    expect(specialized?.selectCandidates.length).toBeGreaterThanOrEqual(1);
    expect(related?.assigned).toMatchObject({
      kind: "select",
      label: "他学群の授業科目",
      category: "related",
    });
  });

  test("科目番号がない認定単位は関連科目へ推測配分せず未分類にする", () => {
    const recognizedCredit = course("", "編入学時の認定科目", 2, "認");
    const report = checkGraduation([recognizedCredit], "mast-22");

    expect(report.details.uncountedCourses).toEqual([recognizedCredit]);
    expect(report.details.allocationTraces[0].assigned).toEqual({
      kind: "uncounted",
    });
    expect(report.details.allocationTraces[0].selectCandidates).toEqual([]);
    expect(
      report.details.selectResults.flatMap((result) => result.courses),
    ).toEqual([]);
    expect(report.summary.earnedUnits).toBe(0);
  });

  test("科目番号がない認定単位でも必修科目名が一致すれば必修を優先する", () => {
    const recognizedCredit = course("", "卒業研究A", 3, "認");
    const report = checkGraduation([recognizedCredit], "mast-22");

    expect(report.details.uncountedCourses).toEqual([]);
    expect(
      report.details.compulsoryResults.find(
        (result) => result.name === "卒業研究A",
      )?.courses,
    ).toEqual([recognizedCredit]);
    expect(report.details.allocationTraces[0].assigned).toMatchObject({
      kind: "compulsory",
      label: "卒業研究A",
    });
  });

  test("必修科目も割り当て元の要件名まで追跡できる", () => {
    const report = checkGraduation(
      [course("GC00001", "卒業研究A", 3)],
      "mast-22"
    );
    expect(report.details.allocationTraces[0].assigned).toMatchObject({
      kind: "compulsory",
      label: "卒業研究A",
    });
  });
});
