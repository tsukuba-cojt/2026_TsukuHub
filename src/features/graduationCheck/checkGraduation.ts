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
import type { Course, GraduationCheckReport, RequirementId } from "./types";

/** 対応している要件データの一覧（UIの選択肢生成用） */
export const listSupportedRequirements = () =>
  (Object.keys(gradRequirementData) as RequirementId[]).map((id) => ({
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
  requirementId: RequirementId
): GraduationCheckReport => {
  const requirement = gradRequirementData[requirementId];
  const allocation = allocateCourses(courses, requirement);
  const progress = calculateGraduationProgress(
    requirement,
    allocation.compulsoryResults,
    allocation.selectResults
  );
  const gpa = calcGpa(courses);

  return {
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

/** 年度別の静的授業JSONで同一授業情報を補ってから卒業要件を判定する。 */
export const checkGraduationWithCatalog = async (
  courses: Course[],
  requirementId: RequirementId,
  universitySlug: string,
): Promise<GraduationCheckReport> => {
  const prepared = await attachCatalogEquivalencies(courses, universitySlug);
  return {
    ...checkGraduation(prepared.courses, requirementId),
    catalogVerification: prepared.verification,
  };
};
