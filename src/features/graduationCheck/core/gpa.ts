/**
 * GPA・A率の計算
 */

import type { Course, GpaGrade, Grade } from "./types";

export type GpaConfig = {
  gradePoints: Record<GpaGrade, number>;
  targetGrades: readonly GpaGrade[];
};

export const TSUKUBA_GPA_CONFIG: GpaConfig = {
  gradePoints: {
    "A+": 4.3,
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 0.0,
  },
  targetGrades: ["A+", "A", "B", "C", "D"],
};

/** 大阪大学 KOAN 評語（S/A/B/C）を共通 Grade へ正規化済みの前提 */
export const OSAKA_GPA_CONFIG: GpaConfig = {
  gradePoints: {
    "A+": 4.0,
    A: 3.0,
    B: 2.0,
    C: 1.0,
    D: 0.0,
  },
  targetGrades: ["A+", "A", "B", "C"],
};

export const GPA_MAX = TSUKUBA_GPA_CONFIG.gradePoints["A+"];

/** 指定した評価ごとの単位数を数える */
export const calcUnitsPerGrade = (
  courses: Course[],
  targetGrades: readonly Grade[]
): Partial<Record<Grade, number>> => {
  const result: Partial<Record<Grade, number>> = {};
  for (const course of courses) {
    if (!targetGrades.includes(course.grade)) continue;
    result[course.grade] = (result[course.grade] ?? 0) + course.unit;
  }
  return result;
};

export const createGpaCalculator = (config: GpaConfig) => {
  const { gradePoints, targetGrades } = config;
  const max = Math.max(...Object.values(gradePoints));

  const calcGpa = (courses: Course[]) => {
    let totalPoints = 0;
    let totalUnits = 0;
    for (const course of courses) {
      const grade = course.grade as GpaGrade;
      if (!targetGrades.includes(grade)) continue;
      const points = gradePoints[grade];
      if (points === undefined) continue;
      totalPoints += points * course.unit;
      totalUnits += course.unit;
    }
    return {
      value: totalUnits > 0 ? totalPoints / totalUnits : null,
      targetUnits: totalUnits,
    };
  };

  const calcARatePercent = (courses: Course[]): number | null => {
    const passedGrades: Grade[] = ["A+", "A", "B", "C"];
    let aUnits = 0;
    let passedUnits = 0;
    for (const course of courses) {
      if (!passedGrades.includes(course.grade)) continue;
      passedUnits += course.unit;
      if (course.grade === "A+" || course.grade === "A") {
        aUnits += course.unit;
      }
    }
    return passedUnits > 0 ? (aUnits / passedUnits) * 100 : null;
  };

  return { calcGpa, calcARatePercent, max };
};

export const { calcGpa, calcARatePercent } = createGpaCalculator(TSUKUBA_GPA_CONFIG);
