import { expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

test("2023と2024以降のルールを分け、必修32・選択92・全体124と5分類下限を保持する", () => {
  for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("math", "math", year)!;
    expect(id).toBe(year === 2023 ? "math-23" : "math-24");
    const report = checkGraduation([], id, undefined, "five-category");
    expect(report.categories.map((c) => c.requiredUnits)).toEqual([32, 46, 15, 1, 6]);
    expect(report.summary.requiredUnits).toBe(124);
    const minimumsOnly = checkGraduation([course("FB12001", "専門", 46), course("FBA0001", "基礎", 15),
      course("1200011", "学士基盤", 1), course("GC10001", "関連", 6)], id, undefined, "five-category");
    expect(minimumsOnly.summary).toMatchObject({ earnedUnits: 68, shortageUnits: 56, isSatisfied: false });
  }
});

test("卒研・予備研究・外書輪講IIの番号で必修を特定し、表記違いと同名他学類の混入を防ぐ", () => {
  const id = resolveRequirementId("math", "math", 2026)!;
  const input = [course("FB14908", "卒業研究", 9), course("FB13901", "卒業予備研究", 3),
    course("FB13501", "数学外書輪講II", 2), course("EB19008", "卒業研究", 9)];
  const report = checkGraduation(input, id);
  expect(collectCategoryCourses(report).compulsory).toEqual(input.slice(0, 3));
  expect(report.categories[0].earnedUnits).toBe(14);
  expect(report.details.compulsoryResults.filter((r) => r.courses.length > 0).every((r) => r.passed)).toBe(true);
});

test("旧ローマ数字の必修候補は2023にだけ含め、微積分・線形代数を各2で制限する", () => {
  for (const [names, expected] of [["微積分", "微積分系"], ["線形代数", "線形代数系"]]) {
    const input = [course("FBA1001", `${names}I`, 1), course("FBA1002", `${names}II`, 1)];
    const old = checkGraduation(input, resolveRequirementId("math", "math", 2023)!);
    expect(old.details.compulsoryResults.find((r) => r.name === expected)).toMatchObject({ passed: true, minimumUnit: 2 });
    const modern = checkGraduation(input, resolveRequirementId("math", "math", 2024)!);
    expect(collectCategoryCourses(modern).compulsory).toEqual([]);
    expect(collectCategoryCourses(modern).specializedFoundation).toEqual(input);
    const shortage = checkGraduation(input.slice(0, 1), resolveRequirementId("math", "math", 2023)!);
    expect(shortage.details.compulsoryResults.find((r) => r.name === expected)?.passed).toBe(false);
  }
});

test("学士基盤の余剰を共通17へ使い、学士1の詳細内数と5分類を分ける", () => {
  const id = resolveRequirementId("math", "math", 2025)!;
  const input = [course("1200011", "学士基盤", 10), course("4000001", "芸術", 7)];
  expect(checkGraduation(input, id).categories[3]).toMatchObject({ earnedUnits: 17, isSatisfied: true });
  const withoutBachelor = [course("4000001", "芸術", 17)];
  expect(checkGraduation(withoutBachelor, id).categories[3].isSatisfied).toBe(false);
  expect(checkGraduation(withoutBachelor, id, undefined, "five-category").categories[3])
    .toMatchObject({ earnedUnits: 17, isSatisfied: true });
});

test("数学の教科指導法を関連へ数え、他教科を除き、124単位の充足・不足と上限を確認する", () => {
  const id = resolveRequirementId("math", "math", 2026)!;
  const allowed = [course("9450101", "数学科教育概論I", 1), course("9450201", "数学科教育概論II", 2),
    course("9453001", "数学科指導法", 1), course("FB15001", "指定範囲外FB", 2)];
  const excluded = course("9460001", "他教科の指導法", 2);
  const related = checkGraduation([...allowed, excluded], id);
  expect(collectCategoryCourses(related).related).toEqual(allowed);
  expect(related.details.uncountedCourses).toEqual([excluded]);
  expect(related.categories[4].isSatisfied).toBe(true);
  const required = [course("FB14908", "卒業研究", 9), course("FB13901", "卒業予備研究", 3), course("FB13501", "数学外書輪講II", 2),
    course("FA10001", "微積分1", 1), course("FA10002", "微積分2", 1), course("FA10003", "線形代数1", 1), course("FA10004", "線形代数2", 1),
    course("FA01111", "数学リテラシー1", 1), course("FA01211", "数学リテラシー2", 1),
    course("1100011", "ファーストイヤーセミナー", 1), course("1100021", "学問への誘い", 1), course("2100011", "体育", 2),
    course("31H0011", "英語", 4), course("6100011", "情報", 4)];
  const input = [...required, course("FB12001", "専門", 70), course("FBA0001", "基礎", 15), course("1200011", "学士基盤", 1), ...allowed];
  const report = checkGraduation(input, id, undefined, "five-category");
  expect(report.categories.map((c) => c.earnedUnits)).toEqual([32, 70, 15, 1, 6]);
  expect(report.summary).toMatchObject({ earnedUnits: 124, shortageUnits: 0, isSatisfied: true });
  expect(checkGraduation(input.slice(0, -1), id, undefined, "five-category").summary.isSatisfied).toBe(false);
  const excess = checkGraduation([course("FB12001", "専門", 100), course("FBA0001", "基礎", 70),
    course("1200011", "学士基盤", 30), course("GC10001", "関連", 30)], id, undefined, "five-category");
  expect(excess.categories.slice(1).map((c) => c.earnedUnits)).toEqual([70, 47, 17, 16]);
  for (const shortage of [0, 1]) {
    expect(checkGraduation([course("FB12001", "専門", 46 - shortage)], id, undefined, "five-category").categories[1].isSatisfied).toBe(shortage === 0);
    expect(checkGraduation([course("FBA0001", "基礎", 15 - shortage)], id, undefined, "five-category").categories[2].isSatisfied).toBe(shortage === 0);
  }
});
