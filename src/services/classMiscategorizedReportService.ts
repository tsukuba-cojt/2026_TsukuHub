import { supabase } from "../lib/supabase";
import {
  buildClassificationReports,
  type ClassificationReportSelection,
  type ReportClassification,
} from "../features/graduationCheck/classificationReport";

const databaseCategory: Record<ReportClassification, string> = {
  compulsory: "compulsory",
  specialized: "specialized",
  specializedFoundation: "specialized_foundation",
  common: "common",
  related: "related",
  unclassified: "unclassified",
};

export type ClassMiscategorizedReportRow = {
  mail: string;
  classname: string;
  classnumber: string;
  miscategorize: string;
  suggestedcategorize: string;
};

/** DBの応答本文（メールなどを含み得る）は表示せず、原因とコードを伝える。 */
export function formatClassMiscategorizedReportError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error &&
    typeof error.code === "string" && /^[A-Za-z0-9_]{3,40}$/.test(error.code)
    ? error.code : null;
  const suffix = code ? `（エラーコード：${code}）` : "";
  if (code === "42703" || code === "PGRST204" || code === "42P01" || code === "PGRST205") {
    return `報告先のテーブル・列の設定が一致していません。管理者へお問い合わせください。${suffix}`;
  }
  if (code === "42501") {
    return `報告の保存権限がありません。管理者へお問い合わせください。${suffix}`;
  }
  return `報告の送信に失敗しました。ログイン状態と通信環境を確認し、もう一度送信してください。${suffix}`;
}

/** メールは呼び出し元から受け取らず、認証済みの登録情報から取得する。 */
export async function saveClassMiscategorizedReports(
  selections: ClassificationReportSelection[],
): Promise<void> {
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!data.user?.email) {
    throw new Error("報告するには、メールアドレスを登録したアカウントでログインしてください。");
  }
  const reports = buildClassificationReports(data.user.email, selections);
  const rows: ClassMiscategorizedReportRow[] = reports.map((report) => ({
    mail: report.reporterEmail,
    classname: report.courseName,
    classnumber: report.courseCode,
    miscategorize: databaseCategory[report.originalClassification],
    suggestedcategorize: databaseCategory[report.correctedClassification],
  }));
  const { error } = await supabase.from("class_miscategorized_report").insert(rows);
  if (error) throw error;
}
