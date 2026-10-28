import { describe, expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

const majors = [
  { key: "philosophy", code: "AB62001", other: "AB71001", base: "AB60001", oldMax: 15, newMax: 18, primary: 20, secondary: 24 },
  { key: "history", code: "AB71001", other: "AB62001", base: "AB70001", oldMax: 17, newMax: 20, primary: 20, secondary: 24 },
  { key: "archaeology", code: "AB83001", other: "AB71001", base: "AB50001", oldMax: 13, newMax: 16, primary: 20, secondary: 24 },
  { key: "linguistics", code: "AB91001", other: "AB62001", base: "AB90001", oldMax: 18, newMax: 21, primary: 18, secondary: 26 },
] as const;

describe("人文学類の監査", () => {
  test("4主専攻の専門基礎上限を2025年度の変更で分け、5分類でも年度差を維持する", () => {
    for (const major of majors) for (const year of [2023, 2024, 2025, 2026]) {
      const id = resolveRequirementId("humanities", `humanities-${major.key}`, year)!;
      const version = year >= 2025 ? 25 : year === 2024 ? 24 : year === 2023 && major.key === "philosophy" ? 23 : 22;
      expect(id).toBe(`humanities-${major.key}-${version}`);
      const report = checkGraduation([course(major.base, "基礎科目", 30)], id, undefined, "five-category");
      expect(report.categories.map((item) => item.requiredUnits)).toEqual([28, 44, 11, 1, 6]);
      expect(report.categories[2].earnedUnits).toBe(year < 2025 ? major.oldMax : major.newMax);
      expect(report.summary.requiredUnits).toBe(124);
    }
    for (const year of [2024, 2025]) {
      const id = resolveRequirementId("humanities", "humanities-archaeology", year)!;
      const report = checkGraduation([course("AB80001", "考古学基礎", 30)], id);
      expect(report.categories[2].earnedUnits).toBe(11);
    }
  });

  test("主専攻群の20単位・言語学18単位を内数で要求し、重なる専門群に余剰を使える", () => {
    for (const major of majors) for (const shortage of [0, 1]) {
      const id = resolveRequirementId("humanities", `humanities-${major.key}`, 2024)!;
      const report = checkGraduation([course(major.code, "主専攻群", major.primary - shortage),
        course(major.other, "他の専門群", major.secondary + shortage)], id);
      expect(report.categories[1].isSatisfied, major.key).toBe(shortage === 0);
      const reversed = checkGraduation([course(major.code, "主専攻群", major.primary + shortage),
        course(major.other, "他の専門群", major.secondary - shortage)], id);
      expect(reversed.categories[1].isSatisfied, major.key).toBe(true);
      const over = checkGraduation([course(major.code, "主専攻群", 100)], id);
      expect(over.categories[1].earnedUnits).toBe(78);
    }
  });

  test("AC56・AE56を2025から専門基礎へ移し、詳細では合計11単位まで数える", () => {
    const courses = [course("AC56001", "比較文化研究", 6), course("AE56001", "日本語文化研究", 6)];
    for (const major of majors) {
      const old = checkGraduation(courses, resolveRequirementId("humanities", `humanities-${major.key}`, 2024)!);
      const modern = checkGraduation(courses, resolveRequirementId("humanities", `humanities-${major.key}`, 2025)!);
      expect(collectCategoryCourses(old).specialized).toEqual([courses[0]]);
      expect(collectCategoryCourses(old).related).toEqual([courses[1]]);
      expect(collectCategoryCourses(modern).specializedFoundation).toEqual(courses);
      expect(modern.categories[2].earnedUnits).toBe(11);
      expect(modern.categories[1].earnedUnits).toBe(0);
    }
    for (const [year, expected] of [[2022, "related"], [2023, "specialized"]] as const) {
      const item = course("AC54001", "専門外国語", 2);
      const report = checkGraduation([item], year === 2022 ? "humanities-philosophy-22" : resolveRequirementId("humanities", "humanities-philosophy", year)!);
      expect(collectCategoryCourses(report)[expected]).toContain(item);
    }
    for (const [year, expected] of [[2023, "related"], [2024, "specialized"]] as const) {
      const item = course("AC61001", "専門候補", 2);
      const report = checkGraduation([item], resolveRequirementId("humanities", "humanities-philosophy", year)!);
      expect(collectCategoryCourses(report)[expected]).toContain(item);
    }
  });

  test("実科目名の卒業論文・研究a/bを必修へ一度だけ割り当てる", () => {
    const fields = [
      ["philosophy", "AB62", "哲学・倫理学", "哲学・倫理学"],
      ["history", "AB71", "日本史", "日本史学"],
      ["archaeology", "AB83", "先史学・考古学", "先史学・考古学"],
      ["linguistics", "AB91", "一般言語学", "一般言語学"],
    ] as const;
    for (const [key, prefix, field, thesisField] of fields) {
      const courses = [course(`${prefix}K38`, `卒業論文(${thesisField})`, 6),
        course(`${prefix}K12`, `${field}研究-a`, 2), course(`${prefix}K22`, `${field}研究-b`, 2)];
      const report = checkGraduation(courses, resolveRequirementId("humanities", `humanities-${key}`, 2024)!);
      expect(collectCategoryCourses(report).compulsory).toEqual(courses);
      expect(collectCategoryCourses(report).specialized).toEqual([]);
      expect(report.categories[0].earnedUnits).toBe(10);
      expect(report.details.requirementItems.slice(0, 3).every((item) => item.isSatisfied)).toBe(true);
    }
  });

  test("関連の特設・教職・博物館は各10単位を上限とし、5分類では区分上限だけ使う", () => {
    const courses = [course("8000001", "特設", 12), course("9000001", "教職", 12), course("9900001", "博物館", 12)];
    for (const item of courses) {
      const input = [course("AA20001", "関連第1群", 4), course("E000001", "関連第2群", 2), item];
      const detailed = checkGraduation(input, "humanities-philosophy-22");
      expect(detailed.categories[4].earnedUnits).toBe(16);
      const coarse = checkGraduation(input, "humanities-philosophy-22", undefined, "five-category");
      expect(coarse.categories[4].earnedUnits).toBe(18);
    }
    const coarse = checkGraduation(courses, "humanities-philosophy-22", undefined, "five-category");
    expect(coarse.categories[4].earnedUnits).toBe(34);
  });
});
