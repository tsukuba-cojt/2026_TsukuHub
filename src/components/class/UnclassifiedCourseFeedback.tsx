import { useState } from "react";
import type {
  CategoryKey,
  Course,
  GraduationCheckReport,
} from "../../features/graduationCheck";

type Props = {
  report: GraduationCheckReport;
  onClassify: (course: Course, classification: CategoryKey) => void;
};

function UnclassifiedCourseFeedback({ report, onClassify }: Props) {
  const [answers, setAnswers] = useState<Map<Course, CategoryKey>>(new Map());
  const courses = report.details.uncountedCourses;

  if (courses.length === 0) return null;

  return (
    <section className="gradClassificationSection">
      <div className="gradResultReqHead">
        <span>未分類科目の分類</span>
      </div>
      <p className="gradClassificationLead">
        未分類科目の区分を選択すると、この画面の判定結果と単位集計へ反映できます。
        分類内容はDBへ保存されず、ページを離れると破棄されます。
      </p>
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
                  if (classification) onClassify(course, classification);
                }}
              >
                分類
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default UnclassifiedCourseFeedback;
