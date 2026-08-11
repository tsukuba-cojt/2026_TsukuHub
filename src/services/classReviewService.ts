import { supabase } from "../lib/supabase";
import type { Review } from "../components/class/mockReviews";
import type { GradeDistribution } from "../components/class/CreditRateCard";

export type ClassReviewInput = {
  courseCode: string;
  rating: number;
  lectureFormat: string;
  testFormat: string;
  difficulty: string;
  workload: string;
  attendance: string;
  pastExam: string;
  comment: string;
  anonymous: boolean;
};

export type CourseInsightStats = {
  sampleCount: number;
  creditRate: number | null;
  confidenceLabel: string;
  highlightLabel: string;
  gradeDistribution: GradeDistribution[];
  difficultyLabel: string;
  workloadLabel: string;
  difficultySampleCount: number;
};

type ClassReviewRow = {
  id: string;
  course_code: string;
  rating: number;
  lecture_format: string | null;
  test_format: string | null;
  difficulty: string | null;
  workload: string | null;
  attendance: string | null;
  past_exam: string | null;
  comment: string | null;
  anonymous: boolean;
  created_at: string;
};

type CourseLearningStatsRow = {
  course_code: string;
  sample_count: number;
  passed_count: number;
  a_plus_count: number;
  a_count: number;
  b_count: number;
  c_count: number;
  d_count: number;
  f_count: number;
  p_count: number;
  recognized_count: number;
};

const difficultyScore: Record<string, number> = {
  とても難しい: 5,
  難しい: 4,
  普通: 3,
  簡単: 2,
  とても簡単: 1,
};

const workloadScore: Record<string, number> = {
  とても多い: 5,
  多い: 4,
  普通: 3,
  少ない: 2,
  とても少ない: 1,
};

const scoreLabel = (score: number, labels: [string, string, string, string, string]) => {
  if (score >= 4.5) return labels[0];
  if (score >= 3.5) return labels[1];
  if (score >= 2.5) return labels[2];
  if (score >= 1.5) return labels[3];
  return labels[4];
};

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

const reviewTags = (row: ClassReviewRow) =>
  [row.difficulty, row.workload, row.lecture_format, row.test_format]
    .filter((value): value is string => Boolean(value && value.trim()))
    .slice(0, 4);

export const fetchClassReviews = async (courseCode: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from("public_class_reviews")
    .select("*")
    .eq("course_code", courseCode)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as ClassReviewRow[] | null) ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    grade: "筑波大生",
    department: row.anonymous ? "匿名" : "投稿者",
    comment: row.comment || "コメントなし",
    date: dateLabel(row.created_at),
    helpfulCount: 0,
    tags: reviewTags(row),
  }));
};

export const createClassReview = async (input: ClassReviewInput) => {
  const { error } = await supabase.from("class_reviews").insert({
    course_code: input.courseCode,
    rating: input.rating,
    lecture_format: input.lectureFormat || null,
    test_format: input.testFormat || null,
    difficulty: input.difficulty || null,
    workload: input.workload || null,
    attendance: input.attendance || null,
    past_exam: input.pastExam || null,
    comment: input.comment.trim() || null,
    anonymous: input.anonymous,
  });
  if (error) throw error;
};

export const fetchReviewedCourseCodes = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("class_reviews")
    .select("course_code")
    .eq("user_id", userId);
  if (error) throw error;
  return ((data as { course_code: string }[] | null) ?? []).map((row) => row.course_code);
};

const distribution = (row: CourseLearningStatsRow): GradeDistribution[] => {
  const total = Math.max(row.sample_count, 1);
  return [
    { grade: "D/F", ratio: Math.round(((row.d_count + row.f_count) / total) * 100), colorClass: "isCoral" },
    { grade: "C", ratio: Math.round((row.c_count / total) * 100), colorClass: "isYellow" },
    { grade: "B", ratio: Math.round((row.b_count / total) * 100), colorClass: "isGreen" },
    { grade: "A", ratio: Math.round((row.a_count / total) * 100), colorClass: "isBlue" },
    { grade: "A+", ratio: Math.round((row.a_plus_count / total) * 100), colorClass: "isGradient" },
  ];
};

export const fetchCourseInsightStats = async (
  courseCode: string,
  reviews: Review[]
): Promise<CourseInsightStats> => {
  const { data } = await supabase
    .from("course_learning_stats")
    .select("*")
    .eq("course_code", courseCode)
    .maybeSingle();
  const stats = data as CourseLearningStatsRow | null;
  const reviewRows = await supabase
    .from("public_class_reviews")
    .select("difficulty, workload")
    .eq("course_code", courseCode);

  const difficultyValues =
    ((reviewRows.data as { difficulty: string | null; workload: string | null }[] | null) ?? [])
      .map((row) => row.difficulty)
      .filter((value): value is string => Boolean(value && difficultyScore[value] !== undefined));
  const workloadValues =
    ((reviewRows.data as { difficulty: string | null; workload: string | null }[] | null) ?? [])
      .map((row) => row.workload)
      .filter((value): value is string => Boolean(value && workloadScore[value] !== undefined));

  const avgDifficulty =
    difficultyValues.length > 0
      ? difficultyValues.reduce((sum, value) => sum + difficultyScore[value], 0) / difficultyValues.length
      : null;
  const avgWorkload =
    workloadValues.length > 0
      ? workloadValues.reduce((sum, value) => sum + workloadScore[value], 0) / workloadValues.length
      : null;

  const reviewSample = Math.max(reviews.length, difficultyValues.length);
  return {
    sampleCount: stats?.sample_count ?? 0,
    creditRate:
      stats && stats.sample_count >= 10
        ? Math.round((stats.passed_count / Math.max(stats.sample_count, 1)) * 100)
        : null,
    confidenceLabel: stats && stats.sample_count >= 30 ? "高" : stats && stats.sample_count >= 10 ? "中" : "不足",
    highlightLabel:
      stats && stats.sample_count >= 10 && stats.passed_count / Math.max(stats.sample_count, 1) >= 0.9
        ? "取りやすめ"
        : "参考値",
    gradeDistribution: stats ? distribution(stats) : [],
    difficultyLabel:
      avgDifficulty === null
        ? "データ不足"
        : scoreLabel(avgDifficulty, ["かなり難しい", "難しい", "普通", "やさしめ", "かなりやさしい"]),
    workloadLabel:
      avgWorkload === null
        ? "データ不足"
        : scoreLabel(avgWorkload, ["かなり多い", "多い", "普通", "少なめ", "かなり少ない"]),
    difficultySampleCount: reviewSample,
  };
};
