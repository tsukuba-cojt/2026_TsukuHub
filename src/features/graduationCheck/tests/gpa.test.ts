import { describe, expect, test } from "vitest";
import { calcARatePercent, calcGpa } from "../core/gpa";
import { course } from "./helpers";

describe("calcGpa", () => {
  test("A+=4.3 A=4.0 B=3.0 C=2.0 D=0.0 の単位加重平均", () => {
    const courses = [
      course("1", "a", 2, "A+"), // 8.6
      course("2", "b", 2, "A"), // 8.0
      course("3", "c", 2, "B"), // 6.0
      course("4", "d", 2, "C"), // 4.0
      course("5", "e", 2, "D"), // 0.0
    ];
    const { value, targetUnits } = calcGpa(courses);
    expect(targetUnits).toBe(10);
    expect(value).toBeCloseTo(26.6 / 10, 10);
  });

  test("P・認・履修中はGPAから除外する", () => {
    const courses = [
      course("1", "a", 2, "A"),
      course("2", "b", 10, "P"),
      course("3", "c", 10, "認"),
      course("4", "d", 10, "履修中"),
    ];
    const { value, targetUnits } = calcGpa(courses);
    expect(targetUnits).toBe(2);
    expect(value).toBeCloseTo(4.0, 10);
  });

  test("対象科目がなければ null", () => {
    expect(calcGpa([course("1", "a", 2, "P")]).value).toBeNull();
    expect(calcGpa([]).value).toBeNull();
  });
});

describe("calcARatePercent", () => {
  test("A+とAの単位数 ÷ 合格評価(A+/A/B/C)の単位数 × 100", () => {
    const courses = [
      course("1", "a", 2, "A+"),
      course("2", "b", 2, "A"),
      course("3", "c", 2, "B"),
      course("4", "d", 2, "C"),
    ];
    expect(calcARatePercent(courses)).toBeCloseTo(50, 10);
  });

  test("D・F・P・認・履修中は分母にも分子にも含めない", () => {
    const courses = [
      course("1", "a", 2, "A"),
      course("2", "b", 2, "B"),
      course("3", "c", 10, "D"),
      course("4", "d", 10, "F"),
      course("5", "e", 10, "P"),
      course("6", "f", 10, "認"),
      course("7", "g", 10, "履修中"),
    ];
    expect(calcARatePercent(courses)).toBeCloseTo(50, 10);
  });

  test("対象科目がなければ null", () => {
    expect(calcARatePercent([course("1", "a", 2, "D")])).toBeNull();
  });
});
