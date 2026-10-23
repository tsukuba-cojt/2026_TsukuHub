/**
 * 科目を必修・選択・対象外へ割り当てる段階。
 * 集計とは分離し、定義順による競合を allocationTraces に残す。
 *
 * The allocation order follows Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker), MPL-2.0.
 * See LICENSE in this directory.
 */

import { checkCompulsory } from "./checkCompulsory";
import { checkSelect } from "./checkSelect";
import { categoryByGroup } from "./requirementGroups";
import { matchesSelectAllocationRequirement } from "./selectMatcher";
import type {
  AllocationTrace,
  CompulsoryResult,
  Course,
  GradRequirement,
  SelectResult,
} from "./types";

export type CourseAllocationResult = {
  compulsoryResults: CompulsoryResult[];
  selectResults: SelectResult[];
  uncountedCourses: Course[];
  allocationTraces: AllocationTrace[];
};

export const allocateCourses = (
  courses: Course[],
  requirement: GradRequirement
): CourseAllocationResult => {
  const { compulsoryResults, remainingCourses } = checkCompulsory(
    courses,
    requirement
  );
  const { selectResults, leftCourses } = checkSelect(
    remainingCourses,
    requirement
  );
  const categories = categoryByGroup(requirement);

  const compulsoryAssignment = new Map<Course, string>();
  for (const result of compulsoryResults) {
    for (const course of result.courses) {
      compulsoryAssignment.set(course, result.name);
    }
  }

  const selectAssignment = new Map<Course, number>();
  selectResults.forEach((result, ruleIndex) => {
    for (const course of result.courses) selectAssignment.set(course, ruleIndex);
  });

  const allCourses = [
    ...compulsoryResults.flatMap((result) => result.courses),
    ...remainingCourses,
  ];
  const allocationTraces: AllocationTrace[] = allCourses.map((course) => {
    const compulsoryLabel = compulsoryAssignment.get(course);
    if (compulsoryLabel !== undefined) {
      return {
        course,
        assigned: { kind: "compulsory", label: compulsoryLabel },
        selectCandidates: [],
      };
    }

    const selectCandidates = requirement.courses.select.flatMap(
      (rule, ruleIndex) =>
        matchesSelectAllocationRequirement(
          course,
          rule,
          categories.get(rule[5]),
        )
          ? [
              {
                ruleIndex,
                label: rule[4],
                group: rule[5],
                category: categories.get(rule[5]) ?? null,
              },
            ]
          : []
    );
    const assignedRuleIndex = selectAssignment.get(course);
    const assignedCandidate = selectCandidates.find(
      (candidate) => candidate.ruleIndex === assignedRuleIndex
    );

    return {
      course,
      assigned:
        assignedCandidate === undefined
          ? { kind: "uncounted" }
          : { kind: "select", ...assignedCandidate },
      selectCandidates,
    };
  });

  return {
    compulsoryResults,
    selectResults,
    uncountedCourses: leftCourses,
    allocationTraces,
  };
};
