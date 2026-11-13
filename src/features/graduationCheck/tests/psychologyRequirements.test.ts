import { describe, expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

describe("心理学類の監査", () => {
  test("教育学類の同名の卒業研究・心理学概論を、心理学類の必修へ誤計上しない", () => {
    const required = [course("CC21918", "卒業研究", 6), course("CC11211", "心理学概論", 2)];
    const other = [course("CB21918", "卒業研究", 6), course("CB23481", "心理学概論", 1)];
    const report = checkGraduation([...required, ...other], resolveRequirementId("psychology", "psychology", 2023)!);
    expect(collectCategoryCourses(report).compulsory).toEqual(required);
    expect(collectCategoryCourses(report).specialized).toEqual(other);
    expect(report.categories[0].earnedUnits).toBe(8);
  });

  test("CC21単位とその内数CC27の6単位を要求し、CB・CEの専門枠では代替しない", () => {
    for (const shortage of [0, 1]) {
      const courses = [course("CC27001", "心理専門", 6), course("CC50001", "心理専門その他", 15 - shortage),
        course("CB50001", "教育専門", 20), course("CE50001", "障害専門", 20)];
      const report = checkGraduation(courses, "psychology-22");
      expect(collectCategoryCourses(report).specialized).toEqual(courses);
      expect(collectCategoryCourses(report).related).toEqual([]);
      expect(report.categories[1].isSatisfied).toBe(shortage === 0);
      if (shortage === 0) expect(report.categories[1].earnedUnits).toBe(58);
      expect(checkGraduation(courses, "psychology-22", undefined, "five-category").categories[1])
        .toMatchObject({ earnedUnits: 58, isSatisfied: true });
    }
  });

  test("研究実習IIは専門基礎へ一度だけ割り当て、詳細上限3・CA上限10を守る", () => {
    const practice = course("CC11293", "心理学研究実習II", 4);
    const core = course("CA10201", "人間学II", 11);
    const courses = [practice, core];
    const detailed = checkGraduation(courses, "psychology-22");
    expect(collectCategoryCourses(detailed).specializedFoundation).toEqual(courses);
    expect(collectCategoryCourses(detailed).specialized).toEqual([]);
    expect(detailed.categories[2].earnedUnits).toBe(13);
    const coarse = checkGraduation(courses, "psychology-22", undefined, "five-category");
    expect(coarse.categories[2].earnedUnits).toBe(13);
    for (const [item, capped] of [[practice, 3], [core, 10]] as const) {
      expect(checkGraduation([item], "psychology-22").categories[2].earnedUnits).toBe(capped);
      expect(checkGraduation([item], "psychology-22", undefined, "five-category").categories[2].earnedUnits).toBe(item.unit);
    }
  });

  test("2022の関連補集合と2023以降の他学群6単位条件を区別し、教職の除外は共通で守る", () => {
    const credential = course("9000001", "教職科目", 6);
    const excluded = [course("9000002", "こころの発達", 2), course("9000003", "学習の心理", 2)];
    const other = course("D000001", "人間学群以外", 2);
    const old = checkGraduation([credential, ...excluded, other], "psychology-22");
    expect(collectCategoryCourses(old).related).toEqual([credential, other]);
    expect(old.details.uncountedCourses).toEqual(excluded);
    expect(old.categories[4].isSatisfied).toBe(true);
    const modernId = resolveRequirementId("psychology", "psychology", 2023)!;
    const modern = checkGraduation([credential, ...excluded, other], modernId);
    expect(modern.categories[4].isSatisfied).toBe(false);
    expect(modern.details.uncountedCourses).toEqual([...excluded, other]);
    expect(checkGraduation([credential, course("E000001", "他学群", 6)], modernId).categories[4].isSatisfied).toBe(true);
    const special = course("8149911", "8始まりの特設科目", 1);
    expect(collectCategoryCourses(checkGraduation([special], modernId)).related).toEqual([special]);
  });

  test("保存した2022版と運用対象の2023〜2026版で、学士基盤上限の詳細判定を分ける", () => {
    for (const year of [2022, 2023, 2024, 2025, 2026]) {
      const id = year === 2022 ? "psychology-22" : resolveRequirementId("psychology", "psychology", year)!;
      expect(id).toBe(year === 2022 ? "psychology-22" : "psychology-23");
      const courses = [course("1200011", "学士基盤", 5)];
      const detailed = checkGraduation(courses, id);
      expect(detailed.summary.requiredUnits).toBe(124);
      expect(detailed.categories.map((item) => item.requiredUnits)).toEqual([59, 21, 0, 1, 6]);
      expect(detailed.categories[3].earnedUnits).toBe(year === 2022 ? 1 : 5);
      expect(checkGraduation(courses, id, undefined, "five-category").categories[3].earnedUnits).toBe(5);
    }
  });
});
