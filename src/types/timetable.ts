import type { CategoryKey, Grade } from "../features/graduationCheck";

export type TimetableModuleKey =
  | "springA"
  | "springB"
  | "springC"
  | "fallA"
  | "fallB"
  | "fallC"
  | "other";

export type TimetableSpecialType =
  | "intensive"
  | "consultation"
  | "anytime"
  | "nt";

export type TimetableCourseCategory =
  | CategoryKey
  | "elective"
  | "unknown";

export type TimetableSlot = {
  day: "月" | "火" | "水" | "木" | "金";
  period: number;
};

export type TimetableCourse = {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade?: Grade;
  academicYear: number;
  semester: string;
  schedule: string;
  instructor?: string;
  category: TimetableCourseCategory;
  modules: TimetableModuleKey[];
  slots: TimetableSlot[];
  specialType?: TimetableSpecialType;
};

export type TimetableHistory = {
  id: string;
  ownerId?: string;
  displayName: string;
  department: string;
  major: string;
  admissionYear: number;
  academicYear: number;
  studentYearLabel: string;
  trackLabel: string;
  earnedUnits: number;
  sharePublic: boolean;
  createdAt?: string;
  courses: TimetableCourse[];
};

export type TimetableFilters = {
  department: string;
  studentYear: string;
  module: TimetableModuleKey | "all";
  major: string;
};

export const timetableModuleLabels: Record<TimetableModuleKey, string> = {
  springA: "春A",
  springB: "春B",
  springC: "春C",
  fallA: "秋A",
  fallB: "秋B",
  fallC: "秋C",
  other: "その他",
};

export const timetableModuleOrder: TimetableModuleKey[] = [
  "springA",
  "springB",
  "springC",
  "fallA",
  "fallB",
  "fallC",
  "other",
];

export const timetableSpecialLabels: Record<TimetableSpecialType, string> = {
  intensive: "集中",
  consultation: "応談",
  anytime: "随時",
  nt: "NT",
};
