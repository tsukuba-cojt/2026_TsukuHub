import { supabase } from "../lib/supabase";
import {
  collectCategoryCourses,
  type Course,
  type GraduationCheckReport,
} from "../features/graduationCheck";
import {
  detectSpecialSchedule,
  parseTimetableModules,
  parseTimetableSlots,
} from "../features/timetable/schedule";
import type {
  TimetableCourse,
  TimetableCourseCategory,
  TimetableFilters,
  TimetableHistory,
  TimetableModuleKey,
  TimetableSpecialType,
} from "../types/timetable";

type CourseMetaRow = {
  course_number: string;
  course_name: string;
  credits: string | number | null;
  target_year: string | null;
  semester: string | null;
  schedule: string | null;
  instructor: string | null;
};

type TimetableHistoryRow = {
  id: string;
  owner_id?: string | null;
  display_name: string;
  department: string;
  major: string;
  admission_year: number;
  academic_year: number;
  student_year_label: string;
  track_label: string;
  earned_units: number;
  share_public: boolean;
  created_at?: string;
  timetable_history_courses?: TimetableHistoryCourseRow[];
};

type TimetableHistoryCourseRow = {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  grade?: Course["grade"] | null;
  academic_year: number;
  semester: string;
  schedule: string;
  instructor?: string | null;
  category: TimetableCourseCategory;
  module_key: TimetableModuleKey;
  day_of_week?: TimetableCourse["slots"][number]["day"] | null;
  period?: number | null;
  special_type?: TimetableSpecialType | null;
};

type PublicTimetableHistoryRow = {
  history_id: string;
  display_name: string;
  department: string;
  major: string;
  admission_year: number;
  academic_year: number;
  student_year_label: string;
  track_label: string;
  earned_units: number;
  share_public: boolean;
  history_created_at?: string;
  course_row_id?: string | null;
  course_code?: string | null;
  course_name?: string | null;
  credits?: number | null;
  course_academic_year?: number | null;
  semester?: string | null;
  schedule?: string | null;
  instructor?: string | null;
  category?: TimetableCourseCategory | null;
  module_key?: TimetableModuleKey | null;
  day_of_week?: TimetableCourse["slots"][number]["day"] | null;
  period?: number | null;
  special_type?: TimetableSpecialType | null;
};

const passedGrades = new Set<Course["grade"]>(["A+", "A", "B", "C", "P", "認"]);

const numberOrZero = (value: string | number | null | undefined) => {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(String(value ?? "").replaceAll(" ", ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const categoryFromReport = (report: GraduationCheckReport) => {
  const categories = collectCategoryCourses(report);
  const map = new Map<string, TimetableCourseCategory>();
  for (const [category, courses] of Object.entries(categories)) {
    courses.forEach((course) => {
      if (!map.has(course.id)) map.set(course.id, category as TimetableCourseCategory);
    });
  }
  return map;
};

const studentYearLabel = (admissionYear: number, academicYear: number) => {
  const year = Math.max(1, academicYear - admissionYear + 1);
  return `${year}年次`;
};

const toTimetableCourse = (
  course: Course,
  meta: CourseMetaRow | undefined,
  category: TimetableCourseCategory
): TimetableCourse => {
  const semester = meta?.semester?.trim() || "";
  const schedule = meta?.schedule?.trim() || "";
  const modules = parseTimetableModules(semester);
  const slots = parseTimetableSlots(schedule);
  const specialType = detectSpecialSchedule(schedule);

  return {
    id: `${course.year}-${course.id}-${makeId()}`,
    courseCode: course.id,
    courseName: meta?.course_name?.trim() || course.name,
    credits: numberOrZero(meta?.credits ?? course.unit),
    grade: course.grade,
    academicYear: course.year,
    semester,
    schedule,
    instructor: meta?.instructor?.trim() || undefined,
    category,
    modules,
    slots,
    specialType,
  };
};

export const buildTimetableHistoriesFromGraduationReport = async ({
  report,
  department,
  major,
  admissionYear,
  sharePublic,
  ownerId,
}: {
  report: GraduationCheckReport;
  department: string;
  major: string;
  admissionYear: number;
  sharePublic: boolean;
  ownerId?: string;
}): Promise<TimetableHistory[]> => {
  const allCourses = [
    ...report.details.compulsoryResults.flatMap((item) => item.courses),
    ...report.details.selectResults.flatMap((item) => item.courses),
    ...report.details.uncountedCourses,
  ];
  const uniqueCodes = [...new Set(allCourses.map((course) => course.id).filter(Boolean))];
  const metaByCode = new Map<string, CourseMetaRow>();

  if (uniqueCodes.length > 0) {
    const { data, error } = await supabase
      .from("courses")
      .select("course_number, course_name, credits, target_year, semester, schedule, instructor")
      .in("course_number", uniqueCodes);
    if (!error) {
      (data as CourseMetaRow[] | null)?.forEach((row) => {
        metaByCode.set(row.course_number, row);
      });
    }
  }

  const categoryByCode = categoryFromReport(report);
  const grouped = new Map<number, TimetableCourse[]>();
  for (const course of allCourses) {
    const timetableCourse = toTimetableCourse(
      course,
      metaByCode.get(course.id),
      categoryByCode.get(course.id) ?? "unknown"
    );
    if (!grouped.has(course.year)) grouped.set(course.year, []);
    grouped.get(course.year)?.push(timetableCourse);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => b - a)
    .map(([academicYear, courses]) => {
      const earnedUnits = courses
        .filter((course) => course.grade && passedGrades.has(course.grade))
        .reduce((sum, course) => sum + course.credits, 0);
      const label = studentYearLabel(admissionYear, academicYear);
      return {
        id: makeId(),
        ownerId,
        displayName: `${major || department} ${label}`,
        department,
        major,
        admissionYear,
        academicYear,
        studentYearLabel: label,
        trackLabel: major || department,
        earnedUnits,
        sharePublic,
        courses,
      };
    });
};

const courseToRows = (historyId: string, course: TimetableCourse) => {
  const modules = course.modules.length > 0 ? course.modules : (["other"] as TimetableModuleKey[]);
  const slots =
    course.slots.length > 0
      ? course.slots
      : [{ day: null, period: null } as const];

  return modules.flatMap((moduleKey) =>
    slots.map((slot) => ({
      history_id: historyId,
      course_code: course.courseCode,
      course_name: course.courseName,
      credits: course.credits,
      grade: course.grade ?? null,
      academic_year: course.academicYear,
      semester: course.semester,
      schedule: course.schedule,
      instructor: course.instructor ?? null,
      category: course.category,
      module_key: moduleKey,
      day_of_week: slot.day,
      period: slot.period,
      special_type: course.specialType ?? null,
    }))
  );
};

export const saveTimetableHistories = async (
  histories: TimetableHistory[],
  ownerId: string
) => {
  const savedIds: string[] = [];
  for (const history of histories) {
    const { data, error } = await supabase
      .from("timetable_histories")
      .upsert(
        {
          owner_id: ownerId,
          display_name: history.displayName,
          department: history.department,
          major: history.major,
          admission_year: history.admissionYear,
          academic_year: history.academicYear,
          student_year_label: history.studentYearLabel,
          track_label: history.trackLabel,
          earned_units: history.earnedUnits,
          share_public: history.sharePublic,
        },
        {
          onConflict:
            "owner_id,department,major,admission_year,academic_year",
        }
      )
      .select("id")
      .single();
    if (error) throw error;
    const historyId = (data as { id: string }).id;
    savedIds.push(historyId);

    // 同じ本人履歴を再チェックした場合は、古い科目行を残さず最新結果へ置換する。
    const { error: deleteError } = await supabase
      .from("timetable_history_courses")
      .delete()
      .eq("history_id", historyId);
    if (deleteError) throw deleteError;

    const rows = history.courses.flatMap((course) => courseToRows(historyId, course));
    if (rows.length > 0) {
      const { error: courseError } = await supabase
        .from("timetable_history_courses")
        .insert(rows);
      if (courseError) throw courseError;
    }
  }
  return savedIds;
};

const fromRows = (row: TimetableHistoryRow): TimetableHistory => {
  const merged = new Map<string, TimetableCourse>();
  for (const courseRow of row.timetable_history_courses ?? []) {
    const key = `${courseRow.course_code}-${courseRow.academic_year}-${courseRow.semester}-${courseRow.schedule}`;
    const current = merged.get(key);
    const slot =
      courseRow.day_of_week && courseRow.period
        ? { day: courseRow.day_of_week, period: courseRow.period }
        : null;
    if (current) {
      if (!current.modules.includes(courseRow.module_key)) {
        current.modules.push(courseRow.module_key);
      }
      if (slot && !current.slots.some((item) => item.day === slot.day && item.period === slot.period)) {
        current.slots.push(slot);
      }
      continue;
    }
    merged.set(key, {
      id: courseRow.id,
      courseCode: courseRow.course_code,
      courseName: courseRow.course_name,
      credits: courseRow.credits,
      grade: courseRow.grade ?? undefined,
      academicYear: courseRow.academic_year,
      semester: courseRow.semester,
      schedule: courseRow.schedule,
      instructor: courseRow.instructor ?? undefined,
      category: courseRow.category,
      modules: [courseRow.module_key],
      slots: slot ? [slot] : [],
      specialType: courseRow.special_type ?? undefined,
    });
  }

  return {
    id: row.id,
    ownerId: row.owner_id ?? undefined,
    displayName: row.display_name,
    department: row.department,
    major: row.major,
    admissionYear: row.admission_year,
    academicYear: row.academic_year,
    studentYearLabel: row.student_year_label,
    trackLabel: row.track_label,
    earnedUnits: row.earned_units,
    sharePublic: row.share_public,
    createdAt: row.created_at,
    courses: [...merged.values()],
  };
};

const fromPublicRows = (rows: PublicTimetableHistoryRow[]): TimetableHistory[] => {
  const histories = new Map<string, TimetableHistoryRow>();

  rows.forEach((row) => {
    const current = histories.get(row.history_id);
    const history =
      current ??
      {
        id: row.history_id,
        display_name: row.display_name,
        department: row.department,
        major: row.major,
        admission_year: row.admission_year,
        academic_year: row.academic_year,
        student_year_label: row.student_year_label,
        track_label: row.track_label,
        earned_units: row.earned_units,
        share_public: row.share_public,
        created_at: row.history_created_at,
        timetable_history_courses: [],
      };

    if (row.course_row_id && row.course_code && row.course_name && row.module_key) {
      history.timetable_history_courses?.push({
        id: row.course_row_id,
        course_code: row.course_code,
        course_name: row.course_name,
        credits: row.credits ?? 0,
        grade: null,
        academic_year: row.course_academic_year ?? row.academic_year,
        semester: row.semester ?? "",
        schedule: row.schedule ?? "",
        instructor: row.instructor ?? null,
        category: row.category ?? "unknown",
        module_key: row.module_key,
        day_of_week: row.day_of_week ?? null,
        period: row.period ?? null,
        special_type: row.special_type ?? null,
      });
    }

    histories.set(row.history_id, history);
  });

  return [...histories.values()].map(fromRows);
};

export const fetchPublicTimetableHistories = async (): Promise<TimetableHistory[]> => {
  const { data, error } = await supabase
    .rpc("list_public_timetable_histories", { max_count: 48 });
  if (error) throw error;
  return fromPublicRows((data as PublicTimetableHistoryRow[] | null) ?? []);
};

export const filterTimetableHistories = (
  histories: TimetableHistory[],
  filters: TimetableFilters
) =>
  histories.filter((history) => {
    if (filters.department && history.department !== filters.department) return false;
    if (filters.major && history.major !== filters.major) return false;
    if (filters.studentYear && history.studentYearLabel !== filters.studentYear) return false;
    if (filters.module !== "all") {
      const moduleKey = filters.module;
      if (!history.courses.some((course) => course.modules.includes(moduleKey))) {
        return false;
      }
    }
    return true;
  });
