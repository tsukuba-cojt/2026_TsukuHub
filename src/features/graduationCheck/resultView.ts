/**
 * 結果画面用の薄い集計。checkGraduation の判定式は変えない。
 */

import { gradRequirementData } from "./data/gradRequirementData";
import { groupLabelToCategory } from "./categoryMapping";
import type {
  CategoryKey,
  CategoryResult,
  CompulsoryResult,
  GraduationCheckReport,
  SelectResult,
} from "./types";
import { isFailed, isPassed, sumUnits } from "./utils";

export type RemainingCreditItem = {
  label: string;
  shortageUnits: number;
  projected: boolean;
};

export type RemainingCompulsoryItem = {
  name: string;
  status: "notTaken" | "inProgress" | "failed";
};

export type CompulsoryCheckItem = {
  name: string;
  status: "passed" | "inProgress" | "notTaken" | "failed";
  isCourseGroup: boolean;
};

export type CategoryMapStatus = "unmet" | "projected" | "fulfilled";

export type CategoryMapItem = CategoryResult & {
  status: CategoryMapStatus;
  shortageUnits: number;
};

export type SelectSubgroup = {
  label: string;
  minimum: number;
  maximum: number;
  earnedUnits: number;
  prospectiveUnits: number;
  capped: boolean;
};

/** 概要・詳細の入れ子バー用 */
export type RequirementBarItem = {
  label: string;
  earnedUnits: number;
  requiredUnits: number;
  percent: number;
};

/** 子バー用。必要単位が0（任意枠）なら充足として100%。親区分の toPercent は0を返す。 */
const progressPercent = (earned: number, required: number): number =>
  required <= 0 ? 100 : (earned / required) * 100;

const selectSubgroupBarItem = (group: SelectSubgroup): RequirementBarItem => {
  // 最低0の枠を「0 / 0 単位」にすると意味が取れないので、分母は上限にする。
  // バッジと%は最低単位を満たしていれば充足（最低0なら常に100%）。
  const requiredUnits = group.minimum > 0 ? group.minimum : group.maximum;
  return {
    label: group.label,
    earnedUnits: group.earnedUnits,
    requiredUnits,
    percent:
      group.minimum <= 0
        ? 100
        : progressPercent(group.earnedUnits, requiredUnits),
  };
};

export const categoryStatus = (item: CategoryResult): CategoryMapStatus => {
  if (item.earnedUnits + 1e-9 >= item.requiredUnits) return "fulfilled";
  if (item.prospectiveUnits + 1e-9 >= item.requiredUnits) return "projected";
  return "unmet";
};

export const categoryMapItems = (
  report: GraduationCheckReport
): CategoryMapItem[] =>
  report.categories.map((item) => ({
    ...item,
    status: categoryStatus(item),
    shortageUnits: Math.max(item.requiredUnits - item.earnedUnits, 0),
  }));

export const remainingCreditItems = (
  report: GraduationCheckReport
): RemainingCreditItem[] =>
  report.categories
    .filter((item) => item.category !== "compulsory")
    .filter((item) => item.earnedUnits + 1e-9 < item.requiredUnits)
    .map((item) => ({
      label: item.label,
      shortageUnits: Math.max(item.requiredUnits - item.earnedUnits, 0),
      projected: item.prospectiveUnits + 1e-9 >= item.requiredUnits,
    }));

export const compulsoryCheckStatus = (
  result: CompulsoryResult
): CompulsoryCheckItem["status"] => {
  if (result.isCourseGroup && result.minimumUnit !== undefined) {
    const earned = sumUnits(result.courses, false);
    const prospective = sumUnits(result.courses, true);
    if (earned + 1e-9 >= result.minimumUnit) return "passed";
    if (prospective + 1e-9 >= result.minimumUnit) return "inProgress";
    if (result.courses.length === 0) return "notTaken";
    return "failed";
  }

  if (result.courses.some((course) => isPassed(course.grade))) return "passed";
  if (result.courses.some((course) => course.grade === "履修中")) {
    return "inProgress";
  }
  if (result.courses.some((course) => isFailed(course.grade))) return "failed";
  return "notTaken";
};

export const compulsoryCheckItems = (
  report: GraduationCheckReport
): CompulsoryCheckItem[] =>
  report.details.compulsoryResults.map((result) => ({
    name: result.name,
    status: compulsoryCheckStatus(result),
    isCourseGroup: result.isCourseGroup,
  }));

export const remainingCompulsoryItems = (
  report: GraduationCheckReport
): RemainingCompulsoryItem[] =>
  compulsoryCheckItems(report).flatMap((item) =>
    item.status === "passed"
      ? []
      : [{ name: item.name, status: item.status }]
  );

export const prospectiveMessage = (report: GraduationCheckReport): string => {
  const left = report.summary.prospectiveShortageUnits;
  if (left <= 0) {
    return "いま履修中の科目をすべて修得できれば、要件を満たせます。";
  }
  return `いま履修中の科目をすべて修得しても、あと${formatUnits(left)}単位が必要です。`;
};

export const formatUnits = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export const selectSubgroups = (
  report: GraduationCheckReport,
  category: CategoryKey
): SelectSubgroup[] => {
  if (category === "compulsory") return [];

  const { groups } = gradRequirementData[report.requirement.id].courses;
  const groupNos = new Set<number>();
  for (const [groupNo, , , label] of groups) {
    if (groupLabelToCategory[label] === category) groupNos.add(groupNo);
  }

  return report.details.selectResults
    .filter((result) => groupNos.has(result.group))
    .map((result) => toSubgroup(result));
};

const toSubgroup = (result: SelectResult): SelectSubgroup => {
  const earned = Math.min(sumUnits(result.courses, false), result.maximum);
  const prospective = Math.min(sumUnits(result.courses, true), result.maximum);
  const rawEarned = sumUnits(result.courses, false);
  return {
    label: result.message,
    minimum: result.minimum,
    maximum: result.maximum,
    earnedUnits: earned,
    prospectiveUnits: prospective,
    capped: rawEarned > result.maximum,
  };
};

/** 必修のうち体育・情報・必修英語など、タグ記法の単位グループだけ */
export const compulsoryGroupItems = (
  report: GraduationCheckReport
): RequirementBarItem[] =>
  report.details.compulsoryResults
    .filter((result) => result.isCourseGroup && result.minimumUnit !== undefined)
    .map((result) => {
      const requiredUnits = result.minimumUnit ?? 0;
      const earnedUnits = Math.min(
        sumUnits(result.courses, false),
        requiredUnits
      );
      return {
        label: result.name,
        earnedUnits,
        requiredUnits,
        percent: progressPercent(earnedUnits, requiredUnits),
      };
    });

/**
 * 選択の小区分。親区分と min/max が同じ1件だけのときは出さない
 * （専門選択の GC5, GA4 など）。
 */
export const visibleSelectSubgroups = (
  report: GraduationCheckReport,
  category: CategoryKey
): RequirementBarItem[] => {
  const parent = report.categories.find((item) => item.category === category);
  const groups = selectSubgroups(report, category);
  if (parent !== undefined && groups.length === 1) {
    const [only] = groups;
    const parentMax = parent.maxUnits ?? parent.requiredUnits;
    if (only.minimum === parent.requiredUnits && only.maximum === parentMax) {
      return [];
    }
  }

  return groups.map(selectSubgroupBarItem);
};

export const categoryChildItems = (
  report: GraduationCheckReport,
  category: CategoryKey
): RequirementBarItem[] =>
  category === "compulsory"
    ? compulsoryGroupItems(report)
    : visibleSelectSubgroups(report, category);
