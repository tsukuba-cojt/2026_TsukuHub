import { expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

const majors = ["coins-ss", "coins-is", "coins-im"];

test("3主専攻ともGB20・GB30・GB40の合算16を要求し、他の専門を含め34単位にする", () => {
  for (const major of majors) {
    const id = resolveRequirementId("coins", major, 2023)!;
    for (const shortage of [0, 1]) {
      const input = [course("GB30001", "3主専攻に共通の指定群", 16 - shortage), course("GB21001", "その他専門", 18 + shortage)];
      const report = checkGraduation(input, id);
      expect(report.categories[1].isSatisfied).toBe(shortage === 0);
      expect(checkGraduation(input, id, undefined, "five-category").categories[1])
        .toMatchObject({ earnedUnits: 34, isSatisfied: true });
    }
    expect(checkGraduation([course("GB40001", "指定群のみ", 34)], id).categories[1].isSatisfied).toBe(true);
  }
});

test("専門基礎の指定・英語の余剰をGB1枠へ使い、内数不足や指定外名称は充足扱いにしない", () => {
  const id = resolveRequirementId("coins", "coins-is", 2024)!;
  const input = [course("GB11601", "確率論", 10), course("GB13614", "Computer Science in English A", 8), course("GA10001", "GA1選択", 8)];
  expect(checkGraduation(input, id).categories[2]).toMatchObject({ earnedUnits: 26, isSatisfied: true });
  const shortage = [course("GB11601", "確率論", 7), course("GB13614", "Computer Science in English A", 2),
    course("GB15001", "その他GB1", 9), input[2]];
  expect(checkGraduation(shortage, id).categories[2].isSatisfied).toBe(false);
  expect(checkGraduation(shortage, id, undefined, "five-category").categories[2].isSatisfied).toBe(true);
  const notDesignated = [course("GB11699", "指定一覧にない科目", 10), input[1], input[2]];
  expect(checkGraduation(notDesignated, id).categories[2].isSatisfied).toBe(false);
  expect(checkGraduation([course("GB13312", "情報特別演習I", 2)], id).categories[1].earnedUnits).toBe(2);
});

test("同名の他学類卒研・旧専門語学を必修へ混ぜず、情報科学類の必修だけに数える", () => {
  const id = resolveRequirementId("coins", "coins-im", 2026)!;
  const own = [course("GB19948", "卒業研究A", 3), course("GB19958", "卒業研究B", 3),
    course("GB19091", "専門語学A", 2), course("GB19101", "専門語学B", 2)];
  const other = [course("EG79118", "卒業研究A", 6), course("GC60001", "卒業研究B", 3),
    course("GB19041", "専門語学A", 1.5), course("GB19051", "専門語学B", 1.5)];
  const report = checkGraduation([...own, ...other], id);
  expect(collectCategoryCourses(report).compulsory).toEqual(own);
  expect(report.categories[0].earnedUnits).toBe(10);
});

test("関連の2026年度差とGB二重開設除外を守り、小区分上限を5分類へ持ち込まない", () => {
  const other = course("BA20001", "他学群関連", 6);
  const limited = course("E000001", "生命環境学群", 6);
  const dual = { ...course("GC10001", "GBとの二重開設", 2), equivalentCourseIds: ["GB20001"] };
  for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("coins", "coins-is", year)!;
    const report = checkGraduation([other, limited, dual], id);
    expect(report.categories[4]).toMatchObject({ earnedUnits: 10, isSatisfied: true });
    expect(report.details.uncountedCourses).toEqual([dual]);
    expect(checkGraduation([limited], id).categories[4].isSatisfied).toBe(year === 2026);
    expect(checkGraduation([limited], id, undefined, "five-category").categories[4])
      .toMatchObject({ earnedUnits: 6, isSatisfied: true });
  }
});

test("全12運用先で54＋71＝125と5分類の下限・上限を保持する", () => {
  for (const major of majors) for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("coins", major, year)!;
    const report = checkGraduation([course("GB20001", "専門", 40), course("GB15001", "基礎", 40),
      course("1200011", "学士基盤", 10), course("BA20001", "関連", 20)], id, undefined, "five-category");
    expect(report.categories.map((c) => c.requiredUnits)).toEqual([54, 34, 26, 1, 6]);
    expect(report.categories.slice(1).map((c) => c.earnedUnits)).toEqual([34, 26, 5, 10]);
    expect(report.summary.requiredUnits).toBe(125);
  }
});
