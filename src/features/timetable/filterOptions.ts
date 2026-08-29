import { getSupportedDepartments } from "../graduationCheck/provider";

export const timetableStudentYearLabels = [
  "1年次",
  "2年次",
  "3年次",
  "4年次",
  "5年次",
  "6年次",
] as const;

const uniqueSorted = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));

export const timetableDepartmentLabels = (universitySlug?: string | null) =>
  getSupportedDepartments(universitySlug).map((department) => department.label);

export const timetableMajorLabels = (
  universitySlug?: string | null,
  departmentLabel = ""
) => {
  const supportedDepartments = getSupportedDepartments(universitySlug);
  const departments = departmentLabel
    ? supportedDepartments.filter(
        (department) => department.label === departmentLabel
      )
    : supportedDepartments;
  return departments.flatMap((department) =>
    department.majors.map((major) => major.label)
  );
};

export const timetableFilterOptions = ({
  universitySlug,
  department = "",
  extraDepartments = [],
  extraYears = [],
  extraMajors = [],
}: {
  universitySlug?: string | null;
  department?: string;
  extraDepartments?: string[];
  extraYears?: string[];
  extraMajors?: string[];
} = {}) => ({
  departments: uniqueSorted([
    ...timetableDepartmentLabels(universitySlug),
    ...extraDepartments,
  ]),
  studentYears: uniqueSorted([...timetableStudentYearLabels, ...extraYears]),
  majors: uniqueSorted([
    ...timetableMajorLabels(universitySlug, department),
    ...extraMajors,
  ]),
});
