/**
 * 判定結果を5区分ごとの科目リストへ組み替える（結果ページの詳細表示用）
 */

import type { CategoryKey, Course, GraduationCheckReport } from "./types";
import type { CategoryMapping } from "./createEngine";

/** 区分 → その区分に計上された科目（要件データの定義順） */
export type CategoryCourses = Record<CategoryKey, Course[]>;

export const createCollectCategoryCourses = (
  gradRequirementData: Record<string, { courses: { groups: [number, number, number, string][] } }>,
  groupLabelToCategory: CategoryMapping["groupLabelToCategory"]
) => {
  return (report: GraduationCheckReport): CategoryCourses => {
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

    const categoryByGroup = new Map<number, CategoryKey>();
    const requirement = gradRequirementData[report.requirement.id];
    if (!requirement) return categoryCourses;

    const { groups } = requirement.courses;
    for (const [groupNo, , , label] of groups) {
      const category = groupLabelToCategory[label];
      if (category !== undefined) categoryByGroup.set(groupNo, category);
    }

    for (const select of report.details.selectResults) {
      const category = categoryByGroup.get(select.group);
      if (category !== undefined) {
        categoryCourses[category].push(...select.courses);
      }
    }

    return categoryCourses;
  };
};
