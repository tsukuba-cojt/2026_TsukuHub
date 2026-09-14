import { describe, expect, test } from "vitest";
import { gradeBreakdown } from "../gradeBreakdown";
import { course } from "./helpers";

describe("gradeBreakdown", () => {
  test("凡例は全科目ベース、中央のA率はP・認・履修中を除く", () => {
    const breakdown = gradeBreakdown([
      course("1", "a", 2, "A+"),
      course("2", "b", 2, "A"),
      course("3", "c", 2, "B"),
      course("4", "d", 2, "D"),
      course("5", "e", 2, "P"),
      course("6", "f", 2, "認"),
      course("7", "g", 2, "履修中"),
    ]);

    expect(breakdown.totalCount).toBe(7);
    expect(breakdown.gradedCount).toBe(4);
    expect(breakdown.aCount).toBe(2);
    expect(breakdown.aRatePercent).toBeCloseTo(50, 10);
    expect(breakdown.slices.find((slice) => slice.grade === "A+")?.percent).toBeCloseTo(
      100 / 7,
      10
    );
    expect(breakdown.slices.find((slice) => slice.grade === "D")?.count).toBe(1);
  });

  test("D・Fは中央の分母に含める", () => {
    const breakdown = gradeBreakdown([
      course("1", "a", 2, "A"),
      course("2", "b", 2, "F"),
    ]);
    expect(breakdown.gradedCount).toBe(2);
    expect(breakdown.aRatePercent).toBeCloseTo(50, 10);
  });

  test("対象がなければ null", () => {
    expect(gradeBreakdown([]).aRatePercent).toBeNull();
    expect(gradeBreakdown([course("1", "a", 2, "履修中")]).aRatePercent).toBeNull();
  });
});
