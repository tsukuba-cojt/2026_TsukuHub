import { afterEach, expect, test, vi } from "vitest";
import { readFileSync } from "node:fs";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation, checkGraduationWithCatalog } from "../checkGraduation";
import { classifyUncountedCourse } from "../manualClassification";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

const majors = ["klis-ksc", "klis-kis", "klis-irm"];
afterEach(() => vi.unstubAllGlobals());
test("3主専攻の2023〜2025を共用し、2026は必修43・選択81・基礎30〜50へ分離する", () => {
  for (const major of majors) {
    for (const year of [2023, 2024, 2025]) {
      const id = resolveRequirementId("klis", major, year)!;
      expect(id).toBe(`${major}-23`);
      const report = checkGraduation([], id, undefined, "five-category");
      expect(report.categories.map((c) => c.requiredUnits)).toEqual([41, 24, 32, 1, 6]);
      expect(report.summary.requiredUnits).toBe(124);
    }
    expect(resolveRequirementId("klis", major, 2022)).toBeNull();
    const revised = resolveRequirementId("klis", major, 2026)!;
    expect(revised).toBe(`${major}-26`);
    const report = checkGraduation([], revised, undefined, "five-category");
    expect(report.categories.map((c) => c.requiredUnits)).toEqual([43, 24, 30, 1, 6]);
    expect(report.summary.requiredUnits).toBe(124);
    expect(report.details.selectResults[2]).toMatchObject({ minimum: 30, maximum: 50 });
  }
});

test("既存画面APIの5分類・年度カタログ・手動分類で2026の81＋43＝124を扱う", async () => {
  const payload = JSON.parse(readFileSync("public/data/graduation/tsukuba-2026-cross-listings.json", "utf8"));
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));
  for (const [index, major] of majors.entries()) {
    const id = resolveRequirementId("klis", major, 2026)!;
    const courses = [course("", "確認済み必修認定", 43, "認", 2026),
      course(`GE${index + 6}9991`, "専門", 44, "A", 2026), course("GE20001", "基礎", 30, "A", 2026),
      course("1200011", "学士基盤", 1, "A", 2026), course("BA20001", "関連", 6, "A", 2026)];
    const initial = await checkGraduationWithCatalog(courses, id, "tsukuba");
    expect(initial.evaluationMode).toBe("five-category");
    expect(initial.catalogVerification.verifiedAcademicYears).toEqual([2026]);
    expect(initial.summary.isSatisfied).toBe(false);
    const classified = classifyUncountedCourse(initial, 0, "compulsory");
    expect(classified.evaluationMode).toBe("five-category");
    expect(classified.categories.map((c) => c.earnedUnits)).toEqual([43, 44, 30, 1, 6]);
    expect(classified.summary).toMatchObject({ earnedUnits: 124, shortageUnits: 0, isSatisfied: true });
    const unrelated = course("AA90001", "卒業論文", 2);
    expect(collectCategoryCourses(checkGraduation([unrelated], id)).compulsory).toEqual([]);
  }
});

test("自主専攻16・その他8を別々に要求し、自主専攻との二重開設をその他8へ混入させない", () => {
  for (const [i, major] of majors.entries()) {
    const own = `GE${i + 6}`;
    const other = i === 0 ? "GE7" : "GE6";
    const id = resolveRequirementId("klis", major, 2024)!;
    for (const shortage of [0, 1]) {
      const input = [course(`${own}9991`, "自主専攻", 16 - shortage), course(`${other}9991`, "その他専門", 8 + shortage)];
      expect(checkGraduation(input, id).categories[1].isSatisfied).toBe(shortage === 0);
      expect(checkGraduation(input, id, undefined, "five-category").categories[1].isSatisfied).toBe(true);
    }
    const dual = { ...course(`${other}9991`, "自主専攻との共通開設", 8), equivalentCourseIds: [`${own}9991`] };
    const report = checkGraduation([course(`${own}9991`, "自主専攻", 16), dual], id);
    expect(report.details.uncountedCourses).toEqual([dual]);
    expect(report.categories[1].isSatisfied).toBe(false);
  }
});

test("関連は他学群等6が必須で、GB・GCだけでは代替せず補集合の二重開設も除く", () => {
  const id = resolveRequirementId("klis", "klis-ksc", 2023)!;
  const gb = course("GB20001", "GB関連", 20);
  expect(checkGraduation([gb], id).categories[4].isSatisfied).toBe(false);
  expect(checkGraduation([gb], id, undefined, "five-category").categories[4].isSatisfied).toBe(true);
  expect(checkGraduation([gb, course("BA20001", "他学群", 6)], id).categories[4])
    .toMatchObject({ earnedUnits: 26, isSatisfied: true });
  const dual = { ...course("BA20001", "除外区分との同一授業", 6), equivalentCourseIds: ["GA10001"] };
  expect(checkGraduation([dual], id).details.uncountedCourses).toEqual([dual]);
});

test("同名卒研の混入と演習Iだけでの6単位充足を防ぎ、必修41を一度ずつ数える", () => {
  const id = resolveRequirementId("klis", "klis-ksc", 2025)!;
  const other = course("GC48708", "卒業研究A", 3);
  const own = course("GE51118", "卒業研究A", 3);
  expect(collectCategoryCourses(checkGraduation([other, own], id)).compulsory).toEqual([own]);
  const duplicatedPhase = checkGraduation([course("GE11012", "知識情報演習I-1", 4), course("GE11022", "知識情報演習I-2", 2)], id);
  expect(duplicatedPhase.categories[0].earnedUnits).toBe(2);
  const required = [own, course("GE51218", "卒業研究B", 3), course("GE50712", "専門英語B-1", 1), course("GE50812", "専門英語C-1", 1),
    course("GE60113", "知識科学実習A", 1), course("GE60123", "知識科学実習B", 1),
    ...["知識情報概論", "アカデミックスキルズ", "プログラミング入門B", "専門英語A1", "専門英語A2"]
      .map((name, i) => course(`GA00${i}`, name, 1)),
    ...["プログラミング入門A", "情報数学A", "統計", "哲学"].map((name, i) => course(`GE00${i}`, name, 2)),
    course("GE11012", "知識情報演習I-1", 2), course("GE11112", "知識情報演習II-1", 2), course("GE11212", "知識情報演習III-1", 2),
    course("1100011", "ファーストイヤーセミナー", 1), course("1100021", "学問への誘い", 1), course("6100011", "情報", 4),
    course("2100011", "体育", 2), course("31H0011", "英語", 4)];
  const input = [...required, course("GE69991", "自主専攻", 16), course("GE79991", "その他専門", 28),
    course("GE20001", "基礎", 32), course("1200011", "学士基盤", 1), course("BA20001", "他学群", 6)];
  const report = checkGraduation(input, id, undefined, "five-category");
  expect(report.categories.map((c) => c.earnedUnits)).toEqual([41, 44, 32, 1, 6]);
  expect(report.summary).toMatchObject({ earnedUnits: 124, shortageUnits: 0, isSatisfied: true });
  expect(checkGraduation(input.slice(0, -1), id, undefined, "five-category").summary.isSatisfied).toBe(false);
});

test("学士基盤に根拠のない4単位上限を設けず、専門44・基礎52・共通21・関連26を守る", () => {
  for (const major of majors) {
    const id = resolveRequirementId("klis", major, 2024)!;
    expect(checkGraduation([course("1200011", "学士基盤", 10)], id).categories[3].earnedUnits).toBe(10);
    for (const shortage of [0, 1]) {
      expect(checkGraduation([course("GE20001", "基礎", 32 - shortage)], id, undefined, "five-category")
        .categories[2].isSatisfied).toBe(shortage === 0);
    }
    const report = checkGraduation([course("GE69991", "専門", 50), course("GE20001", "基礎", 70),
      course("1200011", "学士基盤", 30), course("BA20001", "関連", 40)], id, undefined, "five-category");
    expect(report.categories.slice(1).map((c) => c.earnedUnits)).toEqual([44, 52, 21, 26]);
  }
});
