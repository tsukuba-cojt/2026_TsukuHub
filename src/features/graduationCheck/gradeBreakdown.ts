/**
 * 成績の内訳（科目数ベース）
 *
 * GPA の A 率（単位数・A+/A/B/C のみ）とは別物。
 * 円グラフ用に、履修した全科目の件数と、P・認・履修中を除いた A+/A 率を返す。
 */

import type { Course, Grade } from "./types";

export const GRADE_BREAKDOWN_ORDER: readonly Grade[] = [
  "A+",
  "A",
  "B",
  "C",
  "D",
  "P",
  "F",
  "認",
  "履修中",
];

/** 中央の「A評価以上」から除く評価（評価がつかない／未確定） */
const excludedFromARate = new Set<Grade>(["P", "認", "履修中"]);

export type GradeSlice = {
  grade: Grade;
  count: number;
  /** 全科目に対する割合(%) */
  percent: number;
};

export type GradeBreakdown = {
  slices: GradeSlice[];
  /** 履修した全科目数（凡例の分母） */
  totalCount: number;
  /** P・認・履修中を除いた科目数（中央の分母） */
  gradedCount: number;
  /** A+・A の科目数 */
  aCount: number;
  /** 中央の A 評価以上(%)。対象がなければ null */
  aRatePercent: number | null;
};

export const gradeBreakdown = (courses: Course[]): GradeBreakdown => {
  const counts = new Map<Grade, number>();
  for (const grade of GRADE_BREAKDOWN_ORDER) counts.set(grade, 0);
  for (const course of courses) {
    counts.set(course.grade, (counts.get(course.grade) ?? 0) + 1);
  }

  const totalCount = courses.length;
  const slices: GradeSlice[] = GRADE_BREAKDOWN_ORDER.map((grade) => {
    const count = counts.get(grade) ?? 0;
    return {
      grade,
      count,
      percent: totalCount > 0 ? (count / totalCount) * 100 : 0,
    };
  });

  const aCount = (counts.get("A+") ?? 0) + (counts.get("A") ?? 0);
  let gradedCount = 0;
  for (const course of courses) {
    if (!excludedFromARate.has(course.grade)) gradedCount += 1;
  }

  return {
    slices,
    totalCount,
    gradedCount,
    aCount,
    aRatePercent: gradedCount > 0 ? (aCount / gradedCount) * 100 : null,
  };
};
