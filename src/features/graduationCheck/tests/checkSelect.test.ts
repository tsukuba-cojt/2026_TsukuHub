import { describe, expect, test } from "vitest";
import { checkSelect } from "../checkSelect";
import type { GradRequirement } from "../types";
import { course } from "./helpers";

const requirement: GradRequirement = {
  header: { department: "テスト学類", major: "テスト", enrollYear: 2023 },
  courses: {
    compulsory: [],
    compulsorySumUnit: 0,
    select: [
      [["GC5", "GA4"], 20, 35, false, "専門", 0],
      [["*学士基盤科目"], 1, 4, false, "学士基盤科目", 2],
      // 否定条件: 上記プレフィックス群に該当しない科目（=他学群など）
      [["GC", "GA", "*学士基盤科目"], 6, 15, true, "他学群の授業科目", 3],
    ],
    selectMinimumUnit: 27,
    groups: [
      [0, 20, 35, "専門科目選択"],
      [2, 1, 4, "共通科目選択"],
      [3, 6, 15, "関連科目選択"],
    ],
  },
};

describe("checkSelect", () => {
  test("科目番号プレフィックスでマッチする", () => {
    const { selectResults } = checkSelect(
      [course("GC51234", "専門科目", 2), course("GA40001", "専門科目2", 2)],
      requirement
    );
    expect(selectResults[0].courses.map((c) => c.id)).toEqual([
      "GC51234",
      "GA40001",
    ]);
  });

  test("*タグは courseCodeTypes に展開され except を除外する", () => {
    // 学士基盤科目 = 12,14 始まり、ただし 1227/1228 は除外
    const { selectResults } = checkSelect(
      [
        course("1226011", "学士基盤の科目", 1),
        course("1227011", "学問への誘い", 1), // except → タグにマッチしない
      ],
      requirement
    );
    expect(selectResults[1].courses.map((c) => c.id)).toEqual(["1226011"]);
  });

  test("除外要件はプレフィックス群に該当しない科目がマッチする", () => {
    const { selectResults } = checkSelect(
      [
        course("GC51234", "専門科目", 2), // GC → 除外要件にはマッチしない
        course("8001234", "自由科目", 2), // どのプレフィックスでもない → マッチ
      ],
      requirement
    );
    expect(selectResults[2].courses.map((c) => c.id)).toEqual(["8001234"]);
  });

  test("先の要件でマッチした科目は後の要件で二重計上しない", () => {
    const { selectResults, leftCourses } = checkSelect(
      [course("GC51234", "専門科目", 2)],
      requirement
    );
    expect(selectResults[0].courses).toHaveLength(1);
    expect(selectResults[2].courses).toHaveLength(0);
    expect(leftCourses).toHaveLength(0);
  });

  test("除外要件では *タグの except を該当扱いに戻す（参考リポジトリ準拠）", () => {
    // 1227 は学士基盤タグの except → 通常要件にはマッチしないが除外要件にはマッチ
    const { selectResults } = checkSelect(
      [course("1227011", "学問への誘い", 1)],
      requirement
    );
    expect(selectResults[2].courses.map((c) => c.id)).toEqual(["1227011"]);
  });

  test("どの要件にもマッチしない科目は leftCourses に残る", () => {
    const noExcludeRequirement: GradRequirement = {
      ...requirement,
      courses: {
        ...requirement.courses,
        select: [[["GC5"], 20, 35, false, "専門", 0]],
      },
    };
    const { leftCourses } = checkSelect(
      [course("GC51234", "専門科目", 2), course("ZZ00001", "対象外の科目", 1)],
      noExcludeRequirement
    );
    expect(leftCourses.map((c) => c.id)).toEqual(["ZZ00001"]);
  });
});
