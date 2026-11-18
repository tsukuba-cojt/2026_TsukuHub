import type { CategoryKey } from "./types";

export type ReportClassification = CategoryKey | "unclassified";

/** DB接続時もこの5項目を1科目につき1件送る。 */
export type ClassificationReport = {
  reporterEmail: string;
  /** 科目番号がない場合は空文字を許可する。 */
  courseCode: string;
  courseName: string;
  originalClassification: ReportClassification;
  correctedClassification: CategoryKey;
};

export type ClassificationReportSelection = Omit<ClassificationReport, "reporterEmail">;

export function buildClassificationReports(
  reporterEmail: string,
  selections: ClassificationReportSelection[],
): ClassificationReport[] {
  const email = reporterEmail.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("メールアドレスを正しく入力してください。");
  }
  if (selections.length === 0) {
    throw new Error("報告する科目の変更後の分類を選択してください。");
  }
  return selections.map((selection) => {
    if (!selection.courseName.trim()) {
      throw new Error("科目名のある科目を選択してください。");
    }
    if (selection.originalClassification === selection.correctedClassification) {
      throw new Error("現在の分類と異なる分類を選択してください。");
    }
    return { ...selection, reporterEmail: email };
  });
}
