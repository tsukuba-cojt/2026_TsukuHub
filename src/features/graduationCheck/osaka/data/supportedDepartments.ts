/**
 * 大阪大学 対応学部・学科一覧
 */

import type { RequirementId } from "../../core/types";
import type {
  RequirementEntry,
  SupportedDepartment,
  SupportedMajor,
} from "../../core/createEngine";

export type { RequirementEntry, SupportedDepartment, SupportedMajor };

const years = [2022, 2023, 2024, 2025, 2026];

const entry = (requirementId: RequirementId): RequirementEntry => ({
  admissionYears: years,
  requirementId,
});

const major = (
  key: string,
  label: string,
  requirementId: RequirementId
): SupportedMajor => ({
  key,
  label,
  requirements: [entry(requirementId)],
});

export const supportedDepartments: SupportedDepartment[] = [
  {
    key: "letters",
    label: "文学部",
    majors: [major("letters", "文学部", "osaka-letters-22")],
  },
  {
    key: "human-sciences",
    label: "人間科学部",
    majors: [major("human-sciences", "人間科学部", "osaka-human-sciences-22")],
  },
  {
    key: "foreign-lang",
    label: "外国語学部",
    majors: [major("foreign-lang", "外国語学部", "osaka-foreign-lang-22")],
  },
  {
    key: "law",
    label: "法学部",
    majors: [major("law", "法学部", "osaka-law-22")],
  },
  {
    key: "economics",
    label: "経済学部",
    majors: [major("economics", "経済学部", "osaka-economics-22")],
  },
  {
    key: "science",
    label: "理学部",
    majors: [
      major("math", "数学科", "osaka-science-math-22"),
      major("physics", "物理学科", "osaka-science-physics-22"),
      major("chemistry", "化学科", "osaka-science-chemistry-22"),
      major("biology", "生物科学科", "osaka-science-biology-22"),
    ],
  },
  {
    key: "medicine",
    label: "医学部",
    majors: [
      major("medicine", "医学科", "osaka-medicine-22"),
      major("nursing", "保健学科（看護学専攻）", "osaka-medicine-nursing-22"),
      major("radiology", "保健学科（放射線技術科学専攻）", "osaka-medicine-radiology-22"),
      major("lab", "保健学科（検査技術科学専攻）", "osaka-medicine-lab-22"),
    ],
  },
  {
    key: "dentistry",
    label: "歯学部",
    majors: [major("dentistry", "歯学部", "osaka-dentistry-22")],
  },
  {
    key: "pharmacy",
    label: "薬学部",
    majors: [major("pharmacy", "薬学部", "osaka-pharmacy-22")],
  },
  {
    key: "engineering",
    label: "工学部",
    majors: [
      major("applied-natural", "応用自然科学科", "osaka-engineering-applied-22"),
      major("einfo", "電子情報工学科", "osaka-engineering-einfo-22"),
      major("applied-tech", "応用理工学科", "osaka-engineering-applied-tech-22"),
      major("env-energy", "環境・エネルギー工学科", "osaka-engineering-env-22"),
      major("earth", "地球総合工学科", "osaka-engineering-earth-22"),
    ],
  },
  {
    key: "feng",
    label: "基礎工学部",
    majors: [
      major("electron", "電子物理科学科", "osaka-feng-electron-22"),
      major("chemistry", "化学応用科学科", "osaka-feng-chemistry-22"),
      major("systems", "システム科学科", "osaka-feng-systems-22"),
      major("info", "情報科学科", "osaka-feng-info-22"),
    ],
  },
];

export const findDepartment = (key: string) =>
  supportedDepartments.find((department) => department.key === key);

export const findMajor = (departmentKey: string, majorKey: string) =>
  findDepartment(departmentKey)?.majors.find((m) => m.key === majorKey);

export const resolveRequirementId = (
  departmentKey: string,
  majorKey: string,
  admissionYear: string
): RequirementId | null => {
  const m = findMajor(departmentKey, majorKey);
  if (!m) return null;
  const year = Number(admissionYear);
  if (!Number.isFinite(year)) return null;
  return (
    m.requirements.find((r) => r.admissionYears.includes(year))?.requirementId ??
    null
  );
};

export const listMajorAdmissionYears = (m: SupportedMajor): number[] =>
  [...new Set(m.requirements.flatMap((r) => r.admissionYears))].sort(
    (a, b) => a - b
  );

export const listDepartmentAdmissionYears = (
  department: SupportedDepartment
): number[] =>
  [
    ...new Set(
      department.majors.flatMap((m) => listMajorAdmissionYears(m))
    ),
  ].sort((a, b) => a - b);

export type AdmissionYearOption = {
  value: number;
  label: string;
  years: number[];
};

export const listAdmissionYearOptions = (
  department: SupportedDepartment | undefined,
  major: SupportedMajor | undefined
): AdmissionYearOption[] => {
  const requirements = major
    ? major.requirements
    : (department?.majors ?? []).flatMap((m) => m.requirements);
  const options = new Map<number, AdmissionYearOption>();
  for (const requirement of requirements) {
    for (const year of requirement.admissionYears) {
      options.set(year, { value: year, label: `${year}年度`, years: [year] });
    }
  }
  return [...options.values()].sort((a, b) => a.value - b.value);
};
