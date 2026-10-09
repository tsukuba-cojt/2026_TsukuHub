import {
  createGraduationEngine,
  findDepartment as coreFindDepartment,
  findMajor as coreFindMajor,
  listAdmissionYearOptions as coreListAdmissionYearOptions,
  listDepartmentAdmissionYears,
  listMajorAdmissionYears,
  resolveRequirementId as coreResolveRequirementId,
} from "../core/createEngine";
import { createCollectCategoryCourses } from "../core/categoryCourses";
import { OSAKA_GPA_CONFIG } from "../core/gpa";
import { categoryLabels, categoryOrder, groupLabelToCategory } from "./categoryMapping";
import { courseCodeTypes } from "./data/courseCodeTypes";
import { gradRequirementData } from "./data/gradRequirementData";
import { supportedDepartments } from "./data/supportedDepartments";
import { parseGradesCsv, readKoanCsvFile } from "./parseCsv";
import { attachCatalogCourseNumbers } from "./resolveCourseId";
import { isOsakaGpaExcludedCourse } from "./gpaExclude";
import type { CatalogCourse } from "../../../types/courseCatalog";
import type { ParseCsvResult } from "../core/types";

const engine = createGraduationEngine({
  courseCodeTypes,
  gradRequirementData,
  categoryMapping: { groupLabelToCategory, categoryLabels, categoryOrder },
  supportedDepartments,
  gpaConfig: OSAKA_GPA_CONFIG,
  certifiedEnglishIds: {
    "実践英語(e-learning)": "国際性涵養教育系科目::第１外国語",
    "実践英語（e-learning）": "国際性涵養教育系科目::第１外国語",
  },
  gpaExcludeCourse: isOsakaGpaExcludedCourse,
});

export const enrichCoursesWithCatalog = (
  catalog: CatalogCourse[],
  result: ParseCsvResult
): ParseCsvResult => ({
  ...result,
  courses: attachCatalogCourseNumbers(catalog, result.courses),
});

export const parseGradesCsvWithCatalog = (
  csvText: string,
  catalog: CatalogCourse[]
): ParseCsvResult => enrichCoursesWithCatalog(catalog, parseGradesCsv(csvText));

export const collectCategoryCourses = createCollectCategoryCourses(
  gradRequirementData,
  groupLabelToCategory
);

export {
  parseGradesCsv,
  readKoanCsvFile,
  attachCatalogCourseNumbers,
  supportedDepartments,
  categoryLabels,
  categoryOrder,
  groupLabelToCategory,
  gradRequirementData,
};

export const {
  checkGraduation,
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

export const osakaGraduationProvider = {
  slug: "osaka" as const,
  parseGradesCsv,
  readCsvFile: readKoanCsvFile,
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
  csvSourceName: "KOAN",
  csvErrorHint:
    "CSVから成績データを読み取れませんでした。KOANの単位修得状況照会から出力したCSVかご確認ください。",
  regulationUrl: "https://www.celas.osaka-u.ac.jp/education/prerequisite/",
  description:
    "KOANの成績CSVをアップロードすると、卒業要件の充足状況を確認できます",
  departmentSelectLabel: "学部",
  majorSelectLabel: "学科",
};
