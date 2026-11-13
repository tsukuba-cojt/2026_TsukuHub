import { supabase } from "../lib/supabase";
export const courseClassificationKinds = [
  "compulsory",
  "specialized",
  "specialized_foundation",
  "common",
  "related",
  "not_counted",
] as const;

export type CourseClassificationKind =
  (typeof courseClassificationKinds)[number];

export const courseClassificationLabels: Record<
  CourseClassificationKind,
  string
> = {
  compulsory: "必修科目",
  specialized: "選択科目（専門）",
  specialized_foundation: "選択科目（専門基礎）",
  common: "選択科目（共通）",
  related: "選択科目（関連）",
  not_counted: "卒業要件の対象外",
};

export type CourseClassificationResponseInput = {
  courseCode: string;
  courseName: string;
  respondentDepartment: string;
  respondentMajor?: string;
  classification: CourseClassificationKind;
};

export type CourseClassificationSuggestionCourse = {
  key: string;
  courseCode: string;
  courseName: string;
};

export type CourseClassificationSuggestion = {
  courseKey: string;
  classification: CourseClassificationKind;
  responseCount: number;
  weightedScore: number;
};

export const saveCourseClassificationResponse = async (
  input: CourseClassificationResponseInput,
  universityId: string,
) => {
  const row = {
    university_id: universityId,
    course_code: input.courseCode.trim().toUpperCase(),
    course_name: input.courseName.trim(),
    respondent_department: input.respondentDepartment.trim(),
    respondent_major: input.respondentMajor?.trim() || null,
    classification: input.classification,
  };
  if (!row.course_name || !row.respondent_department) {
    throw new Error("科目名と回答者学類は必須です。");
  }

  const { error } = await supabase
    .from("course_classification_responses")
    .insert(row);
  if (error) throw error;
};

export const getCourseClassificationSuggestions = async (
  courses: CourseClassificationSuggestionCourse[],
  universityId: string,
  respondentDepartment: string,
  respondentMajor?: string,
): Promise<Map<string, CourseClassificationSuggestion>> => {
  if (courses.length === 0) return new Map();
  const { data, error } = await supabase.rpc(
    "get_course_classification_suggestions",
    {
      target_university_id: universityId,
      target_courses: courses.map((course) => ({
        course_key: course.key,
        course_code: course.courseCode.trim().toUpperCase(),
        course_name: course.courseName.trim(),
      })),
      target_department: respondentDepartment.trim() || null,
      target_major: respondentMajor?.trim() || null,
    },
  );
  if (error) throw error;

  const suggestions = new Map<string, CourseClassificationSuggestion>();
  for (const row of (data ?? []) as Array<{
    course_key: string;
    classification: CourseClassificationKind;
    response_count: number | string;
    weighted_score: number | string;
  }>) {
    if (suggestions.has(row.course_key)) continue;
    suggestions.set(row.course_key, {
      courseKey: row.course_key,
      classification: row.classification,
      responseCount: Number(row.response_count),
      weightedScore: Number(row.weighted_score),
    });
  }
  return suggestions;
};
