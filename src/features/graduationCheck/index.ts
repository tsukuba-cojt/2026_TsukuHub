/**
 * 卒業要件チェック 判定エンジン（ロジック層）
 *
 * 大学別 Provider 経由で機能を提供する。
 * 後方互換のため筑波版の export も維持する。
 */

export { getGraduationCheckProvider, getSupportedDepartments } from "./provider";
export type { GraduationCheckProvider } from "./provider";

// 筑波版（後方互換）
export {
  parseGradesCsv,
  checkGraduation,
  listSupportedRequirements,
  resolveRequirementIds,
  findDepartment,
  findMajor,
  listAdmissionYearOptions,
  listDepartmentAdmissionYears,
  listMajorAdmissionYears,
  resolveRequirementId,
  supportedDepartments,
  collectCategoryCourses,
  categoryLabels,
  categoryOrder,
} from "./tsukuba";

export type {
  AdmissionYearOption,
  RequirementEntry,
  SupportedDepartment,
  SupportedMajor,
} from "./tsukuba/data/supportedDepartments";

export { calcGpa, calcARatePercent, GPA_MAX } from "./core/gpa";

export type {
  CategoryKey,
  CategoryResult,
  CompulsoryResult,
  Course,
  CsvRowError,
  GradRequirement,
  GraduationCheckReport,
  Grade,
  ParseCsvResult,
  RequirementId,
  SelectResult,
  UnitProgress,
} from "./core/types";

export type { CategoryCourses } from "./core/categoryCourses";
