/**
 * 判定エンジン共通ユーティリティ
 */

import type { Course, Grade } from "./types";

/** 不合格（単位として数えない）評価か */
export const isFailed = (grade: Grade): boolean =>
  grade === "D" || grade === "F";

/** 合格確定（履修中を含めない）か */
export const isPassed = (grade: Grade): boolean =>
  !isFailed(grade) && grade !== "履修中";

/** 科目番号がプレフィックス群のいずれかで始まるか */
export const beginWithMatch = (
  code: string,
  prefixes: readonly string[]
): boolean => prefixes.some((prefix) => code.startsWith(prefix));

/**
 * 科目リストの単位数を合算する。
 * 不合格（D/F）は常に除外。includeTaking=false なら履修中も除外（確定単位）。
 */
export const sumUnits = (
  courses: Course[],
  includeTaking: boolean
): number => {
  let total = 0;
  for (const course of courses) {
    if (isFailed(course.grade)) continue;
    if (!includeTaking && course.grade === "履修中") continue;
    total += course.unit;
  }
  return total;
};
