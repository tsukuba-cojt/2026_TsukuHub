/**
 * 卒業要件チェック 判定エンジン（ロジック層）
 *
 * 成績CSVを入力して判定結果オブジェクトを返す純粋関数群。
 * 判定はすべてクライアント内で完結し、成績をサーバーへ送信しない。
 *
 * 使い方:
 *   const { courses, errors } = parseGradesCsv(csvText);
 *   const ids = resolveRequirementIds("情報メディア創成学類", 2023); // → ["mast-22"]
 *   const report = await checkGraduationWithCatalog(courses, ids[0], "tsukuba");
 *
 * 判定ロジックは Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker, MPL-2.0) を踏襲している。
 * 詳細は同ディレクトリの README.md を参照。
 */

export { parseGradesCsv } from "./parseCsv";
export { GraduationCatalogError } from "./graduationCatalog";
export {
  checkGraduationWithCatalog,
  listSupportedRequirements,
  listStudentCourseOptions,
  resolveRequirementIds,
} from "./checkGraduation";
export {
  findDepartment,
  findMajor,
  listAdmissionYearOptions,
  listDepartmentAdmissionYears,
  listMajorAdmissionYears,
  resolveRequirementId,
  supportedDepartments,
} from "./data/supportedDepartments";
export type {
  AdmissionYearOption,
  RequirementEntry,
  SupportedDepartment,
  SupportedMajor,
} from "./data/supportedDepartments";
export { collectCategoryCourses } from "./categoryCourses";
export type { CategoryCourses } from "./categoryCourses";
export { classifyUncountedCourse } from "./manualClassification";
export { matchesSelectRequirement } from "./selectMatcher";
export {
  assessCurriculumCompilation,
  isSupportedNormalizedAdmissionYear,
  normalizedCurriculumScope,
  officialCurriculumSources,
  supportedNormalizedAdmissionYears,
  validateNormalizedCurriculum,
} from "./curriculum";
export type {
  CurriculumCompilationAssessment,
  CurriculumValidationIssue,
  CountConstraint,
  MatcherResolution,
  NormalizedCurriculum,
  SourceCoverageItem,
  SourceDocument,
  SourceReference,
  StudentContextDimension,
  StudentScope,
  TranscriptSubjectMatcher,
} from "./curriculum";
export { calcGpa, calcARatePercent, GPA_MAX } from "./gpa";
export { categoryLabels, categoryOrder } from "./categoryMapping";
export type {
  AllocationTrace,
  CategoryKey,
  CategoryResult,
  CompulsoryResult,
  Course,
  CsvRowError,
  GradRequirement,
  GraduationCheckReport,
  Grade,
  GraduationStudentContext,
  StudentCourseOption,
  ParseCsvResult,
  RequirementId,
  RequirementItemProgress,
  SelectAllocationCandidate,
  SelectResult,
  UnitProgress,
} from "./types";
