import { createGraduationEngine, findDepartment as coreFindDepartment, findMajor as coreFindMajor, listAdmissionYearOptions as coreListAdmissionYearOptions, listDepartmentAdmissionYears, listMajorAdmissionYears, resolveRequirementId as coreResolveRequirementId } from "../core/createEngine";
import { createCollectCategoryCourses } from "../core/categoryCourses";
import { TSUKUBA_GPA_CONFIG, GPA_MAX, calcGpa, calcARatePercent } from "../core/gpa";
import { categoryLabels, categoryOrder, groupLabelToCategory } from "./categoryMapping";
import { courseCodeTypes } from "./data/courseCodeTypes";
import { gradRequirementData } from "./data/gradRequirementData";
import { supportedDepartments } from "./data/supportedDepartments";
import { parseGradesCsv } from "./parseCsv";

const certifiedEnglishIds: Record<string, string> = {
  "English Reading Skills I": "31H",
  "English Presentation Skills I": "31J",
  "English Reading Skills II": "31K",
  "English Presentation Skills II": "31L",
};

const engine = createGraduationEngine({
  courseCodeTypes,
  gradRequirementData,
  categoryMapping: { groupLabelToCategory, categoryLabels, categoryOrder },
  supportedDepartments,
  gpaConfig: TSUKUBA_GPA_CONFIG,
  certifiedEnglishIds,
});

export const collectCategoryCourses = createCollectCategoryCourses(
  gradRequirementData,
  groupLabelToCategory
);

export {
  parseGradesCsv,
  supportedDepartments,
  categoryLabels,
  categoryOrder,
  groupLabelToCategory,
  gradRequirementData,
  GPA_MAX,
  calcGpa,
  calcARatePercent,
};

export const {
  checkGraduation,
  checkCompulsory,
  checkSelect,
  countCompulsoryUnits,
  listSupportedRequirements,
  resolveRequirementIds,
} = engine;

export const findDepartment = (key: string) =>
  coreFindDepartment(supportedDepartments, key);

export const findMajor = (departmentKey: string, majorKey: string) =>
  coreFindMajor(departmentKey, majorKey, supportedDepartments);

export const resolveRequirementId = (
  departmentKey: string,
  majorKey: string,
  admissionYear: string
) =>
  coreResolveRequirementId(
    departmentKey,
    majorKey,
    admissionYear,
    supportedDepartments
  );

export const listAdmissionYearOptions = (
  department: ReturnType<typeof findDepartment>,
  major: ReturnType<typeof findMajor>
) => coreListAdmissionYearOptions(supportedDepartments, department, major);

export { listDepartmentAdmissionYears, listMajorAdmissionYears };

export const tsukubaGraduationProvider = {
  slug: "tsukuba" as const,
  parseGradesCsv,
  readCsvFile: (file: File) => file.text(),
  checkGraduation,
  supportedDepartments,
  categoryLabels,
  categoryOrder,
  collectCategoryCourses,
  findDepartment,
  findMajor,
  listAdmissionYearOptions,
  listDepartmentAdmissionYears,
  listMajorAdmissionYears,
  resolveRequirementId,
  resolveRequirementIds,
  csvSourceName: "TWINS",
  csvErrorHint:
    "CSVから成績データを読み取れませんでした。TWINSからダウンロードした成績CSVかご確認ください。",
  regulationUrl:
    "https://www.tsukuba.ac.jp/education/ug-courses-directory/index.html",
  description:
    "TWINSの成績csvをアップロードすると、卒業要件の充足状況を確認できます",
  departmentSelectLabel: "学類",
  majorSelectLabel: "専攻",
};
