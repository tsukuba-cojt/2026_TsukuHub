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

import type { Course, GradRequirement, GraduationStudentContext, SelectResult } from "./types";
import { categoryByGroup } from "./requirementGroups";
import { groupEquivalentCourses } from "./courseIdentity";
import { beginWithMatch, isFailed, isPassed } from "./utils";
import {
  matchesSelectAllocationRequirement,
  matchesSelectRequirement,
} from "./selectMatcher";

export type CheckSelectResult = {
  selectResults: SelectResult[];
  /** どの選択要件にもマッチしなかった科目（卒業要件に含まれない単位） */
  leftCourses: Course[];
};

export const checkSelect = (
  courseList: Course[],
  requirement: GradRequirement,
  studentContext?: GraduationStudentContext,
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
      options,
    ] = rule;

    let matched = courseList.filter(
      (course) =>
        !consumed.has(course) &&
        matchesSelectAllocationRequirement(course, rule, categories.get(group))
    );
    for (const limit of options?.maximumIncludedCourses ?? []) {
      const limited = matched.filter((course) => beginWithMatch(course.id, limit.codes));
      // 合格確定、履修中、不合格の順。単位数の多い科目を優先し、CSV行順で結果を変えない。
      const rank = (course: Course) => isPassed(course.grade) ? 2 : isFailed(course.grade) ? 0 : 1;
      const compare = (left: Course, right: Course) =>
        rank(right) - rank(left) || right.unit - left.unit || left.id.localeCompare(right.id) ||
        right.year - left.year || String(left.catalogInstructionMethod ?? "").localeCompare(String(right.catalogInstructionMethod ?? "")) ||
        left.name.localeCompare(right.name);
      const representatives = groupEquivalentCourses(limited).map((group) => [...group].sort(compare)[0]).sort(compare);
      const retained = new Set(representatives.slice(0, limit.maximum));
      matched = matched.filter((course) => !limited.includes(course) || retained.has(course));
    }
    for (const course of matched) consumed.add(course);

    selectResults.push({
      codes: [...codes],
      minimum,
      maximum,
      isExcludeRequirement,
      message,
      group,
      courses: matched,
      minimumIncludedResults: options?.minimumIncludedUnits?.map(
        (included) => {
          const candidates = matched.filter((course) => {
            const matchesCode =
              included.codes !== undefined &&
              included.codes.length > 0 &&
              matchesSelectRequirement(course, [
                included.codes,
                0,
                Number.POSITIVE_INFINITY,
                false,
                included.label,
                group,
              ]);
            const matchesSuffix =
              included.courseIdSuffixes?.some((suffix) =>
                course.id.endsWith(suffix),
              ) ?? false;
            const matchesName =
              included.courseNames?.includes(course.name) ?? false;
            return matchesCode || matchesSuffix || matchesName;
          });
          const selectedCourse = requirement.courses.studentCourseOptions?.find((option) => option.key === studentContext?.courseKey);
          const known: Course[] = [];
          const unknown: Course[] = [];
          for (const course of candidates) {
            if (included.studentCourse && selectedCourse && !beginWithMatch(course.id, selectedCourse.codes)) continue;
            if (included.instructionMethods && course.catalogInstructionMethod !== undefined &&
              !included.instructionMethods.includes(course.catalogInstructionMethod)) continue;
            if ((included.studentCourse && !selectedCourse) ||
              (included.instructionMethods && course.catalogInstructionMethod === undefined) ||
              (included.bioresourcesCore && course.catalogBioresourcesCore !== true)) {
              unknown.push(course);
            } else {
              known.push(course);
            }
          }
          return {
            ...included, courses: known,
            ...(included.studentCourse || included.instructionMethods || included.bioresourcesCore ? { unknownCourses: unknown } : {}),
          };
        },
      ),
    });
  }

  return {
    selectResults,
    leftCourses: courseList.filter((course) => !consumed.has(course)),
  };
};
