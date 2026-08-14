/**
 * 選択科目の判定
 *
 * This file is derived from Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker), src/features/checkSelect.ts.
 * Licensed under the Mozilla Public License, v. 2.0 (MPL-2.0).
 * If a copy of the MPL was not distributed with this file, You can obtain one
 * at https://mozilla.org/MPL/2.0/.
 *
 * 各選択要件は科目番号プレフィックス（"*" 始まりは courseCodeTypes のタグ参照）で
 * マッチする。isExcludeRequirement=true の要件は「プレフィックス群に該当しない科目」が
 * マッチする否定条件（例: 他学群の授業科目）。
 *
 * 要件は定義順に判定し、マッチした科目はその場で候補から消し込む
 * （参考リポジトリと異なり要件間でも消し込むため、コード範囲が重複する
 * 要件データでも二重計上しない）。
 */

import { courseCodeTypes } from "./data/courseCodeTypes";
import type { Course, GradRequirement, SelectResult } from "./types";
import { beginWithMatch } from "./utils";

/** "*タグ" を含むプレフィックス群を { 対象, 除外 } の実プレフィックスへ展開する */
const expandCodes = (
  codes: readonly string[]
): { included: string[]; excepted: string[] } => {
  const included: string[] = [];
  const excepted: string[] = [];
  for (const code of codes) {
    if (code.startsWith("*")) {
      const { codes: tagCodes, except } = courseCodeTypes[code.slice(1)];
      included.push(...tagCodes);
      excepted.push(...except);
    } else {
      included.push(code);
    }
  }
  return { included, excepted };
};

export type CheckSelectResult = {
  selectResults: SelectResult[];
  /** どの選択要件にもマッチしなかった科目（卒業要件に含まれない単位） */
  leftCourses: Course[];
};

export const checkSelect = (
  courseList: Course[],
  requirement: GradRequirement
): CheckSelectResult => {
  const consumed = new Set<Course>();
  const selectResults: SelectResult[] = [];

  for (const [
    codes,
    minimum,
    maximum,
    isExcludeRequirement,
    message,
    group,
    options,
  ] of requirement.courses.select) {
    const { included, excepted } = expandCodes(codes);

    const matchesRequirement = (course: Course): boolean => {
      const matchesPrefix =
        beginWithMatch(course.id, included) &&
        !beginWithMatch(course.id, excepted);
      const matchesName =
        options?.includeCourseNames?.includes(course.name) ?? false;
      const isExceptedName =
        options?.excludeCourseNames?.includes(course.name) ?? false;
      const isExceptedCode = beginWithMatch(
        course.id,
        options?.excludeCodes ?? []
      );
      const isExcepted = isExceptedName || isExceptedCode;
      const matchesConfiguredRule = matchesPrefix || matchesName;

      // 除外要件では「設定したプレフィックス・科目名に該当しない科目」がマッチする。
      // except と excludeCourseNames は、否定条件では再び対象へ戻す例外として扱う。
      return isExcludeRequirement
        ? !matchesConfiguredRule || isExcepted
        : matchesConfiguredRule && !isExcepted;
    };

    const matched = courseList.filter(
      (course) => !consumed.has(course) && matchesRequirement(course)
    );
    for (const course of matched) consumed.add(course);

    selectResults.push({
      codes: [...codes],
      minimum,
      maximum,
      isExcludeRequirement,
      message,
      group,
      courses: matched,
    });
  }

  return {
    selectResults,
    leftCourses: courseList.filter((course) => !consumed.has(course)),
  };
};
