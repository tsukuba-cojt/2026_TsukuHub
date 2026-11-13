import { expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

test("地球3主専攻の現行年度を解決し、選択・自由を5分類へ合算する", () => {
  for (const year of [2023, 2024, 2025, 2026]) {
    for (const major of ["earth-environment", "earth-evolution", "earth-interdisciplinary"]) {
      const id = resolveRequirementId("earth", major, year)!;
      const report = checkGraduation([], id, undefined, "five-category");
      const expected = major === "earth-interdisciplinary"
        ? year === 2023 ? [43, 42, 18, 1, 6] : [41.5, 47, 11.5, 1, 9]
        : [major === "earth-environment" && year === 2026 ? 32 : 33,
          major === "earth-environment" && year === 2026 ? 41 : 40, year <= 2024 ? 18 : 16, 1, year <= 2024 ? 4 : 6];
      expect(report.categories.map((c) => c.requiredUnits)).toEqual(expected);
      expect(report.summary.requiredUnits).toBe(124);
      expect(report.requirement.enrollYear.toString()).toContain(year.toString());
    }
  }
});

test("2023のEE4・EG8とFA・GA・EG71、2025の指定地理科目を年度どおり分類し二重計上しない", () => {
  const input = [course("EE40001", "旧専門", 2), course("EG80001", "旧学際専門", 2),
    course("FA99991", "微積分I", 2), course("GA99991", "指定外GA", 2), course("EG71991", "旧基礎", 2),
    course("AB70F11", "歴史地理学概説-a", 2), course("AC62F21", "地域地理学I", 2)];
  const old = collectCategoryCourses(checkGraduation(input, "earth-environment-23"));
  expect(old.specialized).toEqual(input.slice(0, 2));
  expect(old.specializedFoundation).toEqual(input.slice(2, 6));
  expect(old.related).toEqual(input.slice(6));
  const modern = collectCategoryCourses(checkGraduation(input, "earth-environment-25"));
  expect(modern.specializedFoundation).toEqual(input.slice(5));
  expect(modern.related).toEqual(input.slice(2, 4));
  expect(checkGraduation([input[0]], "earth-evolution-23").categories[1].earnedUnits).toBe(2);
});

test("分野下限の不足と上限を判定し、詳細不足を5分類進捗へ混ぜない", () => {
  for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("earth", "earth-environment", year)!;
    const required = year === 2026 ? 41 : 40;
    for (const shortage of [0, 1]) {
      const input = [course("EE20001", "環境専門", 10 - shortage),
        course("EE30001", "進化専門", required - 10 + shortage - (year === 2026 ? 1 : 0)),
        ...(year === 2026 ? [course("EG90001", "生物圏専門", 1)] : [])];
      expect(checkGraduation(input, id).categories[1].isSatisfied).toBe(shortage === 0);
      expect(checkGraduation(input, id, undefined, "five-category").categories[1])
        .toMatchObject({ earnedUnits: required, isSatisfied: true });
    }
    const excess = [course("EE20001", "環境専門", 100), course("EE30001", "進化専門", 100)];
    expect(checkGraduation(excess, id, undefined, "five-category").categories[1].earnedUnits)
      .toBe(year === 2026 ? 69 : 68);
  }
});

test("学際の野外6→3とEG9内数11を別枠にし、指定EB基礎を専門へ混入させない", () => {
  const foundation = course("EB50211", "指定EB基礎", 10);
  const old = collectCategoryCourses(checkGraduation([foundation], "earth-interdisciplinary-23"));
  expect(old.specializedFoundation).toEqual([foundation]);
  expect(old.specialized).toEqual([]);
  for (const year of [2024, 2025, 2026]) {
    const id = resolveRequirementId("earth", "earth-interdisciplinary", year)!;
    const fieldMinimum = year === 2026 ? 3 : 6;
    for (const shortage of [0, 1]) {
      const fields = course("EG91203", "地球環境学野外実験I", fieldMinimum - shortage);
      const eg9 = course("EG93001", "その他EG9", 11);
      const input = [fields, eg9, course("EC20001", "その他専門", 47 - fieldMinimum - 11 + shortage),
        course("EB11251", "生物学序説", 11.5)];
      const report = checkGraduation(input, id);
      expect(report.categories[1].isSatisfied).toBe(shortage === 0);
      expect(report.categories[2].earnedUnits).toBe(11.5);
      expect(report.details.selectResults.find((r) => r.message.startsWith("その他専門"))?.courses).not.toContain(fields);
      expect(checkGraduation(input.filter((c) => c !== eg9), id).categories[1].isSatisfied).toBe(false);
      expect(checkGraduation(input, id, undefined, "five-category").categories[1].isSatisfied).toBe(true);
    }
    expect(checkGraduation([course("EG91203", "地球環境学野外実験I", 30), course("EC20001", "その他専門", 60),
      course("EG02001", "専門基礎", 40), course("1200011", "総合", 30), course("FJ20004", "Linear Algebra I", 30)],
    id, undefined, "five-category").categories.slice(1).map((c) => c.earnedUnits)).toEqual([61, 25.5, 15, 23]);
  }
});

test("同名の他学類卒研を必修へ入れず、2023学際の124単位を自由単位込みで一度ずつ集計する", () => {
  const foreign = course("EB19008", "卒業研究", 12);
  const earth = course("EE51968", "卒業研究", 12);
  expect(collectCategoryCourses(checkGraduation([foreign, earth], "earth-environment-24")).compulsory).toEqual([earth]);
  const input = [course("EG71102", "研究演習A", 1.5), course("EG71112", "研究演習B", 1.5),
    course("EG71002", "地球学演習A", 1.5), course("EG71012", "地球学演習B", 1.5),
    course("EG79118", "卒業研究A", 6), course("EG79128", "卒業研究B", 6), course("EG79991", "論文作成", 7),
    course("EG70031", "地球と生命の進化", 1.5), course("EG70021", "地球環境学入門", 1), course("EG70013", "地球学基礎実験", 1),
    course("EG70041", "地球学ファーストイヤーセミナーI", 1), course("EG70051", "地球学ファーストイヤーセミナーII", 0.5),
    course("1100011", "ファーストイヤーセミナー", 1), course("1100021", "学問への誘い", 1),
    course("2100011", "体育", 2), course("3200011", "日本語", 4), course("6100011", "情報", 4), course("4100011", "芸術", 1),
    course("EG91203", "地球環境学野外実験I", 6), course("EG93001", "その他EG9", 11), course("EC20001", "その他専門", 39),
    course("EG02001", "選択基礎", 8), course("EB50211", "自由基礎", 10), course("1200011", "総合科目", 1),
    course("FJ20004", "関連", 6)];
  const report = checkGraduation(input, "earth-interdisciplinary-23", undefined, "five-category");
  expect(report.categories.map((c) => c.earnedUnits)).toEqual([43, 56, 18, 1, 6]);
  expect(report.summary).toMatchObject({ earnedUnits: 124, shortageUnits: 0, isSatisfied: true });
  expect(new Set(Object.values(collectCategoryCourses(report)).flat()).size).toBe(input.length);
  expect(checkGraduation(input.slice(0, -1), "earth-interdisciplinary-23", undefined, "five-category").summary.isSatisfied).toBe(false);
});
