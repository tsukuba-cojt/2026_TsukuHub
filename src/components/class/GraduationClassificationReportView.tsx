import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/authContextValue";
import { formatClassMiscategorizedReportError, saveClassMiscategorizedReports } from "../../services/classMiscategorizedReportService";
import { collectCategoryCourses } from "../../features/graduationCheck";
import type { CategoryKey, GraduationCheckReport } from "../../features/graduationCheck";
import {
  buildClassificationReports,
  type ClassificationReport,
  type ReportClassification,
} from "../../features/graduationCheck/classificationReport";

type Props = { report: GraduationCheckReport; onBack: () => void; disableDatabase?: boolean };

export default function GraduationClassificationReportView({ report, onBack, disableDatabase = false }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [answers, setAnswers] = useState<Record<string, CategoryKey>>({});
  const [preview, setPreview] = useState<ClassificationReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const categoryCourses = useMemo(() => collectCategoryCourses(report), [report]);
  const groups = [
    ...report.categories.map((category) => ({
      classification: category.category as ReportClassification,
      label: category.label,
      courses: categoryCourses[category.category],
    })),
    { classification: "unclassified" as const, label: "未分類", courses: report.details.uncountedCourses },
  ];
  // 再履修などの同じ科目は、現在の分類ごとに1件にまとめる。
  const rows = groups.flatMap((group) => {
    const seen = new Set<string>();
    return group.courses.flatMap((course) => {
      const key = JSON.stringify([group.classification, course.id, course.name]);
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ key, course, originalClassification: group.classification }];
    });
  });
  const selectedCount = rows.filter((row) => answers[row.key]).length;
  const invalidatePreview = () => { setPreview(null); setError(null); setSubmittedCount(0); };
  const prepareReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPreview(null);
    try {
      setPreview(buildClassificationReports(user?.email ?? "", rows.flatMap((row) => {
        const correctedClassification = answers[row.key];
        return correctedClassification ? [{
          courseCode: row.course.id,
          courseName: row.course.name,
          originalClassification: row.originalClassification,
          correctedClassification,
        }] : [];
      })));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "報告内容を確認してください。");
    }
  };

  const submitReports = async () => {
    if (!preview || isSubmitting || authLoading || !user?.email || disableDatabase) return;
    if (preview[0].reporterEmail !== user.email.trim()) {
      setPreview(null);
      setError("ログイン情報が変わりました。報告内容を再度確認してください。");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await saveClassMiscategorizedReports(preview.map(({ courseCode, courseName, originalClassification, correctedClassification }) => ({
        courseCode, courseName, originalClassification, correctedClassification,
      })));
      setSubmittedCount(preview.length);
      setPreview(null);
      setAnswers({});
    } catch (cause) {
      setError(formatClassMiscategorizedReportError(cause));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="gradReportForm" onSubmit={prepareReport}>
      <div className="gradDetailHeaderRow">
        <h2>誤分類を報告</h2>
        <button type="button" className="gradDetailBackBtn" disabled={isSubmitting} onClick={onBack}>詳細画面に戻る</button>
      </div>
      <p className="gradResultNotes">
        誤分類のある科目だけ、正しい分類を選択してください。同じボタンを再度押すと選択を解除できます。
        内容を確認してから報告を送信できます。
      </p>
      <p className="gradResultNotes">
        {authLoading ? "ログイン情報を確認中…" : user?.email ? `報告ユーザー：${user.email}` : "報告を送信するにはログインしてください。"}
      </p>
      {disableDatabase && <p role="status">テストモードでは報告内容の確認のみ利用できます。</p>}
      {groups.map((group) => (
        <section className="gradDetailSection" key={group.classification}>
          <h3>{group.label} <small>（現在の分類）</small></h3>
          <div className="gradDetailTableWrap">
            <table className="gradDetailTable gradReportTable">
              <thead><tr><th scope="col">科目番号</th><th scope="col">科目名</th><th scope="col">変更後の分類</th></tr></thead>
              <tbody>
                {rows.filter((row) => row.originalClassification === group.classification).map((row) => (
                  <tr className="gradDetailRow" key={row.key}>
                    <td className="gradDetailCode">{row.course.id || "科目番号なし"}</td>
                    <td className="gradDetailName">{row.course.name}</td>
                    <td>
                      <div className="gradReportChoices" role="group" aria-label={`${row.course.name}の変更後の分類`}>
                        {report.categories.filter((option) => option.category !== group.classification).map((option) => (
                          <button type="button" className="gradDetailBackBtn" key={option.category} aria-pressed={answers[row.key] === option.category}
                            disabled={!row.course.name.trim() || isSubmitting}
                            onClick={() => {
                              setAnswers((current) => {
                                const next = { ...current };
                                if (next[row.key] === option.category) delete next[row.key];
                                else next[row.key] = option.category;
                                return next;
                              });
                              invalidatePreview();
                            }}>{option.label}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {group.courses.length === 0 && <tr><td colSpan={3} className="gradDetailEmpty">この区分の科目はありません</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <button className="gradDetailBackBtn" type="submit" disabled={selectedCount === 0 || isSubmitting || authLoading || !user?.email}>
        選択した{selectedCount}件の報告内容を確認
      </button>
      {error && <p role="alert">{error}</p>}
      {submittedCount > 0 && <p role="status">{submittedCount}件の誤分類報告を送信しました。</p>}
      {preview && (
        <section className="gradReportPreview" aria-label="報告内容の確認">
          <h3>報告内容の確認（{preview.length}件）</h3>
          <p>報告ユーザー：{preview[0].reporterEmail}</p>
          <ul>{preview.map((item, index) => (
            <li key={index}>{item.courseCode} {item.courseName}：
              {groups.find((group) => group.classification === item.originalClassification)?.label} → {groups.find((group) => group.classification === item.correctedClassification)?.label}
            </li>
          ))}</ul>
          <button type="button" className="gradDetailBackBtn" disabled={isSubmitting || authLoading || !user?.email || disableDatabase}
            onClick={() => void submitReports()}>{isSubmitting ? "送信中…" : "この内容で報告を送信"}</button>
        </section>
      )}
    </form>
  );
}
