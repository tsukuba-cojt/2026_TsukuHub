import type { Course } from "../../features/graduationCheck";
import type { TimetableHistory, TimetableModuleKey } from "../../types/timetable";
import { timetableModuleOrder } from "../../types/timetable";

export type ShareSettings = {
  shareTimetable: boolean;
  shareEnrollYear: boolean;
  shareMajor: boolean;
  modules: TimetableModuleKey[];
  note: string;
};

export type ShareProfile = {
  departmentKey: string;
  majorKey: string;
  admissionYear: string;
};

export type TimetableShareState = {
  agreed: boolean;
  profile: ShareProfile;
  settings: ShareSettings;
  file: File | null;
  courses: Course[];
  histories: TimetableHistory[];
};

export const INITIAL_SHARE_STATE: TimetableShareState = {
  agreed: false,
  profile: {
    departmentKey: "",
    majorKey: "",
    admissionYear: "",
  },
  settings: {
    shareTimetable: true,
    shareEnrollYear: true,
    shareMajor: true,
    modules: [...timetableModuleOrder],
    note: "",
  },
  file: null,
  courses: [],
  histories: [],
};

export const SHARE_STEPS = [
  { num: 1, label: "同意の確認" },
  { num: 2, label: "共有情報の選択" },
  { num: 3, label: "アップロード" },
  { num: 4, label: "完了" },
] as const;

const courseModules = (course: TimetableHistory["courses"][number]) =>
  course.modules.length > 0 ? course.modules : (["other"] as TimetableModuleKey[]);

export const applyShareSettings = (
  histories: TimetableHistory[],
  settings: ShareSettings
): TimetableHistory[] =>
  histories.map((history) => ({
    ...history,
    sharePublic: settings.shareTimetable,
    courses: history.courses
      .map((course) => ({
        ...course,
        modules: courseModules(course).filter((module) =>
          settings.modules.includes(module)
        ),
      }))
      .filter((course) => course.modules.length > 0),
  }));
