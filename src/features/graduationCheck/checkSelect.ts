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

import type { Course, GradRequirement, SelectResult } from "./types";
import { categoryByGroup } from "./requirementGroups";
import { matchesSelectAllocationRequirement } from "./selectMatcher";

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
  const categories = categoryByGroup(requirement);

  for (const rule of requirement.courses.select) {
    const [
      codes,
      minimum,
      maximum,
      isExcludeRequirement,
      message,
      group,
    ] = rule;

    const matched = courseList.filter(
      (course) =>
        !consumed.has(course) &&
        matchesSelectAllocationRequirement(course, rule, categories.get(group))
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
