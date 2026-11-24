import { supportedDepartments } from "../graduationCheck/data/supportedDepartments";

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

export const timetableDepartmentLabels = () =>
  supportedDepartments.map((department) => department.label);

export const timetableMajorLabels = (departmentLabel = "") => {
  const departments = departmentLabel
    ? supportedDepartments.filter((department) => department.label === departmentLabel)
    : supportedDepartments;
  return departments.flatMap((department) =>
    department.majors.map((major) => major.label),
  );
};

export const timetableFilterOptions = ({
  department = "",
  extraDepartments = [],
  extraYears = [],
  extraMajors = [],
}: {
  department?: string;
  extraDepartments?: string[];
  extraYears?: string[];
  extraMajors?: string[];
} = {}) => ({
  departments: uniqueSorted([...timetableDepartmentLabels(), ...extraDepartments]),
  studentYears: uniqueSorted([...timetableStudentYearLabels, ...extraYears]),
  majors: uniqueSorted([...timetableMajorLabels(department), ...extraMajors]),
});
