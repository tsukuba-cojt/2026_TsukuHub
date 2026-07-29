import { createClient, type User } from "@supabase/supabase-js";
import { parseGradesCsv } from "./parseCsv";
import type { Course, Grade } from "./types";

/**
 * jsonb形式で保存する単一レコードの型
 * { 科目番号, 総合評価 }
 */
export type GradeRecordJsonbItem = {
  科目番号: string;
  総合評価: Grade;
};

type StudentProfile = {
  student_number: string | number | null;
  grade: number | null;
  major: string | null;
};

// Supabase クライアントの初期化
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

/**
 * parseCsv で取得した Course 配列を jsonb 形式に変換する
 *
 * @param courses parseGradesCsv から取得した Course[]
 * @returns {{科目番号, 総合評価}} の配列 (jsonb 互換オブジェクト)
 */
export const formatCoursesToJsonb = (courses: Course[]): GradeRecordJsonbItem[] => {
  return courses.map((course) => ({
    科目番号: course.id,
    総合評価: course.grade,
  }));
};

/**
 * ログインユーザーの profiles 行から学籍番号・学年・学類を取得する。
 * profiles.id は Supabase Auth の user.id と一致する前提。
 */
const getStudentProfile = async (
  user: User
): Promise<StudentProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("student_number, grade, major")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return data as StudentProfile;
};

/** ログインユーザーの profiles 行から student_number を取得する。 */
export const getStudentNumberFromUser = async (
  user: User
): Promise<string | null> => {
  const profile = await getStudentProfile(user);
  return profile?.student_number ? String(profile.student_number) : null;
};

export type SaveGradeRecordsParams = {
  /** parseGradesCsv で得た Course 配列（CSV文字列も渡せる） */
  coursesOrCsv: Course[] | string;
  /** ログインユーザー情報（Supabase Auth の User オブジェクト） */
  user: User;
  /** データベースのテーブル名（デフォルト: "student_records"） */
  tableName?: string;
};

export type SaveGradeRecordsResult = {
  success: boolean;
  studentNumber: string | null;
  recordsCount: number;
  error?: string;
};

/**
 * CSVデータ/Course配列から jsonb 形式のデータを生成し、
 * student_number と records (jsonb) をデータベースへ保存（upsert）する関数
 */
export const saveGradeRecordsToDb = async ({
  coursesOrCsv,
  user,
  tableName = "student_records",
}: SaveGradeRecordsParams): Promise<SaveGradeRecordsResult> => {
  try {
    // 1. profiles から student_number・grade・major を取得
    const profile = await getStudentProfile(user);
    const studentNumber = profile?.student_number
      ? String(profile.student_number)
      : null;

    if (!profile || !studentNumber || profile.grade === null || !profile.major) {
      return {
        success: false,
        studentNumber: null,
        recordsCount: 0,
        error: "プロフィールから student_number、grade、または major を取得できませんでした。",
      };
    }

    // 2. 科目データの準備
    let courses: Course[];
    if (typeof coursesOrCsv === "string") {
      const parseResult = parseGradesCsv(coursesOrCsv);
      courses = parseResult.courses;
    } else {
      courses = coursesOrCsv;
    }

    // 3. {{科目番号, 総合評価}} の jsonb 形式へ変換
    const records = formatCoursesToJsonb(courses);

    // 4. データベースへのアップロード
    const { error } = await supabase.from(tableName).upsert(
      {
        student_number: studentNumber,
        records,
        grade: profile.grade,
        major: profile.major,
      },
      {
        onConflict: "student_number", // student_number をキーとして更新/挿入
      }
    );

    if (error) {
      return {
        success: false,
        studentNumber,
        recordsCount: records.length,
        error: `データベースへの保存に失敗しました: ${error.message}`,
      };
    }

    return {
      success: true,
      studentNumber,
      recordsCount: records.length,
    };
  } catch (err: unknown) {
    return {
      success: false,
      studentNumber: null,
      recordsCount: 0,
      error: err instanceof Error ? err.message : "不明なエラーが発生しました。",
    };
  }
};
