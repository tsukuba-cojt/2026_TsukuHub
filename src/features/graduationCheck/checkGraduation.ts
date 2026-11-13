/**
 * 卒業要件チェックのオーケストレータ。各段階の実装は専用モジュールへ委譲する。
 *
 * This file is derived from Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker), MPL-2.0.
 * See LICENSE in this directory.
 */

import { allocateCourses } from "./courseAllocation";
import { gradRequirementData } from "./data/gradRequirementData";
import { supportedDepartments } from "./data/supportedDepartments";
import { attachCatalogEquivalencies } from "./graduationCatalog";
import { calcARatePercent, calcGpa, GPA_MAX } from "./gpa";
import { calculateGraduationProgress } from "./progress";
import type { Course, GraduationCheckReport, GraduationStudentContext, RequirementId } from "./types";

export const listStudentCourseOptions = (requirementId: RequirementId | null) =>
  requirementId === null ? [] : gradRequirementData[requirementId].courses.studentCourseOptions ?? [];

/** 運用対象で使うルール版の一覧。対応入学年度は supportedDepartments で管理する。 */
export const listSupportedRequirements = () =>
  [...new Set(supportedDepartments.flatMap((department) => department.majors.flatMap(
    (major) => major.requirements.map((entry) => entry.requirementId),
  )))].map((id) => ({
    id,
    ...gradRequirementData[id].header,
  }));

/** 学類名・入学年度から要件データの候補キーを返す。 */
export const resolveRequirementIds = (
  department: string,
  admissionYear: number | string
): RequirementId[] => {
  const normalize = (name: string) => name.replaceAll("・", "");
  const year = Number(admissionYear);
  if (!Number.isFinite(year)) return [];

  const supported = supportedDepartments.find(
    (candidate) => normalize(candidate.label) === normalize(department)
  );
  return (
    supported?.majors.flatMap((major) =>
      major.requirements
        .filter((requirement) => requirement.admissionYears.includes(year))
        .map((requirement) => requirement.requirementId)
    ) ?? []
  );
};

/**
 * カタログ補完済み科目を判定する内部向け純粋関数。
 * 画面やサービスからは checkGraduationWithCatalog を使用する。
 */
export const checkGraduation = (
  courses: Course[],
  requirementId: RequirementId,
  studentContext?: GraduationStudentContext,
  evaluationMode: "five-category" | "detailed" = "detailed",
): GraduationCheckReport => {
  const requirement = gradRequirementData[requirementId];
  // 科目数上限は詳細監査用。5分類では該当する科目を同じ区分に残す。
  const allocationRequirement = evaluationMode === "five-category" ? {
    ...requirement, courses: { ...requirement.courses,
      select: requirement.courses.select.map((rule) => {
        const copy = [...rule] as typeof rule;
        if (copy[6]) copy[6] = { ...copy[6], maximumIncludedCourses: undefined };
        return copy;
      }),
    },
  } : requirement;
  const allocation = allocateCourses(courses, allocationRequirement, studentContext);
  const progress = calculateGraduationProgress(
    requirement,
    allocation.compulsoryResults,
    allocation.selectResults,
    evaluationMode,
  );
  const gpa = calcGpa(courses);

  return {
    evaluationMode,
    ...(studentContext ? { studentContext } : {}),
    requirement: { id: requirementId, ...requirement.header },
    catalogVerification: {
      source: "transcript_academic_year",
      verifiedAcademicYears: [],
      unsupportedAcademicYears: [...new Set(courses.map((course) => course.year))]
        .sort((left, right) => left - right),
    },
    summary: progress.summary,
    gpa: {
      value: gpa.value,
      max: GPA_MAX,
      targetUnits: gpa.targetUnits,
      aRatePercent: calcARatePercent(courses),
    },
    categories: progress.categories,
    details: {
      compulsoryResults: allocation.compulsoryResults,
      selectResults: allocation.selectResults,
      requirementItems: progress.requirementItems,
      uncountedCourses: allocation.uncountedCourses,
      unmappedGroupUnits: progress.unmappedGroupUnits,
      allocationTraces: allocation.allocationTraces,
    },
  };
};

/** 年度別の静的授業JSONを補完し、プロトタイプ運用用の5分類集計を返す。 */
export const checkGraduationWithCatalog = async (
  courses: Course[],
  requirementId: RequirementId,
  universitySlug: string,
  studentContext?: GraduationStudentContext,
): Promise<GraduationCheckReport> => {
  const prepared = await attachCatalogEquivalencies(courses, universitySlug);
  return {
    ...checkGraduation(prepared.courses, requirementId, studentContext, "five-category"),
    catalogVerification: prepared.verification,
  };
};
