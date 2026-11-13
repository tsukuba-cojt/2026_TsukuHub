/**
 * 区分別の単位集計。科目の割り当て規則は扱わない。
 *
 * This file contains code derived from Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker), MPL-2.0.
 * See LICENSE in this directory.
 */

import { categoryLabels, categoryOrder } from "./categoryMapping";
import { courseCountRequirementItems } from "./courseCount";
import { countCompulsoryUnits } from "./checkCompulsory";
import { listRequirementGroups } from "./requirementGroups";
import type {
  CategoryKey,
  CategoryResult,
  CompulsoryResult,
  GradRequirement,
  RequirementItemProgress,
  SelectResult,
  UnitProgress,
} from "./types";
import { isPassed, sumUnits } from "./utils";

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
    isSatisfied: boolean;
    isProspectivelySatisfied: boolean;
    unsatisfiedRequirementCount: number;
    prospectivelyUnsatisfiedRequirementCount: number;
  };
  requirementItems: RequirementItemProgress[];
  unmappedGroupUnits: Record<string, number>;
};

const compulsoryRequirementItems = (
  compulsoryResults: CompulsoryResult[]
): RequirementItemProgress[] =>
  compulsoryResults.map((result, index) => {
    const minimumUnits = result.minimumUnit ?? null;
    const earnedUnits = sumUnits(result.courses, false);
    const prospectiveUnits = sumUnits(result.courses, true);
    const alternativeNames = result.alternative?.split(", ") ?? null;
    const hasPassedAlternatives = (includeTaking: boolean) =>
      alternativeNames?.every((name) =>
        result.courses.some(
          (course) =>
            course.name === name &&
            (includeTaking ? course.grade !== "D" && course.grade !== "F" : isPassed(course.grade))
        )
      ) ?? false;
    const isSatisfied = result.isCourseGroup
      ? earnedUnits >= (minimumUnits ?? 0)
      : alternativeNames === null
        ? result.courses.some((course) => isPassed(course.grade))
        : hasPassedAlternatives(false);
    const isProspectivelySatisfied = result.isCourseGroup
      ? prospectiveUnits >= (minimumUnits ?? 0)
      : alternativeNames === null
        ? result.passed
        : hasPassedAlternatives(true);

    return {
      id: `compulsory-${index}`,
      kind: "compulsory",
      label: result.name,
      category: "compulsory",
      minimumUnits,
      maximumUnits: result.isCourseGroup ? minimumUnits : null,
      earnedUnits:
        minimumUnits === null ? earnedUnits : Math.min(earnedUnits, minimumUnits),
      prospectiveUnits:
        minimumUnits === null
          ? prospectiveUnits
          : Math.min(prospectiveUnits, minimumUnits),
      isSatisfied,
      isProspectivelySatisfied,
      courses: result.courses,
      isManualClassification: result.isManualClassification === true,
    };
  });

const selectRequirementItems = (
  selectResults: SelectResult[],
  categoryByGroup: Map<number, Exclude<CategoryKey, "compulsory">>
): RequirementItemProgress[] =>
  selectResults.flatMap((result, index) => {
    const earnedUnits = Math.min(sumUnits(result.courses, false), result.maximum);
    const prospectiveUnits = Math.min(
      sumUnits(result.courses, true),
      result.maximum
    );
    const parent: RequirementItemProgress = {
      id: `select-${index}`,
      kind: "select",
      label: result.message,
      category: categoryByGroup.get(result.group) ?? null,
      minimumUnits: result.minimum,
      maximumUnits: result.maximum,
      earnedUnits,
      prospectiveUnits,
      isSatisfied: earnedUnits >= result.minimum,
      isProspectivelySatisfied: prospectiveUnits >= result.minimum,
      courses: result.courses,
      isManualClassification: result.isManualClassification === true,
    };
    const included = (result.minimumIncludedResults ?? []).map(
      (includedResult, includedIndex): RequirementItemProgress => {
        const includedEarned = sumUnits(includedResult.courses, false);
        const includedProspective = sumUnits(includedResult.courses, true);
        const unknownUnits = sumUnits(includedResult.unknownCourses ?? [], false);
        const prospectiveUnknownUnits = sumUnits(includedResult.unknownCourses ?? [], true);
        const status = (known: number, unknown: number) => known >= includedResult.minimum
          ? "satisfied" as const : known + unknown >= includedResult.minimum ? "unknown" as const : "unsatisfied" as const;
        return {
          id: `select-${index}-included-${includedIndex}`,
          kind: "select",
          label: includedResult.label,
          category: categoryByGroup.get(result.group) ?? null,
          minimumUnits: includedResult.minimum,
          maximumUnits: null,
          earnedUnits: includedEarned,
          prospectiveUnits: includedProspective,
          isSatisfied: includedEarned >= includedResult.minimum,
          isProspectivelySatisfied:
            includedProspective >= includedResult.minimum,
          courses: [...includedResult.courses, ...(includedResult.unknownCourses ?? [])],
          isManualClassification: false,
          ...(includedResult.unknownCourses ? { attributeEvaluation: {
            status: status(includedEarned, unknownUnits),
            prospectiveStatus: status(includedProspective, prospectiveUnknownUnits),
            unknownUnits, prospectiveUnknownUnits,
          } } : {}),
        };
      },
    );
    return [parent, ...included];
  });

export const calculateGraduationProgress = (
  requirement: GradRequirement,
  compulsoryResults: CompulsoryResult[],
  selectResults: SelectResult[],
  evaluationMode: "five-category" | "detailed" = "detailed",
): GraduationProgressResult => {
  if (evaluationMode === "five-category") {
    return calculateFiveCategoryProgress(requirement, compulsoryResults, selectResults);
  }
  const { compulsorySumUnit, selectMinimumUnit, enforceSelectMinimums } =
    requirement.courses;
  const groups = listRequirementGroups(requirement);
  const categoriesByGroup = new Map(
    groups.flatMap((group) =>
      group.category === null ? [] : [[group.groupNo, group.category] as const]
    )
  );
  const requirementItems = [
    ...compulsoryRequirementItems(compulsoryResults),
    ...selectRequirementItems(selectResults, categoriesByGroup),
    ...courseCountRequirementItems(requirement, selectResults),
  ];
  const groupUnits = groups.map((group) => {
    const results = selectResults.filter(
      (result) => result.group === group.groupNo
    );
    const count = (includeTaking: boolean) => {
      const units = results.map((result) => ({
        minimum: result.minimum,
        units: Math.min(sumUnits(result.courses, includeTaking), result.maximum),
        isManualClassification: result.isManualClassification === true,
      }));
      const total = units.reduce((sum, result) => sum + result.units, 0);
      if (!enforceSelectMinimums) return Math.min(total, group.maximum);

      // 既存APIでは、このフラグを持つ要件だけ小区分不足を区分進捗へ
      // 反映している。5区分だけを選ぶ手動分類には小区分を特定する情報がないため、
      // 手動分類分はこの減算へ混ぜず、既存要件の進捗へ別途加算する。
      const automaticUnits = units.filter(
        (result) => !result.isManualClassification
      );
      const manuallyClassifiedUnits = units
        .filter((result) => result.isManualClassification)
        .reduce((sum, result) => sum + result.units, 0);
      const automaticTotal = automaticUnits.reduce(
        (sum, result) => sum + result.units,
        0
      );
      const minimumShortage = automaticUnits.reduce(
        (sum, result) => sum + Math.max(result.minimum - result.units, 0),
        0
      );
      const progressMaximum =
        minimumShortage > 0
          ? Math.max(group.minimum - minimumShortage, 0)
          : group.maximum;
      const automaticProgress = Math.min(automaticTotal, progressMaximum);
      return Math.min(
        automaticProgress + manuallyClassifiedUnits,
        group.maximum
      );
    };
    return { ...group, earned: count(false), prospective: count(true) };
  });

  for (const [index, constraint] of (requirement.courses.aggregateRequirements ?? []).entries()) {
    const sourceGroups = groupUnits.filter((group) => constraint.sourceGroups.includes(group.groupNo));
    const earned = sourceGroups.reduce((sum, group) => sum + group.earned, 0);
    const prospective = sourceGroups.reduce((sum, group) => sum + group.prospective, 0);
    requirementItems.push({
      id: `aggregate-${index}`, kind: "select", label: constraint.label,
      category: categoriesByGroup.get(constraint.group) ?? null,
      minimumUnits: constraint.minimum, maximumUnits: null, earnedUnits: earned, prospectiveUnits: prospective,
      isSatisfied: earned >= constraint.minimum, isProspectivelySatisfied: prospective >= constraint.minimum,
      courses: selectResults.filter((result) => constraint.sourceGroups.includes(result.group)).flatMap((result) => result.courses),
      isManualClassification: false,
    });
  }
  const compulsoryEarned = Math.min(
    countCompulsoryUnits(compulsoryResults, false),
    compulsorySumUnit
  );
  const compulsoryProspective = Math.min(
    countCompulsoryUnits(compulsoryResults, true),
    compulsorySumUnit
  );
  const categories: CategoryResult[] = [
    (() => {
      const items = requirementItems.filter(
        (item) => item.category === "compulsory"
      );
      const unsatisfiedRequirementCount = items.filter(
        (item) => !item.isSatisfied
      ).length;
      const prospectivelyUnsatisfiedRequirementCount = items.filter(
        (item) => !item.isProspectivelySatisfied
      ).length;
      return {
      category: "compulsory",
      label: categoryLabels.compulsory,
      ...makeProgress(compulsorySumUnit, compulsoryEarned, compulsoryProspective),
      isSatisfied:
        compulsoryEarned >= compulsorySumUnit &&
        unsatisfiedRequirementCount === 0,
      isProspectivelySatisfied:
        compulsoryProspective >= compulsorySumUnit &&
        prospectivelyUnsatisfiedRequirementCount === 0,
      unsatisfiedRequirementCount,
      prospectivelyUnsatisfiedRequirementCount,
      };
    })(),
  ];
  const unmappedGroupUnits: Record<string, number> = {};
  for (const group of groupUnits) {
    if (group.category === null) {
      unmappedGroupUnits[group.label] = group.prospective;
      continue;
    }
    const items = requirementItems.filter(
      (item) => item.category === group.category
    );
    const unsatisfiedRequirementCount = items.filter(
      (item) => !item.isSatisfied
    ).length;
    const prospectivelyUnsatisfiedRequirementCount = items.filter(
      (item) => !item.isProspectivelySatisfied
    ).length;
    categories.push({
      category: group.category,
      label: categoryLabels[group.category],
      maxUnits: group.maximum,
      ...makeProgress(group.minimum, group.earned, group.prospective),
      isSatisfied:
        group.earned >= group.minimum && unsatisfiedRequirementCount === 0,
      isProspectivelySatisfied:
        group.prospective >= group.minimum &&
        prospectivelyUnsatisfiedRequirementCount === 0,
      unsatisfiedRequirementCount,
      prospectivelyUnsatisfiedRequirementCount,
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
  const unsatisfiedRequirementCount = requirementItems.filter(
    (item) => !item.isSatisfied
  ).length;
  const prospectivelyUnsatisfiedRequirementCount = requirementItems.filter(
    (item) => !item.isProspectivelySatisfied
  ).length;
  const groupsSatisfied = groupUnits.every(
    (group) => group.earned >= group.minimum
  );
  const groupsProspectivelySatisfied = groupUnits.every(
    (group) => group.prospective >= group.minimum
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
      isSatisfied:
        summary.earnedUnits >= requiredTotal &&
        groupsSatisfied &&
        unsatisfiedRequirementCount === 0,
      isProspectivelySatisfied:
        summary.prospectiveUnits >= requiredTotal &&
        groupsProspectivelySatisfied &&
        prospectivelyUnsatisfiedRequirementCount === 0,
      unsatisfiedRequirementCount,
      prospectivelyUnsatisfiedRequirementCount,
    },
    requirementItems,
    unmappedGroupUnits,
  };
};

/** 小区分の上下限・必修の個別消し込み・属性条件は5分類の進捗に混ぜない。 */
const calculateFiveCategoryProgress = (
  requirement: GradRequirement,
  compulsoryResults: CompulsoryResult[],
  selectResults: SelectResult[],
): GraduationProgressResult => {
  const groups = listRequirementGroups(requirement);
  const categories = categoryOrder.map((category): CategoryResult => {
    const categoryGroups = groups.filter((group) => group.category === category);
    const required = category === "compulsory" ? requirement.courses.compulsorySumUnit
      : categoryGroups.reduce((sum, group) => sum + group.minimum, 0);
    const maximum = category === "compulsory" ? required
      : categoryGroups.reduce((sum, group) => sum + group.maximum, 0);
    const courses = [...new Set(category === "compulsory"
      ? compulsoryResults.flatMap((result) => result.courses)
      : selectResults.filter((result) => categoryGroups.some((group) => group.groupNo === result.group))
        .flatMap((result) => result.courses))];
    const earned = Math.min(sumUnits(courses, false), maximum);
    const prospective = Math.min(sumUnits(courses, true), maximum);
    return {
      category, label: categoryLabels[category], maxUnits: maximum,
      ...makeProgress(required, earned, prospective),
      isSatisfied: earned >= required, isProspectivelySatisfied: prospective >= required,
      unsatisfiedRequirementCount: 0, prospectivelyUnsatisfiedRequirementCount: 0,
    };
  });
  const required = requirement.courses.compulsorySumUnit + requirement.courses.selectMinimumUnit;
  const count = (prospective: boolean) => {
    const field = prospective ? "prospectiveUnits" : "earnedUnits";
    return categories[0][field] + Math.min(requirement.courses.selectMinimumUnit,
      categories.slice(1).reduce((sum, category) => sum + category[field], 0));
  };
  const summary = makeProgress(required, count(false), count(true));
  const shortage = (prospective: boolean) => Math.max(
    required - count(prospective),
    categories.reduce((sum, category) => sum + Math.max(category.requiredUnits -
      (prospective ? category.prospectiveUnits : category.earnedUnits), 0), 0),
  );
  const detailed = calculateGraduationProgress(requirement, compulsoryResults, selectResults);
  return {
    categories,
    summary: {
      ...summary, shortageUnits: shortage(false), prospectiveShortageUnits: shortage(true),
      isSatisfied: shortage(false) === 0, isProspectivelySatisfied: shortage(true) === 0,
      unsatisfiedRequirementCount: 0, prospectivelyUnsatisfiedRequirementCount: 0,
    },
    requirementItems: detailed.requirementItems,
    unmappedGroupUnits: detailed.unmappedGroupUnits,
  };
};
