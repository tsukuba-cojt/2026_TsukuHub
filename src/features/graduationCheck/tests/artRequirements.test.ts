import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";
import fs from "node:fs";

const ids = ["art-studies-22", "japanese-art-22"] as const;

test("実カタログの英語基礎演習・日本芸術インターンシップを必修へ数え、他学類の同名科目を混入させない", () => {
  for (const year of [2023, 2024, 2025, 2026]) {
    const { courses } = JSON.parse(fs.readFileSync(`public/data/courses/tsukuba-${year}.json`, "utf8"));
    const actual = (code: string) => {
      const item = courses.find((c: { course_number: string }) => c.course_number === code);
      return course(code, item.course_name, Number(item.credits));
    };
    const english = ["YAX3132", "YAX3142", "YAX3152", "YAX3162", "YAX3172", "YAX3182"].map(actual);
    for (const item of english) {
      const report = checkGraduation([item], "art-studies-22", undefined, "five-category");
      expect(report.categories[0].earnedUnits).toBe(1);
      expect(report.categories[2].earnedUnits).toBe(0);
    }
    const all = checkGraduation(english, "art-studies-22", undefined, "five-category");
    expect(all.categories[0].earnedUnits).toBe(6); // 5分類では小区分の1単位上限を適用しない。
    expect(checkGraduation(english, "art-studies-22").categories[0].earnedUnits).toBe(1);
    const internship = checkGraduation([actual("YBW2933")], "japanese-art-22", undefined, "five-category");
    expect(internship.categories[0].earnedUnits).toBe(1);
    expect(internship.categories[1].earnedUnits).toBe(0);
    const wrong = checkGraduation([
      course("AB00001", "英語基礎演習A", 1), course("FH00001", "インターンシップ", 1),
    ], "japanese-art-22", undefined, "five-category");
    expect(wrong.categories[0].earnedUnits).toBe(0);
  }
});

test("建築士資格表にある工シス科目も、芸術の専門指定4番号へ無条件には追加しない", () => {
  for (const id of ids) {
    const specified = [course("FG45901", "建築設備", 2), course("FH45051", "建築関連法規", 1),
      course("FH45061", "建築経済", 1), course("FH45071", "建築生産", 1)];
    const other = [course("FG43811", "設計計画論", 1), course("FG45911", "建築環境工学", 2)];
    const report = checkGraduation([...specified, ...other], id, undefined, "five-category");
    expect(report.categories[1].earnedUnits).toBe(5);
    expect(report.details.selectResults.find((r) => r.message === "FG・FH指定専門科目")?.courses).toEqual(specified);
    expect(report.details.selectResults.find((r) => r.message === "E・F系関連科目")?.courses).toEqual(other);
  }
});

describe.each(ids)("芸術専門学群 %s", (id) => {
  test("他科目群を多く取得してもYB40単位の不足を代替できない", () => {
    const report = checkGraduation([
      course("YBA1011", "専門選択", 39),
      course("AB90001", "人文専門", 15),
      course("FG45901", "指定科目", 5),
    ], id);
    expect(report.details.requirementItems.find((item) => item.label === "YB専門科目"))
      .toMatchObject({ earnedUnits: 39, isSatisfied: false });
    expect(report.categories.find((item) => item.category === "specialized"))
      .toMatchObject({ isSatisfied: false });
  });

  test.each([0, 1])("専門下限50単位の境界（不足%d単位）", (shortage) => {
    const report = checkGraduation([
      course("YBA1011", "専門選択", 40),
      course("AB90001", "人文専門", 5),
      course("FG45901", "指定科目", 5 - shortage),
    ], id);
    expect(report.categories.find((item) => item.category === "specialized"))
      .toMatchObject({ earnedUnits: 50 - shortage, isSatisfied: shortage === 0 });
  });

  test("他科目群の上限15・5単位と専門全体64単位を適用する", () => {
    const report = checkGraduation([
      course("YBA1011", "専門選択", 40),
      course("AB90001", "人文専門", 16),
      course("FG45901", "指定科目", 6),
    ], id);
    expect(report.categories.find((item) => item.category === "specialized"))
      .toMatchObject({ earnedUnits: 60 });
    const over = checkGraduation([course("YBA1011", "専門選択", 70)], id);
    expect(over.categories.find((item) => item.category === "specialized"))
      .toMatchObject({ earnedUnits: 64 });
  });

  test("YA専門基礎の4群を別々に要求し、YBDは専門へ数える", () => {
    const report = checkGraduation([
      course("YAZ1211", "美術史概説A-1", 1),
      course("YAZ1221", "美術史概説A-2", 1),
      course("YAC1012", "素描基礎演習1", 2),
      course("YAL1012", "グラフィックツール基礎演習", 1),
      course("YAA1011", "美術史学概論", id === "art-studies-22" ? 3 : 2),
      course("YAX1601", "世界遺産学入門", 5),
      course("YBD1011", "版画専門", 2),
    ], id);
    const foundation = report.details.requirementItems.filter((item) => item.category === "specializedFoundation");
    expect(foundation.map((item) => item.minimumUnits)).toEqual(id === "art-studies-22" ? [13, 2, 3, 3] : [12, 2, 3, 2]);
    expect(foundation.every((item) => item.isSatisfied)).toBe(true);
    expect(report.categories.find((item) => item.category === "specializedFoundation"))
      .toMatchObject({ earnedUnits: id === "art-studies-22" ? 13 : 12, isSatisfied: true });
    expect(report.categories.find((item) => item.category === "specialized"))
      .toMatchObject({ earnedUnits: 2 });
    for (const missing of ["YAZ1221", "YAL1012", "YAA1011", "YAX1601"]) {
      const insufficient = checkGraduation((foundation[0]?.courses ?? []).filter((item) => item.id !== missing), id);
      expect(insufficient.categories.find((item) => item.category === "specializedFoundation")?.isSatisfied).toBe(false);
    }
  });

  test("関連科目はE・F系の2単位を別に要求し、教職・博物館・特設を認める", () => {
    const report = checkGraduation([
      course("9000001", "教職", 1), course("9900001", "博物館", 1),
      course("8000001", "特設", 2), course("EB10001", "生物", 2),
    ], id);
    expect(report.details.requirementItems.find((item) => item.label === "教職・博物館・特設関連科目"))
      .toMatchObject({ earnedUnits: 4 });
    expect(report.details.requirementItems.find((item) => item.label === "E・F系関連科目"))
      .toMatchObject({ earnedUnits: 2, isSatisfied: true });
    const missing = checkGraduation([course("AB10001", "他学類", 10)], id);
    expect(missing.details.requirementItems.find((item) => item.label === "E・F系関連科目")?.isSatisfied).toBe(false);
  });

  test("全年度を同じ意味の要件IDへ解決する", () => {
    for (const year of [2023, 2024, 2025, 2026]) {
      expect(resolveRequirementId("art", id.replace("-22", ""), year)).toBe(id);
    }
  });
});

test("芸術の領域別必修は実科目番号で消し込み、YB選択へ二重計上しない", () => {
  const report = checkGraduation([
    course("YBA9918", "卒業研究A(美術史領域)", 3),
    course("YBA9928", "卒業研究B(美術史領域)", 3),
    course("YBA9017", "美術史領域研究I", 1),
    course("YBA9027", "美術史領域研究II", 1),
    course("YBA9037", "美術史領域特別演習I", 1),
    course("YBA9047", "美術史領域特別演習II", 1),
    course("YBA9057", "美術史領域特別演習III", 1),
  ], "art-studies-22");
  expect(report.categories.find((item) => item.category === "compulsory")?.earnedUnits).toBe(11);
  expect(report.categories.find((item) => item.category === "specialized")?.earnedUnits).toBe(0);
  const missing = checkGraduation([course("YBA9918", "卒業研究A(美術史領域)", 3)], "art-studies-22");
  expect(missing.details.requirementItems.find((item) => item.label === "芸術卒業研究"))
    .toMatchObject({ earnedUnits: 3, isSatisfied: false });
});

test("日本芸術の未特定Japan-Expert指定1単位を他学類科目で埋めない", () => {
  const report = checkGraduation([course("AB10001", "他学類科目", 18)], "japanese-art-22");
  expect(report.details.requirementItems.find((item) => item.label.startsWith("Japan-Expert共通科目")))
    .toMatchObject({ earnedUnits: 0, minimumUnits: 1, isSatisfied: false });
});

test("日本芸術必修の日本語15単位を英語で代替しない", () => {
  const report = checkGraduation([course("31H0011", "英語", 15)], "japanese-art-22");
  expect(report.details.requirementItems.find((item) => item.label === "日本語"))
    .toMatchObject({ earnedUnits: 0, isSatisfied: false });
});

test("YA内数と共通・関連の上限は合計へ二重加算しない", () => {
  const report = checkGraduation([
    course("YAZ1211", "美術史概説A-1", 2),
    course("YAC1012", "素描基礎演習1", 3),
    course("YAA1011", "美術史学概論", 16),
    course("1200001", "学士基盤", 4),
    course("4000001", "芸術", 4),
    course("5000001", "国語", 3),
    course("EB10001", "生物", 15),
    course("AB10001", "他学類", 19),
  ], "art-studies-22");
  expect(report.categories.find((item) => item.category === "specializedFoundation"))
    .toMatchObject({ earnedUnits: 20, isSatisfied: true });
  expect(report.categories.find((item) => item.category === "common")?.earnedUnits).toBe(8);
  expect(report.categories.find((item) => item.category === "related")?.earnedUnits).toBe(24);
  expect(report.details.requirementItems.find((item) => item.label === "E・F系関連科目")?.earnedUnits).toBe(14);
  expect(report.details.requirementItems.find((item) => item.label === "他学群・他学類の関連科目")?.earnedUnits).toBe(18);
});
