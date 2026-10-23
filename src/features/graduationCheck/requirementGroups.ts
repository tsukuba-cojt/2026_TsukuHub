/** 要件データのグループ番号・表示区分を解決する共通処理。 */

import { groupLabelToCategory } from "./categoryMapping";
import type { CategoryKey, GradRequirement, GroupTuple } from "./types";

export type RequirementGroup = {
  groupNo: number;
  minimum: number;
  maximum: number;
  label: string;
  category: Exclude<CategoryKey, "compulsory"> | null;
};

export const listRequirementGroups = (
  requirement: GradRequirement
): RequirementGroup[] =>
  requirement.courses.groups.map(
    ([groupNo, minimum, maximum, label]: GroupTuple) => ({
      groupNo,
      minimum,
      maximum,
      label,
      category: groupLabelToCategory[label] ?? null,
    })
  );

export const categoryByGroup = (
  requirement: GradRequirement
): Map<number, Exclude<CategoryKey, "compulsory">> => {
  const result = new Map<number, Exclude<CategoryKey, "compulsory">>();
  for (const group of listRequirementGroups(requirement)) {
    if (group.category !== null) result.set(group.groupNo, group.category);
  }
  return result;
};
