import { gradRequirementData } from "./data/gradRequirementData";
import { calculateGraduationProgress } from "./progress";
import { listRequirementGroups } from "./requirementGroups";
import type {
  CategoryKey,
  CompulsoryResult,
  GraduationCheckReport,
  SelectResult,
} from "./types";
import { isFailed } from "./utils";

const MANUAL_CLASSIFICATION_LABEL = "利用者による分類";

/**
 * 未分類科目1件をページ内だけで指定区分へ移し、既存と同じ集計規則で再計算する。
 * DB保存は行わず、元のレポートも変更しない。
 */
export const classifyUncountedCourse = (
  report: GraduationCheckReport,
  uncountedIndex: number,
  classification: CategoryKey,
): GraduationCheckReport => {
  const course = report.details.uncountedCourses[uncountedIndex];
  if (!course) throw new Error("分類対象の未分類科目が見つかりません。");

  const requirement = gradRequirementData[report.requirement.id];
  const compulsoryResults: CompulsoryResult[] = [
    ...report.details.compulsoryResults,
  ];
  const selectResults: SelectResult[] = [...report.details.selectResults];
  const selectedGroup =
    classification === "compulsory"
      ? undefined
      : listRequirementGroups(requirement).find(
          (candidate) => candidate.category === classification,
        );

  if (classification === "compulsory") {
    compulsoryResults.push({
      name: `${MANUAL_CLASSIFICATION_LABEL}: ${course.name}`,
      isCourseGroup: false,
      passed: !isFailed(course.grade),
      courses: [course],
      isManualClassification: true,
    });
  } else {
    if (!selectedGroup) {
      throw new Error("この卒業要件には選択した区分がありません。");
    }
    selectResults.push({
      codes: [],
      minimum: 0,
      maximum: selectedGroup.maximum,
      isExcludeRequirement: false,
      message: MANUAL_CLASSIFICATION_LABEL,
      group: selectedGroup.groupNo,
      courses: [course],
      isManualClassification: true,
    });
  }

  const progress = calculateGraduationProgress(
    requirement,
    compulsoryResults,
    selectResults,
  );
  const assigned =
    classification === "compulsory"
      ? ({ kind: "compulsory", label: MANUAL_CLASSIFICATION_LABEL } as const)
      : ({
          kind: "select",
          ruleIndex: -1,
          label: MANUAL_CLASSIFICATION_LABEL,
          group: selectedGroup!.groupNo,
          category: classification,
        } as const);

  return {
    ...report,
    categories: progress.categories,
    summary: progress.summary,
    details: {
      ...report.details,
      compulsoryResults,
      selectResults,
      requirementItems: progress.requirementItems,
      uncountedCourses: report.details.uncountedCourses.filter(
        (_, index) => index !== uncountedIndex,
      ),
      unmappedGroupUnits: progress.unmappedGroupUnits,
      allocationTraces: report.details.allocationTraces.map((trace) =>
        trace.course === course ? { ...trace, assigned } : trace,
      ),
    },
  };
};
