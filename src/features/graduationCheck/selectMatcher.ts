/**
 * 選択要件と科目のマッチング。
 *
 * This file contains code derived from Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker), MPL-2.0.
 * See LICENSE in this directory.
 *
 * 「どの規則に該当するか」の判定を、定義順に科目を消し込む処理から分離する。
 * 誤分類の調査ではこの関数を単独で使い、1科目が該当する全候補を確認できる。
 */

import { courseCodeTypes } from "./data/courseCodeTypes";
import type { CategoryKey, Course, SelectRequirementTuple } from "./types";
import { beginWithMatch, isUnnumberedRecognizedCredit } from "./utils";

type ExpandedCodes = { included: string[]; excepted: string[] };

/** "*タグ" を実際の科目番号プレフィックスへ展開する。 */
export const expandSelectCodes = (codes: readonly string[]): ExpandedCodes => {
  const included: string[] = [];
  const excepted: string[] = [];

  for (const code of codes) {
    if (!code.startsWith("*")) {
      included.push(code);
      continue;
    }

    const tag = courseCodeTypes[code.slice(1)];
    if (tag === undefined) {
      throw new Error(`未定義の科目番号タグです: ${code}`);
    }
    included.push(...tag.codes);
    excepted.push(...tag.except);
  }

  return { included, excepted };
};

/** 科目が選択要件1件に該当するかを返す（消し込み順には依存しない）。 */
export const matchesSelectRequirement = (
  course: Course,
  requirement: SelectRequirementTuple
): boolean => {
  const [codes, , , isExcludeRequirement, , , options] = requirement;
  const { included, excepted } = expandSelectCodes(codes);
  const matchesPrefix =
    beginWithMatch(course.id, included) &&
    !beginWithMatch(course.id, excepted);
  const matchesName = options?.includeCourseNames?.includes(course.name) ?? false;
  const isExceptedName =
    options?.excludeCourseNames?.includes(course.name) ?? false;
  const isExceptedCode = beginWithMatch(
    course.id,
    options?.excludeCodes ?? []
  );
  const isExcepted = isExceptedName || isExceptedCode;
  const equivalentMatchesPrefix =
    isExcludeRequirement &&
    (course.equivalentCourseIds?.some(
      (courseCode) =>
        beginWithMatch(courseCode, included) &&
        !beginWithMatch(courseCode, excepted),
    ) ?? false);
  const matchesConfiguredRule =
    matchesPrefix || matchesName || equivalentMatchesPrefix;

  return isExcludeRequirement
    ? !matchesConfiguredRule || isExcepted
    : matchesConfiguredRule && !isExcepted;
};

/**
 * 実際の割り当て用判定。必修・専門等の明示規則を先に評価した後、
 * 元科目を特定できない認定単位だけは関連科目へ推測配分しない。
 */
export const matchesSelectAllocationRequirement = (
  course: Course,
  requirement: SelectRequirementTuple,
  category: Exclude<CategoryKey, "compulsory"> | undefined,
): boolean =>
  !(category === "related" && isUnnumberedRecognizedCredit(course)) &&
  matchesSelectRequirement(course, requirement);
