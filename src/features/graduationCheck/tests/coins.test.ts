/**
 * 情報科学類（coins）の要件データの回帰テスト
 *
 * データの整合（検算）に加えて、checkSelect が「定義順に評価してその場で消し込む」
 * ことに依存している select の並び順を固定する。行を入れ替えると落ちる。
 */

import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { checkSelect } from "../checkSelect";
import { gradRequirementData } from "../data/gradRequirementData";
import {
  findDepartment,
  listMajorAdmissionYears,
} from "../data/supportedDepartments";
import type { RequirementId } from "../types";
import { course } from "./helpers";

const coinsIds: RequirementId[] = [
  "coins-ss-23",
  "coins-is-23",
  "coins-im-23",
  "coins-ss-26",
  "coins-is-26",
  "coins-im-26",
];

/**
 * 必修をすべて修得したケースの成績。
 * 単位数はテスト用の値で、合計が compulsorySumUnit(54) と一致するようにしてある。
 */
const compulsoryCourses = [
  course("GB40001", "ソフトウェアサイエンス実験A", 3),
  course("GB40002", "ソフトウェアサイエンス実験B", 3),
  course("GB40003", "卒業研究A", 3),
  course("GB40004", "卒業研究B", 3),
  course("GB40005", "専門語学A", 1),
  course("GB40006", "専門語学B", 1),
  course("GA10001", "線形代数A", 2),
  course("GA10002", "線形代数B", 2),
  course("GA10003", "微分積分A", 2),
  course("GA10004", "微分積分B", 2),
  course("GA10005", "情報数学A", 3),
  course("GB10001", "専門英語基礎", 1),
  course("GB10002", "プログラミング入門A", 2),
  course("GB10003", "プログラミング入門B", 2),
  course("GB10004", "コンピュータとプログラミング", 3),
  course("GB10005", "データ構造とアルゴリズム", 3),
  course("GB10006", "データ構造とアルゴリズム実験", 3),
  course("GB10007", "論理回路", 2),
  course("GB10008", "論理回路演習", 1),
  course("1120001", "ファーストイヤーセミナー", 1),
  course("1227011", "学問への誘い", 1),
  course("6100101", "情報リテラシー", 2), // 情報::4
  course("6100202", "データサイエンス", 2),
  course("2100001", "体育（春）", 1), // 体育::2
  course("2100002", "体育（秋）", 1),
  course("31H0001", "English Reading Skills I", 1), // 必修英語::4
  course("31J0001", "English Presentation Skills I", 1),
  course("31K0001", "English Reading Skills II", 1),
  course("31L0001", "English Presentation Skills II", 1),
];

describe("情報科学類の要件データ（検算）", () => {
  test.each(coinsIds)("%s: 必修54 + 選択71 = 125単位", (id) => {
    const { compulsorySumUnit, selectMinimumUnit } =
      gradRequirementData[id].courses;
    expect(compulsorySumUnit).toBe(54);
    expect(selectMinimumUnit).toBe(71);
    expect(compulsorySumUnit + selectMinimumUnit).toBe(125);
  });

  test.each(coinsIds)("%s: グループの下限合計≦71≦上限合計", (id) => {
    const { groups, selectMinimumUnit } = gradRequirementData[id].courses;
    const minimumTotal = groups.reduce((total, [, min]) => total + min, 0);
    const maximumTotal = groups.reduce((total, [, , max]) => total + max, 0);
    expect(minimumTotal).toBe(67);
    expect(maximumTotal).toBe(75);
    expect(minimumTotal).toBeLessThanOrEqual(selectMinimumUnit);
    expect(maximumTotal).toBeGreaterThanOrEqual(selectMinimumUnit);
  });

  test("3主専攻とも2023〜2026年度が1年ずつ選べる", () => {
    const coins = findDepartment("coins");
    expect(coins?.majors.map((major) => major.key)).toEqual([
      "coins-ss",
      "coins-is",
      "coins-im",
    ]);
    for (const major of coins?.majors ?? []) {
      expect(listMajorAdmissionYears(major)).toEqual([2023, 2024, 2025, 2026]);
    }
  });
});

describe("情報科学類の必修判定", () => {
  test("必修をすべて修得すると必修区分は54単位で充足する", () => {
    const report = checkGraduation(compulsoryCourses, "coins-ss-23");
    const compulsory = report.categories[0];
    expect(compulsory.requiredUnits).toBe(54);
    expect(compulsory.earnedUnits).toBe(54);
    expect(compulsory.percentClamped).toBe(100);
    // 未充足の必修が残っていないこと
    expect(
      report.details.compulsoryResults.filter((result) => !result.passed)
    ).toEqual([]);
  });

  test("主専攻ごとに専門実験の科目名が入れ替わる", () => {
    expect(gradRequirementData["coins-is-23"].courses.compulsory).toContain(
      "情報システム実験A"
    );
    expect(gradRequirementData["coins-im-23"].courses.compulsory).toContain(
      "知能情報メディア実験B"
    );
    // 主専攻が違えば同名の実験は必修として認められない
    const report = checkGraduation(compulsoryCourses, "coins-is-23");
    expect(
      report.details.compulsoryResults.find(
        (result) => result.name === "情報システム実験A"
      )?.passed
    ).toBe(false);
  });
});

describe("情報科学類 select の並び順（消し込み順序の回帰）", () => {
  test("情報科学特別演習は専門科目選択に入り、専門基礎の GB1 行には入らない", () => {
    const specialSeminar = course("GB13332", "情報科学特別演習", 2);
    const { selectResults } = checkSelect(
      [specialSeminar],
      gradRequirementData["coins-ss-23"]
    );
    // 2行目（GB2, GB3, GB4, GA4 の行）で消し込まれる = 専門科目選択(group 0)
    expect(selectResults[1].group).toBe(0);
    expect(selectResults[1].courses).toEqual([specialSeminar]);
    // 5行目の GB1 行（専門基礎選択）には計上されない
    expect(selectResults[4].codes).toEqual(["GB1"]);
    expect(selectResults[4].group).toBe(1);
    expect(selectResults[4].courses).toEqual([]);
  });

  test("情報特別演習Ⅰ・Ⅱも同様に専門科目選択へ入る", () => {
    const { selectResults } = checkSelect(
      [
        course("GB13312", "情報特別演習Ⅰ", 2),
        course("GB13322", "情報特別演習Ⅱ", 2),
      ],
      gradRequirementData["coins-ss-23"]
    );
    expect(selectResults[1].courses.map((c) => c.id)).toEqual([
      "GB13312",
      "GB13322",
    ]);
    expect(selectResults[4].courses).toEqual([]);
  });

  test("除外規定に当たらない GB1 の科目は専門基礎の GB1 行に入る", () => {
    const { selectResults } = checkSelect(
      [course("GB11111", "専門基礎の科目", 2)],
      gradRequirementData["coins-ss-23"]
    );
    expect(selectResults[1].courses).toEqual([]);
    expect(selectResults[4].courses.map((c) => c.id)).toEqual(["GB11111"]);
  });

  test("GB20 始まりは1行目、GB20 以外の GB2 始まりは2行目", () => {
    const { selectResults } = checkSelect(
      [
        course("GB20001", "GB20の科目", 2),
        course("GB21001", "GB21の科目", 2),
      ],
      gradRequirementData["coins-ss-23"]
    );
    expect(selectResults[0].codes).toEqual(["GB20", "GB30", "GB40"]);
    expect(selectResults[0].courses.map((c) => c.id)).toEqual(["GB20001"]);
    expect(selectResults[1].courses.map((c) => c.id)).toEqual(["GB21001"]);
  });
});

describe("情報科学類 関連科目選択の年度差", () => {
  const otherSchoolCourse = course("FA12345", "他学群の科目", 2);

  test("2023〜2025年度入学: F 始まりは 0〜4単位の枠に入る", () => {
    const { selectResults } = checkSelect(
      [otherSchoolCourse],
      gradRequirementData["coins-ss-23"]
    );
    expect(selectResults[8].message).toBe("他学群の授業科目");
    expect(selectResults[8].courses).toEqual([]);
    expect(selectResults[9].message).toBe("E, F, GC, GE, H");
    expect(selectResults[9].minimum).toBe(0);
    expect(selectResults[9].maximum).toBe(4);
    expect(selectResults[9].courses).toEqual([otherSchoolCourse]);
  });

  test("2026年度入学: F 始まりは 6〜10単位の「他学群の授業科目」に入る", () => {
    const { selectResults } = checkSelect(
      [otherSchoolCourse],
      gradRequirementData["coins-ss-26"]
    );
    expect(selectResults[8].message).toBe("他学群の授業科目");
    expect(selectResults[8].minimum).toBe(6);
    expect(selectResults[8].maximum).toBe(10);
    expect(selectResults[8].courses).toEqual([otherSchoolCourse]);
    expect(selectResults[9].message).toBe("GC, GE");
    expect(selectResults[9].courses).toEqual([]);
  });

  test("関連科目選択以外の8行は2023年度と2026年度で同一", () => {
    expect(
      gradRequirementData["coins-ss-26"].courses.select.slice(0, 8)
    ).toEqual(gradRequirementData["coins-ss-23"].courses.select.slice(0, 8));
    expect(gradRequirementData["coins-ss-26"].courses.groups).toEqual(
      gradRequirementData["coins-ss-23"].courses.groups
    );
    expect(gradRequirementData["coins-ss-26"].courses.compulsory).toEqual(
      gradRequirementData["coins-ss-23"].courses.compulsory
    );
  });
});
