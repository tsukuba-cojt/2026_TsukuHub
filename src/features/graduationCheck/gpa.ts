/**
 * GPA・A率の計算
 *
 * This file is derived from Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker), src/features/calcGPA.ts.
 * Licensed under the Mozilla Public License, v. 2.0 (MPL-2.0).
 * If a copy of the MPL was not distributed with this file, You can obtain one
 * at https://mozilla.org/MPL/2.0/.
 */

import type { Course, GpaGrade, Grade } from "./types";

/** GPAレート。P・認・F・履修中は計算対象外 */
const gradePoints: Record<GpaGrade, number> = {
  "A+": 4.3,
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 0.0,
};

export const GPA_MAX = gradePoints["A+"];

const gpaTargetGrades = Object.keys(gradePoints) as GpaGrade[];

/** 指定した評価ごとの単位数を数える */
export const calcUnitsPerGrade = (
  courses: Course[],
  targetGrades: readonly Grade[]
): Partial<Record<Grade, number>> => {
  const units: Partial<Record<Grade, number>> = {};
  for (const grade of targetGrades) units[grade] = 0;
  for (const course of courses) {
    if (units[course.grade] !== undefined) {
      units[course.grade] = (units[course.grade] ?? 0) + course.unit;
    }
  }
  return units;
};

/**
 * GPA（A+〜D が対象。P/認/F/履修中は除外）。
 * 対象科目が1つもない場合は value: null。
 */
export const calcGpa = (
  courses: Course[]
): { value: number | null; targetUnits: number } => {
  const unitsPerGrade = calcUnitsPerGrade(courses, gpaTargetGrades);
  let totalUnits = 0;
  let totalPoints = 0;
  for (const grade of gpaTargetGrades) {
    const units = unitsPerGrade[grade] ?? 0;
    totalUnits += units;
    totalPoints += gradePoints[grade] * units;
  }
  return {
    value: totalUnits > 0 ? totalPoints / totalUnits : null,
    targetUnits: totalUnits,
  };
};

/**
 * 取得単位中 A・A+ の割合(%)。
 * 分母・分子とも合格評価（A+/A/B/C）の単位数のみで、
 * D・F・P・認・履修中は計算に含めない。対象がなければ null。
 */
export const calcARatePercent = (courses: Course[]): number | null => {
  const unitsPerGrade = calcUnitsPerGrade(courses, ["A+", "A", "B", "C"]);
  const aUnits = (unitsPerGrade["A+"] ?? 0) + (unitsPerGrade["A"] ?? 0);
  const totalUnits =
    aUnits + (unitsPerGrade["B"] ?? 0) + (unitsPerGrade["C"] ?? 0);
  return totalUnits > 0 ? (aUnits / totalUnits) * 100 : null;
};
