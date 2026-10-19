/**
 * 区分別の単位集計。科目の割り当て規則は扱わない。
 *
 * This file contains code derived from Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker), MPL-2.0.
 * See LICENSE in this directory.
 */

import { categoryLabels } from "./categoryMapping";
import { countCompulsoryUnits } from "./checkCompulsory";
import { listRequirementGroups } from "./requirementGroups";
import type {
  CategoryResult,
  CompulsoryResult,
  GradRequirement,
  SelectResult,
  UnitProgress,
} from "./types";
import { sumUnits } from "./utils";

export const makeProgress = (
  requiredUnits: number,
  earnedUnits: number,
  prospectiveUnits: number
): UnitProgress => {
  const percent = requiredUnits > 0 ? (earnedUnits / requiredUnits) * 100 : 0;
  const prospectivePercent =
    requiredUnits > 0 ? (prospectiveUnits / requiredUnits) * 100 : 0;
  return {
    requiredUnits,
    earnedUnits,
    prospectiveUnits,
    percent,
    percentClamped: Math.min(percent, 100),
    prospectivePercent,
    prospectivePercentClamped: Math.min(prospectivePercent, 100),
  };
};

export type GraduationProgressResult = {
  categories: CategoryResult[];
  summary: UnitProgress & {
    shortageUnits: number;
    prospectiveShortageUnits: number;
  };
  unmappedGroupUnits: Record<string, number>;
};

export const calculateGraduationProgress = (
  requirement: GradRequirement,
  compulsoryResults: CompulsoryResult[],
  selectResults: SelectResult[]
): GraduationProgressResult => {
  const { compulsorySumUnit, selectMinimumUnit, enforceSelectMinimums } =
    requirement.courses;
  const groupUnits = listRequirementGroups(requirement).map((group) => {
    const results = selectResults.filter(
      (result) => result.group === group.groupNo
    );
    const count = (includeTaking: boolean) => {
      const units = results.map((result) => ({
        minimum: result.minimum,
        units: Math.min(sumUnits(result.courses, includeTaking), result.maximum),
      }));
      const total = units.reduce((sum, result) => sum + result.units, 0);
      if (!enforceSelectMinimums) return Math.min(total, group.maximum);

      const minimumShortage = units.reduce(
        (sum, result) => sum + Math.max(result.minimum - result.units, 0),
        0
      );
      const progressMaximum =
        minimumShortage > 0
          ? Math.max(group.minimum - minimumShortage, 0)
          : group.maximum;
      return Math.min(total, progressMaximum);
    };
    return { ...group, earned: count(false), prospective: count(true) };
  });

  const compulsoryEarned = Math.min(
    countCompulsoryUnits(compulsoryResults, false),
    compulsorySumUnit
  );
  const compulsoryProspective = Math.min(
    countCompulsoryUnits(compulsoryResults, true),
    compulsorySumUnit
  );
  const categories: CategoryResult[] = [
    {
      category: "compulsory",
      label: categoryLabels.compulsory,
      ...makeProgress(compulsorySumUnit, compulsoryEarned, compulsoryProspective),
    },
  ];
  const unmappedGroupUnits: Record<string, number> = {};
  for (const group of groupUnits) {
    if (group.category === null) {
      unmappedGroupUnits[group.label] = group.prospective;
      continue;
    }
    categories.push({
      category: group.category,
      label: categoryLabels[group.category],
      maxUnits: group.maximum,
      ...makeProgress(group.minimum, group.earned, group.prospective),
    });
  }

  const requiredTotal = compulsorySumUnit + selectMinimumUnit;
  const selectEarned = Math.min(
    groupUnits.reduce((total, group) => total + group.earned, 0),
    selectMinimumUnit
  );
  const selectProspective = Math.min(
    groupUnits.reduce((total, group) => total + group.prospective, 0),
    selectMinimumUnit
  );
  const summary = makeProgress(
    requiredTotal,
    compulsoryEarned + selectEarned,
    compulsoryProspective + selectProspective
  );

  return {
    categories,
    summary: {
      ...summary,
      shortageUnits: Math.max(requiredTotal - summary.earnedUnits, 0),
      prospectiveShortageUnits: Math.max(
        requiredTotal - summary.prospectiveUnits,
        0
      ),
    },
    unmappedGroupUnits,
  };
};
