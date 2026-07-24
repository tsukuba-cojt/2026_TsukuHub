/**
 * 必修科目の判定
 *
 * This file is derived from Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker), src/features/checkCompulsory.ts.
 * Licensed under the Mozilla Public License, v. 2.0 (MPL-2.0).
 * If a copy of the MPL was not distributed with this file, You can obtain one
 * at https://mozilla.org/MPL/2.0/.
 *
 * 必修要件の3記法（要件データ側）:
 * - "科目名"                     … 科目名の完全一致
 * - "科目名//['代替1', '代替2']"  … 本体が見つからない場合、代替科目群すべての合格で充足
 * - "タグ::単位数"               … courseCodeTypes のタグに該当する科目群で指定単位以上
 *
 * マッチした科目は候補リストから消し込み、選択科目の判定で二重計上しない。
 */

import { courseCodeTypes } from "./data/courseCodeTypes";
import type { CompulsoryResult, Course, GradRequirement } from "./types";
import { beginWithMatch, isFailed, sumUnits } from "./utils";

/**
 * 認定（認）で総合評価がつく必修英語は、CSV上の科目番号が要件の科目番号と
 * 一致しないため、科目名から科目番号プレフィックスへ読み替える。
 */
const certifiedEnglishIds: Record<string, string> = {
  "English Reading Skills I": "31H",
  "English Presentation Skills I": "31J",
  "English Reading Skills II": "31K",
  "English Presentation Skills II": "31L",
};

const normalizeCertifiedCourses = (courses: Course[]): Course[] =>
  courses.map((course) =>
    course.grade === "認" && certifiedEnglishIds[course.name] !== undefined
      ? { ...course, id: certifiedEnglishIds[course.name] }
      : course
  );

/** "微分積分A//['微積分1', '微積分2']" 形式から科目名と代替科目リストを取り出す */
const parseAlternative = (
  entry: string
): { name: string; alternatives: string[] | null } => {
  if (!entry.includes("//")) return { name: entry, alternatives: null };
  const [name, altText] = entry.split("//");
  return {
    name,
    alternatives: JSON.parse(altText.replace(/'/g, '"')) as string[],
  };
};

export type CheckCompulsoryResult = {
  compulsoryResults: CompulsoryResult[];
  /** 必修にマッチしなかった残りの科目（選択判定の候補） */
  remainingCourses: Course[];
};

export const checkCompulsory = (
  courseListSource: Course[],
  requirement: GradRequirement
): CheckCompulsoryResult => {
  const courseList = normalizeCertifiedCourses(courseListSource);
  const consumed = new Set<Course>();
  const compulsoryResults: CompulsoryResult[] = [];

  const takeByName = (name: string): Course[] => {
    // 再履修で同名科目が複数行ある場合もすべて消し込む
    const matched = courseList.filter(
      (course) => !consumed.has(course) && course.name === name
    );
    for (const course of matched) consumed.add(course);
    return matched;
  };

  for (const entry of requirement.courses.compulsory) {
    const { name, alternatives } = parseAlternative(entry);

    // タグ記法（例: "情報::4"）— 科目番号タグに該当する科目群で指定単位以上
    if (name.includes("::")) {
      const [tag, unitText] = name.split("::");
      const minimumUnit = Number.parseInt(unitText, 10);
      const { codes, except } = courseCodeTypes[tag];
      const matched = courseList.filter(
        (course) =>
          !consumed.has(course) &&
          beginWithMatch(course.id, codes) &&
          !beginWithMatch(course.id, except)
      );
      for (const course of matched) consumed.add(course);
      compulsoryResults.push({
        name: tag,
        isCourseGroup: true,
        passed: sumUnits(matched, true) >= minimumUnit,
        minimumUnit,
        courses: matched,
      });
      continue;
    }

    // 科目名の完全一致
    const matched = takeByName(name);
    if (matched.length > 0) {
      compulsoryResults.push({
        name,
        isCourseGroup: false,
        passed: matched.some((course) => !isFailed(course.grade)),
        courses: matched,
      });
      continue;
    }

    // 本体が見つからない場合、代替科目群（すべての合格が必要）で判定
    if (alternatives !== null) {
      const altCourses = alternatives.flatMap((altName) => takeByName(altName));
      const allFound = alternatives.every((altName) =>
        altCourses.some((course) => course.name === altName)
      );
      compulsoryResults.push({
        name,
        isCourseGroup: false,
        passed:
          allFound && altCourses.every((course) => !isFailed(course.grade)),
        courses: altCourses,
        alternative: alternatives.join(", "),
      });
      continue;
    }

    // 未履修
    compulsoryResults.push({
      name,
      isCourseGroup: false,
      passed: false,
      courses: [],
    });
  }

  return {
    compulsoryResults,
    remainingCourses: courseList.filter((course) => !consumed.has(course)),
  };
};

/**
 * 必修判定結果の取得単位数。
 * タグ記法の科目群は必要単位数でキャップする（参考リポジトリ準拠）。
 * includeTaking=true で履修中を含む見込み単位、false で確定単位。
 */
export const countCompulsoryUnits = (
  compulsoryResults: CompulsoryResult[],
  includeTaking: boolean
): number => {
  let total = 0;
  for (const result of compulsoryResults) {
    const units = sumUnits(result.courses, includeTaking);
    total +=
      result.isCourseGroup && result.minimumUnit !== undefined
        ? Math.min(units, result.minimumUnit)
        : units;
  }
  return total;
};
