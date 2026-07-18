import { describe, expect, test } from "vitest";
import { checkCompulsory, countCompulsoryUnits } from "../checkCompulsory";
import type { GradRequirement } from "../types";
import { course } from "./helpers";

/** 3記法を1つずつ含む最小の要件データ */
const requirement: GradRequirement = {
  header: { department: "テスト学類", major: "テスト", enrollYear: 2023 },
  courses: {
    compulsory: [
      "卒業研究A",
      "微分積分A//['微積分1', '微積分2']",
      "情報::4",
      "必修英語::2",
    ],
    compulsorySumUnit: 11,
    select: [],
    selectMinimumUnit: 0,
    groups: [],
  },
};

describe("checkCompulsory: 科目名一致", () => {
  test("合格していれば passed、Dなら failed で単位も数えない", () => {
    const passed = checkCompulsory([course("X1", "卒業研究A", 3, "A")], requirement);
    expect(passed.compulsoryResults[0]).toMatchObject({
      name: "卒業研究A",
      passed: true,
    });
    expect(countCompulsoryUnits(passed.compulsoryResults, false)).toBe(3);

    const failed = checkCompulsory([course("X1", "卒業研究A", 3, "D")], requirement);
    expect(failed.compulsoryResults[0].passed).toBe(false);
    expect(countCompulsoryUnits(failed.compulsoryResults, false)).toBe(0);
  });

  test("未履修の必修は passed=false・科目なし", () => {
    const { compulsoryResults } = checkCompulsory([], requirement);
    expect(compulsoryResults[0]).toMatchObject({ passed: false, courses: [] });
  });
});

describe("checkCompulsory: 代替科目（//記法）", () => {
  test("本体がなくても代替科目群がすべて合格なら充足", () => {
    const { compulsoryResults } = checkCompulsory(
      [course("Y1", "微積分1", 1, "A"), course("Y2", "微積分2", 1, "B")],
      requirement
    );
    const result = compulsoryResults.find((r) => r.name === "微分積分A");
    expect(result).toMatchObject({ passed: true, alternative: "微積分1, 微積分2" });
    expect(result?.courses).toHaveLength(2);
  });

  test("代替科目が一部しかない・不合格を含むなら未充足", () => {
    const partial = checkCompulsory([course("Y1", "微積分1", 1, "A")], requirement);
    expect(
      partial.compulsoryResults.find((r) => r.name === "微分積分A")?.passed
    ).toBe(false);

    const withFail = checkCompulsory(
      [course("Y1", "微積分1", 1, "A"), course("Y2", "微積分2", 1, "F")],
      requirement
    );
    expect(
      withFail.compulsoryResults.find((r) => r.name === "微分積分A")?.passed
    ).toBe(false);
  });

  test("本体があるときは本体で判定し、代替判定に入らない", () => {
    const { compulsoryResults } = checkCompulsory(
      [course("Y0", "微分積分A", 2, "A")],
      requirement
    );
    const result = compulsoryResults.find((r) => r.name === "微分積分A");
    expect(result).toMatchObject({ passed: true });
    expect(result?.alternative).toBeUndefined();
  });
});

describe("checkCompulsory: 科目群タグ（::記法）", () => {
  test("タグに該当する科目番号の単位を集め、指定単位以上で充足", () => {
    // 情報タグ = 科目番号が "6" 始まり
    const { compulsoryResults } = checkCompulsory(
      [course("6100101", "情報リテラシー", 2, "A"), course("6100202", "データサイエンス", 2, "B")],
      requirement
    );
    const result = compulsoryResults.find((r) => r.name === "情報");
    expect(result).toMatchObject({ isCourseGroup: true, passed: true, minimumUnit: 4 });
  });

  test("単位が足りなければ未充足。取得単位は必要単位数でキャップ", () => {
    const short = checkCompulsory(
      [course("6100101", "情報リテラシー", 2, "A")],
      requirement
    );
    expect(short.compulsoryResults.find((r) => r.name === "情報")?.passed).toBe(false);

    const over = checkCompulsory(
      [
        course("6100101", "情報リテラシー", 2, "A"),
        course("6100202", "データサイエンス", 2, "B"),
        course("6100303", "プログラミング基礎", 2, "A"),
      ],
      requirement
    );
    // 6単位取得しているが「情報::4」なので4単位でキャップ
    expect(countCompulsoryUnits(over.compulsoryResults, false)).toBe(4);
  });

  test("認定（認）の必修英語は科目名から科目番号へ読み替えて判定する", () => {
    const { compulsoryResults } = checkCompulsory(
      [
        course("", "English Reading Skills I", 1, "認"),
        course("", "English Presentation Skills I", 1, "認"),
      ],
      requirement
    );
    // 必修英語タグ = 31H/31J/31K/31L 始まり。認定は id が空でも名前から読み替える
    expect(compulsoryResults.find((r) => r.name === "必修英語")?.passed).toBe(true);
  });
});

describe("checkCompulsory: 消し込みと履修中", () => {
  test("マッチした科目は remainingCourses から除かれる", () => {
    const courses = [
      course("X1", "卒業研究A", 3, "A"),
      course("6100101", "情報リテラシー", 2, "A"),
      course("GC51234", "選択の科目", 2, "A"), // どの必修にもマッチしない
    ];
    const { remainingCourses } = checkCompulsory(courses, requirement);
    expect(remainingCourses.map((c) => c.id)).toEqual(["GC51234"]);
  });

  test("履修中は見込み単位にのみ含まれる", () => {
    const { compulsoryResults } = checkCompulsory(
      [course("X1", "卒業研究A", 3, "履修中")],
      requirement
    );
    expect(countCompulsoryUnits(compulsoryResults, false)).toBe(0);
    expect(countCompulsoryUnits(compulsoryResults, true)).toBe(3);
  });
});
