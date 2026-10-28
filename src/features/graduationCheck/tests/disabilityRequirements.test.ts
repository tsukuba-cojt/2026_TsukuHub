import { describe, expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

describe("障害科学類の監査", () => {
  test("CE専門32単位の内数8を守り、指定科目の余剰を二重加算せず他の専門へ使える", () => {
    const id = resolveRequirementId("disability", "disability", 2023)!;
    for (const shortage of [0, 1]) {
      const input = [course("CE31481", "医学概論I", 8 - shortage), course("CE50001", "その他CE", 24 + shortage),
        course("CB50001", "教育専門", 20), course("CC50001", "心理専門", 20)];
      const report = checkGraduation(input, id);
      expect(collectCategoryCourses(report).specialized).toEqual(input);
      expect(report.categories[1].isSatisfied).toBe(shortage === 0);
      if (shortage === 0) expect(report.categories[1].earnedUnits).toBe(71);
      expect(checkGraduation(input, id, undefined, "five-category").categories[1])
        .toMatchObject({ earnedUnits: 71, isSatisfied: true });
    }
    const surplus = checkGraduation([course("CE31481", "医学概論I", 12), course("CE50001", "その他CE", 20)], id);
    expect(surplus.categories[1]).toMatchObject({ earnedUnits: 32, isSatisfied: true });
    const missingCore = checkGraduation([course("CE31481", "医学概論I", 8), course("CE50001", "その他CE", 23),
      course("CB50001", "教育専門", 40)], id);
    expect(missingCore.categories[1].isSatisfied).toBe(false);
  });

  test("2022は生理病理4・心理相談4を別々に要求し、2023から指定8へ統合する", () => {
    const base = course("CE50001", "その他CE", 24);
    const medical = course("CE31481", "医学概論I", 4);
    const support = course("CE31281", "相談援助の基盤と専門職I", 4);
    expect(checkGraduation([medical, support, base], "disability-22").categories[1].isSatisfied).toBe(true);
    const oneSide = [course("CE31481", "医学概論I", 8), base];
    expect(checkGraduation(oneSide, "disability-22").categories[1].isSatisfied).toBe(false);
    const modern = resolveRequirementId("disability", "disability", 2023)!;
    expect(checkGraduation(oneSide, modern).categories[1].isSatisfied).toBe(true);
    const renamed = [course("CE21411", "視覚障害児の心理・生理・病理", 8), base];
    expect(checkGraduation(renamed, "disability-22").categories[1].isSatisfied).toBe(false);
    expect(checkGraduation(renamed, modern).categories[1].isSatisfied).toBe(true);
    const nonDesignated = checkGraduation([course("CE31421", "相談援助の理論と方法III", 8), base], modern);
    expect(nonDesignated.categories[1].isSatisfied).toBe(false);
  });

  test("基礎必修の同名概論を番号で区別し、必修・コア・CB/CC専門へ一度ずつ割り当てる", () => {
    const required = course("CC11211", "心理学概論", 2);
    const sameName = course("CB23481", "心理学概論", 1);
    const core = course("CA10201", "人間学II", 11);
    const report = checkGraduation([required, sameName, core], "disability-22");
    expect(collectCategoryCourses(report).compulsory).toEqual([required]);
    expect(collectCategoryCourses(report).specialized).toEqual([sameName]);
    expect(collectCategoryCourses(report).specializedFoundation).toEqual([core]);
    expect(report.categories[0].earnedUnits).toBe(2);
    expect(report.categories[2].earnedUnits).toBe(10);
  });

  test("関連は2022の学群外補集合と2023以降の他学群6単位・資格等の別枠を分ける", () => {
    const credential = course("9000001", "教職科目", 6);
    const other = course("D000001", "人間学群以外", 2);
    const old = checkGraduation([credential, other], "disability-22");
    expect(collectCategoryCourses(old).related).toEqual([credential, other]);
    expect(old.categories[4].isSatisfied).toBe(true);
    const modernId = resolveRequirementId("disability", "disability", 2023)!;
    const modern = checkGraduation([credential, other], modernId);
    expect(modern.categories[4].isSatisfied).toBe(false);
    expect(modern.details.uncountedCourses).toEqual([other]);
    expect(checkGraduation([credential, course("E000001", "他学群", 6)], modernId).categories[4].isSatisfied).toBe(true);
    expect(checkGraduation([credential], modernId, undefined, "five-category").categories[4].isSatisfied).toBe(true);
  });

  test("運用対象の2023〜2026を解決し、5分類の下限と共通40単位上限を維持する", () => {
    for (const year of [2023, 2024, 2025, 2026]) {
      const id = resolveRequirementId("disability", "disability", year)!;
      expect(id).toBe(year === 2022 ? "disability-22" : "disability-23");
      const report = checkGraduation([course("1200011", "学士基盤", 1), course("4000001", "芸術", 40)], id);
      expect(report.categories.map((item) => item.requiredUnits)).toEqual([46, 32, 0, 1, 6]);
      expect(report.summary.requiredUnits).toBe(124);
      expect(report.categories[3].earnedUnits).toBe(40);
    }
  });
});
