import { expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

test("2023〜2026を解決し、2025の必修追加・基礎1単位減と合計124を保持する", () => {
  for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("mast", "mast", year)!;
    expect(id).toBe(year <= 2024 ? "mast-23" : "mast-25");
    const report = checkGraduation([], id, undefined, "five-category");
    expect(report.categories.map((c) => c.requiredUnits)).toEqual(year <= 2024 ? [50, 20, 32, 1, 6] : [51, 20, 31, 1, 6]);
    expect(report.summary.requiredUnits).toBe(124);
    const literacy = course("GC12104", "コンピュータリテラシー", 1, "A", year);
    const categories = collectCategoryCourses(checkGraduation([literacy], id));
    expect(categories.compulsory.includes(literacy)).toBe(year >= 2025);
    expect(resolveRequirementId("mast", "mast", 2022)).toBeNull();
  }
});

test("自由科目特設と博物館は同じ追加枠で上限9、他学群6を代替しない", () => {
  for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("mast", "mast", year)!;
    const museum = course("9900001", "博物館科目", 5);
    const special = course("8049911", "自由科目特設", 5);
    const input = [museum, special];
    const detailed = checkGraduation(input, id);
    expect(detailed.categories[4].isSatisfied).toBe(false);
    const optional = detailed.details.selectResults.find((r) => r.message === "博物館・自由科目（特設）")!;
    expect(optional).toMatchObject({ maximum: 9, courses: input });
    expect(checkGraduation([...input, course("BA20001", "他学群", 6)], id).categories[4])
      .toMatchObject({ earnedUnits: 15, isSatisfied: true });
    expect(checkGraduation(input, id, undefined, "five-category").categories[4])
      .toMatchObject({ earnedUnits: 10, isSatisfied: true });
    expect(checkGraduation([course("9000001", "教職", 6)], id).details.uncountedCourses).toHaveLength(1);
  }
});

test("同名の他学類卒研を必修へ入れず、複数開設の専門英語を二重加算しない", () => {
  const id = resolveRequirementId("mast", "mast", 2026)!;
  const own = [course("GC48708", "卒業研究A", 3), course("GC48608", "卒業研究B", 3),
    course("GC42102", "専門英語A", 1), course("GC42302", "専門英語A", 1), course("GC42202", "専門英語B", 1)];
  const other = [course("GB19948", "卒業研究A", 3), course("EG79128", "卒業研究B", 6)];
  const report = checkGraduation([...own, ...other], id);
  expect(collectCategoryCourses(report).compulsory).toEqual(own);
  expect(report.categories[0].earnedUnits).toBe(8);
});

test("5分類の上下限を守り、基礎1単位不足と共通の詳細不足を区別する", () => {
  for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("mast", "mast", year)!;
    const minimum = year <= 2024 ? 32 : 31;
    for (const shortage of [0, 1]) {
      const report = checkGraduation([course("GC20001", "基礎", minimum - shortage)], id, undefined, "five-category");
      expect(report.categories[2].isSatisfied).toBe(shortage === 0);
    }
    const excess = checkGraduation([course("GC50001", "専門", 50), course("GA10001", "基礎", 60),
      course("4000001", "芸術", 20), course("BA20001", "他学群", 20)], id, undefined, "five-category");
    expect(excess.categories.slice(1).map((c) => c.earnedUnits)).toEqual([35, year <= 2024 ? 47 : 46, 10, 15]);
    expect(checkGraduation([course("4000001", "芸術", 1)], id).categories[3].isSatisfied).toBe(false);
    expect(checkGraduation([course("4000001", "芸術", 1)], id, undefined, "five-category").categories[3].isSatisfied).toBe(true);
  }
});

test("2026の必修51・専門35・基礎31・共通1・関連6で124となり、履修中と不足を区別する", () => {
  const compulsory = [course("GC48708", "卒業研究A", 3), course("GC48608", "卒業研究B", 3),
    course("GC41103", "情報メディア実験A", 3), course("GC41203", "情報メディア実験B", 3),
    course("GC42102", "専門英語A", 1), course("GC42202", "専門英語B", 1),
    ...["微分積分A", "微分積分B", "線形代数A", "線形代数B", "情報数学A", "確率と統計", "プログラミング入門A",
      "プログラミング", "コンピュータシステムとOS", "データ構造とアルゴリズム", "データ工学概論"]
      .map((name, i) => course(`GA00${i}`, name, 2)),
    course("GA0011", "プログラミング入門B", 1), course("GC12403", "データ構造とアルゴリズム実習", 1),
    course("GC12104", "コンピュータリテラシー", 1), course("1100011", "ファーストイヤーセミナー", 1),
    course("1100021", "学問への誘い", 1), course("6100011", "情報", 4), course("2100011", "体育", 2), course("31H0011", "英語", 4)];
  const id = resolveRequirementId("mast", "mast", 2026)!;
  const input = [...compulsory, course("GC50001", "専門", 35), course("GC20001", "基礎", 31),
    course("1200011", "学士基盤", 1), course("BA20001", "他学群", 6)];
  const report = checkGraduation(input, id, undefined, "five-category");
  expect(report.categories.map((c) => c.earnedUnits)).toEqual([51, 35, 31, 1, 6]);
  expect(report.summary).toMatchObject({ earnedUnits: 124, shortageUnits: 0, isSatisfied: true });
  const taking = checkGraduation([...input.slice(0, -1), course("BA20001", "他学群", 6, "履修中")], id, undefined, "five-category");
  expect(taking.summary).toMatchObject({ isSatisfied: false, isProspectivelySatisfied: true });
  expect(taking.summary.prospectiveUnits).toBe(124);
  const dual = { ...course("BA20001", "GAとの二重開設", 6), equivalentCourseIds: ["GA10001"] };
  expect(checkGraduation([dual], id).details.uncountedCourses).toEqual([dual]);
});
