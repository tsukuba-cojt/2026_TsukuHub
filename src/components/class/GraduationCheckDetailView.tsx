import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, SquarePen } from "lucide-react";
import ProgressBar from "./GraduationProgressBar";
import {
  formatPercent,
  levelClass,
  levelFromPercent,
} from "./graduationProgressLevel";
import { collectCategoryCourses } from "../../features/graduationCheck";
import type {
  CategoryKey,
  Course,
  Grade,
  GraduationCheckReport,
} from "../../features/graduationCheck";
import "../../styles/class/GraduationCheckResult.css";
import "../../styles/class/GraduationCheckDetail.css";

// 成績の表示色。講義詳細ページの成績分布グラフ（CreditRateCard.css）と同じ配色に揃える。
// P・認は評価が付かない合格なので A と同じ青、履修中は本文色のまま。
const gradeClass: Record<Grade, string> = {
  "A+": "isGradient",
  A: "isBlue",
  P: "isBlue",
  認: "isBlue",
  B: "isGreen",
  C: "isYellow",
  D: "isCoral",
  F: "isCoral",
  履修中: "isNeutral",
};

// 科目テーブルの1行。
// 科目番号が無い科目（成績CSVに載っていない等）は講義を特定できないため、
// 講義詳細・口コミ投稿への導線を非活性にする。
function CourseRow({ course }: { course: Course }) {
  const navigate = useNavigate();
  const hasCourseCode = course.id !== "";

  return (
    <tr className="gradDetailRow">
      <td className="gradDetailCode">{course.id}</td>
      <td className="gradDetailName">{course.name}</td>
      <td className="gradDetailUnit gradResultNumFont">
        {course.unit.toFixed(1)}
      </td>
      <td className={`gradDetailGrade ${gradeClass[course.grade]}`}>
        {course.grade}
      </td>
      <td className="gradDetailActionCell">
        <button
          type="button"
          className="gradDetailIconBtn"
          disabled={!hasCourseCode}
          aria-label={`${course.name}の講義詳細を見る`}
          onClick={() => navigate(`/class/${course.id}`)}
        >
          <ArrowUpRight aria-hidden="true" />
        </button>
      </td>
      <td className="gradDetailActionCell">
        <button
          type="button"
          className="gradDetailIconBtn"
          disabled={!hasCourseCode}
          aria-label={`${course.name}の口コミを投稿する`}
          onClick={() => navigate(`/class/${course.id}/review`)}
        >
          <SquarePen aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

type Props = {
  report: GraduationCheckReport;
  /** 概要画面で押された区分（この区分が先頭に来るようスクロールする） */
  focusCategory: CategoryKey | null;
  onBack: () => void;
};

// 卒業要件チェック 詳細画面（結果ページ内のビュー切替で表示）
// 全区分を縦に並べ、区分ごとに計上された科目の一覧を出す。
function GraduationCheckDetailView({ report, focusCategory, onBack }: Props) {
  const categoryCourses = useMemo(
    () => collectCategoryCourses(report),
    [report]
  );
  const sectionRefs = useRef<Partial<Record<CategoryKey, HTMLElement | null>>>(
    {}
  );

  // 概要画面で押された区分を画面先頭に合わせる（未指定ならページ先頭）
  useEffect(() => {
    const target = focusCategory
      ? sectionRefs.current[focusCategory]
      : undefined;
    if (target) {
      target.scrollIntoView({ block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [focusCategory]);

  return (
    <>
      <div className="gradDetailHeaderRow">
        <button type="button" className="gradDetailBackBtn" onClick={onBack}>
          概要に戻る
        </button>
      </div>

      {report.categories.map((category) => {
        const level = levelFromPercent(category.percent);
        const courses = categoryCourses[category.category];
        return (
          <section
            className="gradDetailSection"
            key={category.category}
            ref={(element) => {
              sectionRefs.current[category.category] = element;
            }}
          >
            <div className={`gradDetailSectionHeader ${levelClass[level]}`}>
              <span
                className={`gradResultReqBadge ${levelClass[level]}`}
                aria-hidden="true"
              >
                {level === "ok" ? <Check /> : "！"}
              </span>
              <h3 className="gradDetailSectionTitle">{category.label}</h3>
              <p className="gradDetailSectionUnits">
                <span className="gradDetailSectionEarned gradResultNumFont">
                  {category.earnedUnits}
                </span>
                <span className="gradDetailSectionUnitsSub">
                  / {category.requiredUnits} 単位
                </span>
              </p>
              <div className="gradDetailSectionBarCell">
                <ProgressBar percent={category.percent} />
              </div>
              <p className="gradDetailSectionPct">
                <span className="gradResultNumFont">
                  {formatPercent(category.percent)}
                </span>{" "}
                %
              </p>
            </div>

            <div className="gradDetailTableWrap">
              <table className="gradDetailTable">
                <thead>
                  <tr>
                    <th scope="col">科目番号</th>
                    <th scope="col">科目名</th>
                    <th scope="col">単位数</th>
                    <th scope="col">成績</th>
                    <th scope="col">詳細</th>
                    <th scope="col">口コミを投稿</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td className="gradDetailEmpty" colSpan={6}>
                        この区分に計上された科目はありません
                      </td>
                    </tr>
                  ) : (
                    // 再履修などで同じ科目が複数行になるため index も key に含める
                    courses.map((course, index) => (
                      <CourseRow
                        course={course}
                        key={`${course.id}-${course.name}-${index}`}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </>
  );
}

export default GraduationCheckDetailView;
