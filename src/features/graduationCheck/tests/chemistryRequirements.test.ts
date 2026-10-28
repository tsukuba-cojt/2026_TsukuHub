import { expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

test("化学の年度境界、半単位、数学・物理の12→8を保持する", () => {
  for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("chem", "chem", year)!;
    expect(id).toBe(`chem-${year % 100}`);
    const report = checkGraduation([], id);
    expect(report.categories.map((c) => c.requiredUnits)).toEqual([year < 2025 ? 42.5 : 42, 42, 17, 1, 9]);
    expect(report.summary.requiredUnits).toBe(124);
    expect(report.details.selectResults[1].minimumIncludedResults?.[0].minimum).toBe(year < 2025 ? 12 : 8);
    const maths = course("FA09991", "微積分演習S", 1);
    expect(collectCategoryCourses(checkGraduation([maths], id)).specializedFoundation).toContain(maths);
    expect(checkGraduation([maths], id).details.selectResults[1].minimumIncludedResults?.[0].courses.reduce((sum, c) => sum + c.unit, 0)).toBe(year < 2025 ? 1 : 0);
    const roman = course("FA09992", "微積分II", 1);
    expect(checkGraduation([roman], id).details.selectResults[1].minimumIncludedResults?.[0].courses).toHaveLength(year === 2023 ? 1 : 0);
  }
});

test("必修42と選択82の履修例、卒研番号と必修の重複上限を確認する", () => {
  const required = [course("FE13273", "物理化学専門実験", 4), course("FE13133", "無機・分析化学専門実験", 4), course("FE13313", "有機化学専門実験", 4),
    course("FE14808", "卒業研究", 14), course("FE11171", "化学1", 1), course("FE11181", "化学2", 1), course("FE11191", "化学3", 1),
    course("1100011", "ファーストイヤーセミナー", 1), course("1100021", "学問への誘い", 1), course("2100011", "体育", 2), course("31H0011", "英語", 4), course("6100011", "情報", 4), course("1414014", "事例に学ぶ環境安全衛生と化学物質", 1)];
  const input = [...required, course("FE12991", "専門", 52), course("FA09991", "基礎", 18), course("1200011", "学士", 1), course("BA20001", "AB", 2), course("GA20001", "関連", 9)];
  const report = checkGraduation(input, "chem-26", undefined, "five-category");
  expect(report.summary).toMatchObject({ earnedUnits: 124, isSatisfied: true });
  expect(checkGraduation(input.slice(0, -1), "chem-26", undefined, "five-category").summary.isSatisfied).toBe(false);
  expect(collectCategoryCourses(checkGraduation([course("EB19008", "卒業研究", 14), required[3]], "chem-26")).compulsory).toEqual([required[3]]);
  expect(checkGraduation([required[4], course("FE11271", "化学1", 1)], "chem-23").categories[0].earnedUnits).toBe(1);
});

test("3分野の超過を専門合計へ残し、分野不足だけを詳細へ反映する", () => {
  const input = [course("FE12101", "分析化学", 3), course("FE13101", "無機化学II", 3), course("FE13621", "無機元素化学", 2),
    course("FE12201", "物理化学I", 6), course("FE12301", "有機化学I", 6), course("FE12991", "その他専門", 22)];
  expect(checkGraduation(input, "chem-26").categories[1]).toMatchObject({ earnedUnits: 42, isSatisfied: true });
  const short = input.map((c) => c.name === "有機化学I" ? { ...c, unit: 5 } : c.name === "その他専門" ? { ...c, unit: 23 } : c);
  expect(checkGraduation(short, "chem-26").categories[1].isSatisfied).toBe(false);
  expect(checkGraduation(short, "chem-26", undefined, "five-category").categories[1].isSatisfied).toBe(true);
});

test("専門導入だけを基礎へ数え、理科指導法だけを関連へ再包含する", () => {
  const intro = course("EC12201", "生物資源学にみる食品科学・技術の最前線", 1);
  const other = course("EC35051", "サプライチェーン概論", 1);
  const science = course("9456011", "中学校理科教育論", 1);
  const math = course("9453001", "数学科指導法", 1);
  const special = course("8049911", "自由科目特設", 1);
  const report = checkGraduation([intro, other, science, math, special], "chem-26");
  expect(collectCategoryCourses(report).specializedFoundation).toEqual([intro]);
  expect(collectCategoryCourses(report).related).toEqual([other, science]);
  expect(report.details.uncountedCourses).toEqual([math, special]);
});

test("関連AB2の不足・9〜11上限と半単位必修を確認する", () => {
  const related = [course("BA20001", "AB", 2), course("GA20001", "関連", 7)];
  expect(checkGraduation(related, "chem-23").categories[4].isSatisfied).toBe(true);
  expect(checkGraduation([related[1]], "chem-23").categories[4].isSatisfied).toBe(false);
  expect(checkGraduation([related[0], { ...related[1], unit: 20 }], "chem-23", undefined, "five-category").categories[4].earnedUnits).toBe(11);
  expect(checkGraduation([course("FE13273", "物理化学専門実験", 4.5)], "chem-23").categories[0].earnedUnits).toBe(4.5);
});
