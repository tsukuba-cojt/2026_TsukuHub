import type { GraduationCheckReport, ParseCsvResult, RequirementId } from "./core/types";
import type {
  AdmissionYearOption,
  CategoryMapping,
  SupportedDepartment,
  SupportedMajor,
} from "./core/createEngine";
import { osakaGraduationProvider } from "./osaka";
import { tsukubaGraduationProvider } from "./tsukuba";

export type GraduationCheckProvider = {
  slug: string;
  parseGradesCsv: (csvText: string) => ParseCsvResult;
  readCsvFile?: (file: File) => Promise<string>;
  checkGraduation: (
    courses: import("./core/types").Course[],
    requirementId: RequirementId
  ) => GraduationCheckReport;
  supportedDepartments: SupportedDepartment[];
  categoryLabels: CategoryMapping["categoryLabels"];
  categoryOrder: CategoryMapping["categoryOrder"];
  collectCategoryCourses: (
    report: GraduationCheckReport
  ) => import("./core/categoryCourses").CategoryCourses;
  findDepartment: (key: string) => SupportedDepartment | undefined;
  findMajor: (
    departmentKey: string,
    majorKey: string
  ) => SupportedMajor | undefined;
  listAdmissionYearOptions: (
    department: SupportedDepartment | undefined,
    major: SupportedMajor | undefined
  ) => AdmissionYearOption[];
  listDepartmentAdmissionYears: (
    department: SupportedDepartment
  ) => number[];
  listMajorAdmissionYears: (major: SupportedMajor) => number[];
  resolveRequirementId: (
    departmentKey: string,
    majorKey: string,
    admissionYear: string
  ) => RequirementId | null;
  resolveRequirementIds: (
    department: string,
    admissionYear: number | string
  ) => RequirementId[];
  csvSourceName: string;
  csvErrorHint: string;
  regulationUrl: string;
  description: string;
  departmentSelectLabel: string;
  majorSelectLabel: string;
};

const providers: Record<string, GraduationCheckProvider> = {
  tsukuba: tsukubaGraduationProvider,
  osaka: osakaGraduationProvider,
};

export const getGraduationCheckProvider = (
  universitySlug: string | null | undefined
): GraduationCheckProvider => {
  const slug = universitySlug?.trim() ?? "tsukuba";
  return providers[slug] ?? tsukubaGraduationProvider;
};

export const getSupportedDepartments = (universitySlug: string | null | undefined) =>
  getGraduationCheckProvider(universitySlug).supportedDepartments;
