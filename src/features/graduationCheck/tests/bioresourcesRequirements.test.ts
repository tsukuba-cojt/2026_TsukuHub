import { describe, expect, test, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { checkGraduation, checkGraduationWithCatalog, listStudentCourseOptions } from "../checkGraduation";
import { gradRequirementData } from "../data/gradRequirementData";
import { resolveRequirementId } from "../data/supportedDepartments";
import { classifyUncountedCourse } from "../manualClassification";
import type { Course } from "../types";
import { course } from "./helpers";

afterEach(() => vi.unstubAllGlobals());
const typed = (id: string, name: string, units: number, method: Course["catalogInstructionMethod"]): Course => ({
  ...course(id, name, units, "A", 2026), catalogInstructionMethod: method,
});
const specialist = (prefix: string): Course[] => [
  { ...typed("EC21011", "基幹", 8, "lecture"), catalogBioresourcesCore: true },
  typed("EC25022", "EC2演習", 3, "seminar"), typed("EC29991", "その他EC2", 8, "lecture"),
  typed(`${prefix}0036`, "所属実験演習", 4, "experiment"), typed(`${prefix}0011`, "所属講義", 8, "lecture"),
  typed("BB00001", "その他専門", 22, "lecture"),
];
const item = (courses: Course[], key: string | undefined, label: string) =>
  checkGraduation(courses, "bioresources-24", { courseKey: key }).details.requirementItems.find((entry) => entry.label === label);

describe("生物資源科学主専攻の所属コース", () => {
  test.each([
    ["agrobiology", "EC31"], ["biochemistry", "EC32"],
    ["environmental-engineering", "EC33"], ["socioeconomics", "EC34"],
  ])("%s は所属コースの12単位と実験等4単位を要求する", (key, prefix) => {
    const report = checkGraduation(specialist(prefix), "bioresources-24", { courseKey: key });
    expect(report.categories.find((entry) => entry.category === "specialized"))
      .toMatchObject({ earnedUnits: 53, isSatisfied: true });
    const missing = specialist(prefix);
    missing[3].unit = 3;
    expect(item(missing, key, "所属コースの実験・実習・演習4単位"))
      .toMatchObject({ earnedUnits: 3, isSatisfied: false });
    missing[4].unit = 9;
    expect(checkGraduation(missing, "bioresources-24", { courseKey: key }).categories
      .find((entry) => entry.category === "specialized")?.isSatisfied).toBe(false);
  });
  test("他コースの単位・演習で不足を代替しない", () => {
    expect(item(specialist("EC32"), "agrobiology", "所属コースのEC3専門科目"))
      .toMatchObject({ earnedUnits: 0, isSatisfied: false });
  });
  test.each([undefined, "invalid"])("未選択・不正な所属%sでは確認不能とする", (key) => {
    expect(item(specialist("EC31"), key, "所属コースのEC3専門科目")?.attributeEvaluation?.status).toBe("unknown");
  });
  test("所属コースの属性だけが不明なら実験等の内数を確認不能にする", () => {
    const candidates = specialist("EC31");
    delete candidates[3].catalogInstructionMethod;
    expect(item(candidates, "agrobiology", "所属コースの実験・実習・演習4単位")?.attributeEvaluation?.status).toBe("unknown");
  });
  test("基幹8単位とEC2の実験等3単位は合計19単位とは別に判定する", () => {
    const candidates = specialist("EC31");
    candidates[0].unit = 7;
    candidates[2].unit = 9;
    expect(item(candidates, "agrobiology", "EC2基幹科目"))
      .toMatchObject({ earnedUnits: 7, isSatisfied: false });
    candidates[0].unit = 8;
    candidates[2].unit = 8;
    candidates[1].catalogInstructionMethod = "lecture";
    expect(item(candidates, "agrobiology", "EC2の実験・実習・演習3単位")?.isSatisfied).toBe(false);
  });
  test("指定専門基礎は講義11単位と実験等1単位をそれぞれ要求する", () => {
    const candidates = [typed("EC00001", "生物資源と環境", 3, "lecture"),
      typed("FB10001", "化学", 11, "lecture"), typed("FB10003", "化学実験", 4, "experiment")];
    const report = checkGraduation(candidates, "bioresources-24", { courseKey: "agrobiology" });
    expect(report.categories.find((entry) => entry.category === "specializedFoundation"))
      .toMatchObject({ earnedUnits: 18, isSatisfied: true });
    candidates[1].unit = 10;
    candidates[2].unit = 5;
    expect(item(candidates, "agrobiology", "専門基礎の講義11単位")?.isSatisfied).toBe(false);
    candidates[1].unit = 15;
    candidates.splice(2, 1);
    expect(item(candidates, "agrobiology", "専門基礎の実験・実習・演習1単位")?.isSatisfied).toBe(false);
  });
  test("2022は基幹10単位・EC2合計21・EC3合計16を維持する", () => {
    const report = checkGraduation(specialist("EC31"), "bioresources-22", { courseKey: "agrobiology" });
    expect(report.details.requirementItems.find((entry) => entry.label === "EC2基幹科目"))
      .toMatchObject({ minimumUnits: 10, isSatisfied: false });
    expect(report.details.requirementItems.find((entry) => entry.label === "EC3専門科目"))
      .toMatchObject({ minimumUnits: 16, isSatisfied: false });
  });
  test("手動分類しても所属コース条件は消えず、選択属性を保持する", () => {
    const report = checkGraduation([...specialist("EC32"), course("EC00001", "不明", 12)], "bioresources-24", { courseKey: "agrobiology" });
    const classified = classifyUncountedCourse(report, 0, "specialized");
    expect(classified.studentContext).toEqual({ courseKey: "agrobiology" });
    expect(classified.details.requirementItems.find((entry) => entry.label === "所属コースのEC3専門科目")?.isSatisfied).toBe(false);
  });
  test("124単位でも所属コース未選択・他コースの単位では卒業充足にしない", () => {
    const required = [
      course("EC13112", "専門語学I", 2), course("EC14112", "専門語学II", 2),
      course("REQ0001", "卒業研究I", 5), course("REQ0002", "卒業研究II", 5),
      course("EC11212", "生物資源科学演習", 1), course("1100001", "ファーストイヤーセミナー", 1),
      course("1227001", "学問への誘い", 1), course("2000001", "体育", 3), course("31H0011", "英語", 4),
      course("6000001", "情報", 4), course("5000001", "国語I", 1),
    ];
    const shared = [...required, typed("EC00001", "生物資源と環境", 3, "lecture"),
      typed("FB10001", "化学", 11, "lecture"), typed("FB10003", "化学実験", 4, "experiment"),
      course("1200011", "学士基盤", 1), course("X000001", "関連", 23)];
    expect(checkGraduation([...shared, ...specialist("EC31")], "bioresources-24", { courseKey: "agrobiology" }).summary)
      .toMatchObject({ earnedUnits: 124, isSatisfied: true });
    expect(checkGraduation([...shared, ...specialist("EC31")], "bioresources-24").summary)
      .toMatchObject({ earnedUnits: 124, shortageUnits: 0, isSatisfied: false });
    expect(checkGraduation([...shared, ...specialist("EC32")], "bioresources-24", { courseKey: "agrobiology" }).summary.isSatisfied).toBe(false);
  });
  test("2025の共通上限と2026の指定専門基礎一覧の差を維持する", () => {
    const credits = [course("4000001", "芸術", 6), course("BB10001", "経済学I", 2)];
    const old = checkGraduation(credits, "bioresources-24");
    const middle = checkGraduation(credits, "bioresources-25");
    const latest = checkGraduation(credits, "bioresources-26");
    expect(old.details.requirementItems.find((entry) => entry.label === "選択芸術")?.earnedUnits).toBe(1);
    expect(middle.details.requirementItems.find((entry) => entry.label === "その他の共通科目")?.earnedUnits).toBe(6);
    expect(middle.details.requirementItems.find((entry) => entry.label === "指定専門基礎科目")?.earnedUnits).toBe(2);
    expect(latest.details.requirementItems.find((entry) => entry.label === "指定専門基礎科目")?.earnedUnits).toBe(0);
  });
});

describe("生命環境学際主専攻", () => {
  test("指定基礎のEB09103からEB09113への変更は2025年度から適用する", () => {
    const candidates = [course("EB09103", "旧指定", 1), course("EB09113", "新指定", 2)];
    const old = checkGraduation(candidates, "bioresources-interdisciplinary-24");
    const latest = checkGraduation(candidates, "bioresources-interdisciplinary-25");
    expect(old.details.requirementItems.find((entry) => entry.label === "学際専門基礎科目")?.earnedUnits).toBe(1);
    expect(latest.details.requirementItems.find((entry) => entry.label === "学際専門基礎科目")?.earnedUnits).toBe(2);
  });
  test("コース選択を要求せずEG6の25単位を独立に判定する", () => {
    expect(listStudentCourseOptions("bioresources-interdisciplinary-24")).toEqual([]);
    const report = checkGraduation([course("EG60011", "EG6", 24), course("EC31011", "その他専門", 21)], "bioresources-interdisciplinary-24");
    expect(report.details.requirementItems.find((entry) => entry.label === "EG6専門科目"))
      .toMatchObject({ earnedUnits: 24, isSatisfied: false });
    expect(report.categories.find((entry) => entry.category === "specialized")?.isSatisfied).toBe(false);
  });
  test("指定専門基礎と同じ内容の専門科目を重複させない", () => {
    const duplicate = { ...course("EC31012", "EG6と同一", 1), equivalentCourseIds: ["EG60012"] };
    const report = checkGraduation([duplicate, course("BE21861", "指定基礎", 1)], "bioresources-interdisciplinary-24");
    expect(report.details.uncountedCourses).toContain(duplicate);
    expect(report.details.requirementItems.find((entry) => entry.label === "学際専門基礎科目")?.earnedUnits).toBe(1);
  });
  test("共通・関連がそれぞれ下限を満たしても合計22単位に届かなければ不足", () => {
    const report = checkGraduation([course("1200011", "学士基盤", 1), course("X000001", "関連", 13)], "bioresources-interdisciplinary-24");
    expect(report.details.requirementItems.find((entry) => entry.label === "学際の共通・関連選択合計22単位"))
      .toMatchObject({ earnedUnits: 14, isSatisfied: false });
    const satisfied = checkGraduation([course("1200011", "学士基盤", 1), course("X000001", "関連", 21)], "bioresources-interdisciplinary-24");
    expect(satisfied.details.requirementItems.find((entry) => entry.label === "学際の共通・関連選択合計22単位")?.isSatisfied).toBe(true);
  });
});

test("運用対象の2023〜2026年度差を解決し、過去の2022版も比較用に保持する", () => {
  for (const [year, main, interdisciplinary] of [
    [2023, "bioresources-24", "bioresources-interdisciplinary-24"],
    [2024, "bioresources-24", "bioresources-interdisciplinary-24"],
    [2025, "bioresources-25", "bioresources-interdisciplinary-25"],
    [2026, "bioresources-26", "bioresources-interdisciplinary-25"],
  ] as const) {
    expect(resolveRequirementId("bioresources", "bioresources", year)).toBe(main);
    expect(resolveRequirementId("bioresources", "bioresources-interdisciplinary", year)).toBe(interdisciplinary);
  }
  expect(gradRequirementData["bioresources-interdisciplinary-22"].courses.compulsorySumUnit).toBe(29);
});

test.each([2023, 2024, 2025, 2026])("%i年度の固定データで基幹・講義・演習を補完する", async (year) => {
  const payload = JSON.parse(readFileSync(`public/data/graduation/tsukuba-${year}-cross-listings.json`, "utf8"));
  expect(payload.bioresources_core_courses).toContain("EC21011");
  expect(payload.instruction_methods.EC21011).toBe("lecture");
  expect(payload.instruction_methods.EC34012).toBe("seminar");
  payload.university = `bioresources-${year}`;
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));
  const report = await checkGraduationWithCatalog([course("EC21011", "植物生理学", 8, "A", year)],
    "bioresources-24", payload.university, { courseKey: "agrobiology" });
  expect(report.details.requirementItems.find((entry) => entry.label === "EC2基幹科目")?.earnedUnits).toBe(8);
});
