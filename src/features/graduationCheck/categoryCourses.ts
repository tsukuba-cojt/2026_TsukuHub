/**
 * 判定結果を5区分ごとの科目リストへ組み替える（結果ページの詳細表示用）
 *
 * checkGraduation が返す details には選択要件の「グループ番号」しか入らないため、
 * 要件データの groups（[番号, 最低, 最高, 表示名]）を引き直し、
 * categoryMapping と同じ規則（表示名 → 区分）で振り分ける。
 * ここでは判定・集計は一切行わず、判定済みの科目を並べ替えるだけ。
 */

import { gradRequirementData } from "./data/gradRequirementData";
import { categoryByGroup } from "./requirementGroups";
import type { CategoryKey, Course, GraduationCheckReport } from "./types";

/** 区分 → その区分に計上された科目（要件データの定義順） */
export type CategoryCourses = Record<CategoryKey, Course[]>;

export const collectCategoryCourses = (
  report: GraduationCheckReport
): CategoryCourses => {
  const categoryCourses: CategoryCourses = {
    compulsory: [],
    specialized: [],
    specializedFoundation: [],
    common: [],
    related: [],
  };

  for (const compulsory of report.details.compulsoryResults) {
    categoryCourses.compulsory.push(...compulsory.courses);
  }

  // グループ番号 → 区分（5区分に対応しないグループは持たない＝表示対象外）
  const categories = categoryByGroup(gradRequirementData[report.requirement.id]);

  for (const select of report.details.selectResults) {
    const category = categories.get(select.group);
    if (category !== undefined) {
      categoryCourses[category].push(...select.courses);
    }
  }

  return categoryCourses;
};
