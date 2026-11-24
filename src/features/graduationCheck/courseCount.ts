import { groupEquivalentCourses } from "./courseIdentity";
import type { GradRequirement, RequirementItemProgress, SelectResult } from "./types";
import { categoryByGroup } from "./requirementGroups";
import { beginWithMatch, isFailed, isPassed } from "./utils";

/** 科目数は単位進捗とは別に評価し、属性欠損は不足と区別する。 */
export const courseCountRequirementItems = (
  requirement: GradRequirement,
  selectResults: SelectResult[],
): RequirementItemProgress[] => {
  const categories = categoryByGroup(requirement);
  return (requirement.courses.courseCountRequirements ?? []).map((constraint, index) => {
    const courses = selectResults.filter((result) =>
      result.group === constraint.group && !result.isManualClassification,
    ).flatMap((result) => result.courses).filter((course) => beginWithMatch(course.id, constraint.codes));
    const groups = groupEquivalentCourses(courses);
    const count = (includeTaking: boolean) => {
      let known = 0;
      let unknown = 0;
      for (const group of groups) {
        const eligible = group.filter((course) => includeTaking ? !isFailed(course.grade) : isPassed(course.grade));
        if (eligible.length === 0) continue;
        const methods = new Set(eligible.map((course) => course.catalogInstructionMethod).filter((method) => method !== undefined));
        if ([...methods].some((method) => constraint.instructionMethods.includes(method))) {
          known++;
        } else if (methods.size === 0 || eligible.some((course) => course.catalogInstructionMethod === undefined || !course.id.trim())) {
          unknown++;
        }
      }
      const status = known >= constraint.minimum ? "satisfied" : known + unknown >= constraint.minimum ? "unknown" : "unsatisfied";
      return { known, unknown, status } as const;
    };
    const earned = count(false);
    const prospective = count(true);
    return {
      id: `course-count-${index}`, kind: "select", label: constraint.label,
      category: categories.get(constraint.group) ?? null,
      minimumUnits: null, maximumUnits: null, earnedUnits: 0, prospectiveUnits: 0,
      isSatisfied: earned.status === "satisfied",
      isProspectivelySatisfied: prospective.status === "satisfied",
      courses, isManualClassification: false,
      courseCount: {
        minimum: constraint.minimum, earned: earned.known, prospective: prospective.known,
        unknown: earned.unknown, prospectiveUnknown: prospective.unknown,
        status: earned.status, prospectiveStatus: prospective.status,
      },
    };
  });
};
