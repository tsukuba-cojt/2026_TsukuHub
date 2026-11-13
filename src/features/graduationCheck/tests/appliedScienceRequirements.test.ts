import { expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { appliedBasicCourses, appliedFoundationCourses } from "../data/appliedScienceCourses";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

const majors = ["applied-physics", "applied-electron", "applied-materials", "applied-molecule"];
const basics = appliedBasicCourses.map(({ name, units, codes }) => course(codes[0] === "FA013" ? "FA01311" : codes[0], name, units));
const required = (digit: number) => [course("FF19401", "基礎実験学", 1), course(`FF${digit}0113`, "専攻実験A", 2), course(`FF${digit}0133`, "専攻実験B", 2),
  course(`FF${digit}9928`, "卒業研究A", 4), course(`FF${digit}9948`, "卒業研究B", 4),
  ...appliedFoundationCourses.map(({ name, units, codes }) => course(codes[0], name, units)),
  course("1100011", "ファーストイヤーセミナー", 1), course("1100021", "学問への誘い", 1), course("2100011", "体育", 3), course("31H0011", "英語", 4), course("6100011", "情報", 4)];

test("全16運用先で66→49・基礎必修17→選択を分離し、同じ24版を2026まで共用する", () => {
  for (const major of majors) for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("applied-science", major, year)!;
    expect(id).toBe(`${major}-${year === 2023 ? 23 : 24}`);
    const report = checkGraduation(basics, id, undefined, "five-category");
    expect(report.categories.map((c) => c.requiredUnits)).toEqual([year === 2023 ? 66 : 49, 35, year === 2023 ? 6 : 21, 1, 12]);
    expect(report.summary.requiredUnits).toBe(124);
    expect(report.categories[year === 2023 ? 0 : 2].earnedUnits).toBe(17);
  }
});

test("4主専攻の必修と最低124の履修例、不足・同名他学類・並行クラス上限を検証する", () => {
  for (const [index, major] of majors.entries()) for (const year of [2023, 2026]) {
    const digit = index + 2;
    const id = resolveRequirementId("applied-science", major, year)!;
    const input = [...required(digit), ...basics, course(`FF${digit}5001`, "主専攻", 12), course("FF16001", "共通専門", 23), course("FF15001", "基礎", 9), course("1200011", "学士", 1), course("BA20001", "関連", 13)];
    const report = checkGraduation(input, id, undefined, "five-category");
    expect(report.summary).toMatchObject({ earnedUnits: 124, isSatisfied: true });
    expect(checkGraduation(input.slice(0, -1), id, undefined, "five-category").summary.isSatisfied).toBe(false);
    const foreign = course("GC48708", "卒業研究A", 4);
    const duplicate = course(`FF${digit}9938`, "卒業研究A", 4);
    const own = required(digit)[3];
    const duplicateReport = checkGraduation([foreign, own, duplicate, course("GB10001", "熱力学", 4)], id);
    expect(duplicateReport.categories[0].earnedUnits).toBe(4);
    expect(collectCategoryCourses(duplicateReport).compulsory).toEqual([own, duplicate]);
  }
});

test("専門12と23の不足を詳細で判定し、5分類では小区分不足を減算しない", () => {
  for (const [index, major] of majors.entries()) {
    const digit = index + 2;
    const id = resolveRequirementId("applied-science", major, 2026)!;
    const valid = [course(`FF${digit}5001`, "主専攻", 12), course(`FF${digit}6001`, "関連専門", 23)];
    expect(checkGraduation(valid, id).categories[1].isSatisfied).toBe(true);
    const short = [{ ...valid[0], unit: 11 }, { ...valid[1], unit: 24 }];
    expect(checkGraduation(short, id).categories[1].isSatisfied).toBe(false);
    expect(checkGraduation(short, id, undefined, "five-category").categories[1].isSatisfied).toBe(true);
  }
});

test("FF全体を実習枠へ含めず、明記実習・他主専攻と基礎を分ける", () => {
  const id = resolveRequirementId("applied-science", majors[0], 2026)!;
  const allowed = [course("FF13103", "インターンシップI", 1), course("FF35001", "他主専攻", 1), course("FA00011", "科学技術倫理", 1)];
  const unresolved = [course("FF18001", "未確認FF基礎", 1), course("FF29001", "自専攻の未確認専門", 1)];
  const foundation = course("FF15001", "専門基礎", 6);
  const report = checkGraduation([...allowed, ...unresolved, foundation], id);
  expect(collectCategoryCourses(report).specialized).toEqual(allowed);
  expect(collectCategoryCourses(report).specializedFoundation).toEqual([foundation]);
  expect(report.details.uncountedCourses).toEqual(unresolved);
});

test("関連主枠12を資格等で代替せず、特設例外8・FA45除外と5区分上限を守る", () => {
  const id = resolveRequirementId("applied-science", majors[0], 2026)!;
  const qualifications = course("8049911", "特設", 4);
  const related = course("BA20001", "他学類", 12);
  expect(checkGraduation([qualifications, { ...related, unit: 8 }], id).categories[4].isSatisfied).toBe(false);
  expect(checkGraduation([qualifications, related], id).categories[4]).toMatchObject({ earnedUnits: 16, isSatisfied: true });
  expect(checkGraduation([course("FA45224", "線形代数基礎", 1)], id).details.uncountedCourses).toHaveLength(1);
  const capped = checkGraduation([course("FF25001", "専門", 100), course("FF15001", "基礎", 100), course("1200011", "学士", 100), { ...related, unit: 100 }], id, undefined, "five-category");
  expect(capped.categories.slice(1).map((c) => c.earnedUnits)).toEqual([39, 26, 5, 16]);
});
