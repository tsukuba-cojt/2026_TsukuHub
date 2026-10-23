import { useState } from "react";
import type {
  CategoryKey,
  Course,
  GraduationCheckReport,
} from "../../features/graduationCheck";
import { getClassCategorizeSuggestions } from "../../services/classCategorizeService";

export type ClassificationSelection = {
  course: Course;
  classification: CategoryKey;
};

type Props = {
  report: GraduationCheckReport;
  onClassify: (selections: ClassificationSelection[]) => void;
};

function UnclassifiedCourseFeedback({ report, onClassify }: Props) {
  const [answers, setAnswers] = useState<Map<Course, CategoryKey>>(new Map());
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const courses = report.details.uncountedCourses;
  const selectedCourses = courses.flatMap((course) => {
    const classification = answers.get(course);
    return classification ? [{ course, classification }] : [];
  });

  const fillFromHistory = async () => {
    setIsLoadingSuggestions(true);
    setSuggestionMessage(null);
    try {
      const suggestions = await getClassCategorizeSuggestions(
        courses.map((course) => course.name),
        report.requirement.department,
      );
      const suggestedCourses = courses.flatMap((course) => {
        const suggestion = suggestions.get(course.name.trim());
        return suggestion ? [{ course, suggestion }] : [];
      });
      setAnswers((current) => {
        const next = new Map(current);
        suggestedCourses.forEach(({ course, suggestion }) => {
          next.set(course, suggestion);
        });
        return next;
      });
      setSuggestionMessage(
        suggestedCourses.length > 0
          ? `${suggestedCourses.length}件の分類候補を入力しました。内容を確認して一括分類してください。`
          : "一致する分類履歴は見つかりませんでした。",
      );
    } catch (error: unknown) {
      const detail =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "原因不明のエラー";
      setSuggestionMessage(`分類履歴の取得に失敗しました: ${detail}`);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  if (courses.length === 0) return null;

  return (
    <section className="gradClassificationSection">
      <div className="gradResultReqHead">
        <span>未分類科目の分類</span>
      </div>
      <div className="gradClassificationToolbar">
        <button
          type="button"
          className="gradClassificationAutoBtn"
          disabled={isLoadingSuggestions}
          onClick={() => void fillFromHistory()}
        >
          {isLoadingSuggestions ? "分類履歴を取得中…" : "自動入力"}
        </button>
        {suggestionMessage && (
          <span className="gradClassificationStatus" role="status">
            {suggestionMessage}
          </span>
        )}
      </div>
      <div className="gradClassificationList">
        {courses.map((course, index) => {
          const classification = answers.get(course) ?? "";
          return (
            <div
              className="gradClassificationRow"
              key={`${course.year}-${course.id}-${course.name}-${index}`}
            >
              <div className="gradClassificationCourse">
                <strong>{course.name}</strong>
                <span>
                  {course.id || "科目番号なし"}・{course.unit}単位・{course.grade}
                </span>
              </div>
              <select
                value={classification}
                aria-label={`${course.name}の分類`}
                onChange={(event) => {
                  const nextClassification = event.target.value as
                    | CategoryKey
                    | "";
                  setAnswers((current) => {
                    const next = new Map(current);
                    if (nextClassification) {
                      next.set(course, nextClassification);
                    } else {
                      next.delete(course);
                    }
                    return next;
                  });
                }}
              >
                <option value="">区分を選択</option>
                {report.categories.map((category) => (
                  <option value={category.category} key={category.category}>
                    {category.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="gradClassificationSaveBtn"
                disabled={!classification}
                onClick={() => {
                  if (classification) onClassify([{ course, classification }]);
                }}
              >
                分類
              </button>
            </div>
          );
        })}
      </div>
      <div className="gradClassificationBatchActions">
        <button
          type="button"
          className="gradClassificationBatchBtn"
          disabled={selectedCourses.length === 0}
          onClick={() => onClassify(selectedCourses)}
        >
          選択した{selectedCourses.length}件を一括分類
        </button>
      </div>
    </section>
  );
}

export default UnclassifiedCourseFeedback;
