import { useLayoutEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, SquarePen } from "lucide-react";
import GraduationCheckLeaveConfirmModal from "./GraduationCheckLeaveConfirmModal";
import ProgressBar from "./GraduationProgressBar";
import GraduationClassificationReportView from "./GraduationClassificationReportView";
import { useReviewedCourseCodes } from "./useReviewedCourseCodes";
import {
  formatPercent,
  levelClass,
  levelFromPercent,
} from "./graduationProgressLevel";
import { collectCategoryCourses } from "../../features/graduationCheck";
import type {
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
// 遷移は直接行わず、親へ依頼して確認ダイアログを挟む（判定結果が失われるため）。
function CourseRow({
  course,
  isReviewed,
  onRequestLeave,
}: {
  course: Course;
  /** ログイン中ユーザーが口コミ投稿済みか */
  isReviewed: boolean;
  onRequestLeave: (path: string) => void;
}) {
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
          onClick={() => onRequestLeave(`/class/${course.id}`)}
        >
          <ArrowUpRight aria-hidden="true" />
        </button>
      </td>
      <td className="gradDetailActionCell">
        {/* 投稿済みの講義は投稿導線を出さず、緑丸チェックの表示に置き換える */}
        {isReviewed ? (
          <span
            className="gradDetailReviewedBadge"
            role="img"
            aria-label="口コミ投稿済み"
            title="口コミ投稿済み"
          >
            <Check aria-hidden="true" />
          </span>
        ) : (
          <button
            type="button"
            className="gradDetailIconBtn"
            disabled={!hasCourseCode}
            aria-label={`${course.name}の口コミを投稿する`}
            onClick={() => onRequestLeave(`/class/${course.id}/review`)}
          >
            <SquarePen aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  );
}

function CourseTable({
  courses,
  reviewedCodes,
  onRequestLeave,
  emptyMessage,
}: {
  courses: Course[];
  reviewedCodes: ReadonlySet<string>;
  onRequestLeave: (path: string) => void;
  emptyMessage: string;
}) {
  return (
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
                {emptyMessage}
              </td>
            </tr>
          ) : (
            // 再履修などで同じ科目が複数行になるため index も key に含める
            courses.map((course, index) => (
              <CourseRow
                course={course}
                isReviewed={course.id !== "" && reviewedCodes.has(course.id)}
                onRequestLeave={onRequestLeave}
                key={`${course.id}-${course.name}-${course.year}-${index}`}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

type Props = {
  disableDatabase?: boolean;
  report: GraduationCheckReport;
  onBack: () => void;
};

// 卒業要件チェック 詳細画面（結果ページ内のビュー切替で表示）
// 5区分と未分類を縦に並べ、判定済みの科目一覧を閲覧専用で出す。
function GraduationCheckDetailView({ report, onBack, disableDatabase = false }: Props) {
  const navigate = useNavigate();
  const categoryCourses = useMemo(
    () => collectCategoryCourses(report),
    [report]
  );
  // 投稿済み講義は科目番号の集合としてマウント時に一括取得する（行ごとには引かない）
  const reviewedCodes = useReviewedCourseCodes();
  // 確認ダイアログで保留中の遷移先（null なら未表示）
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);

  // 新しいタブで開く。noopener,noreferrer 付きなので開いた側から
  // このタブ（＝判定結果を持つページ）を触られることはない。
  const openPendingInNewTab = () => {
    if (pendingPath !== null) {
      window.open(pendingPath, "_blank", "noopener,noreferrer");
    }
    // このページは何も変えずに閉じるだけ（スクロール位置も判定結果もそのまま）
    setPendingPath(null);
  };

  // 詳細・報告画面は、上部の操作ボタンが見えるようページ先頭から表示する。
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [isReporting]);

  if (isReporting) {
    return <GraduationClassificationReportView report={report} onBack={() => setIsReporting(false)} disableDatabase={disableDatabase} />;
  }

  return (
    <>
      <div className="gradDetailHeaderRow">
        <button type="button" className="gradDetailBackBtn" onClick={() => setIsReporting(true)}>
          誤分類を報告
        </button>
        <button type="button" className="gradDetailBackBtn" onClick={onBack}>
          概要に戻る
        </button>
      </div>

      <p className="gradResultNotes" role="note">
        5分類ごとの科目一覧です。個別の必修科目や科目群の詳細条件は、履修細則でご自身でも確認してください。
        ゲージの濃い色は取得済み単位、薄い色は取得見込み分（履修中）を表します。
        割合は取得済み％（取得済み＋取得見込み％）です。
      </p>
      {report.categories.map((category) => {
        const level = category.isSatisfied
          ? "ok"
          : category.percent >= 100
            ? "warn"
            : levelFromPercent(category.percent);
        const courses = categoryCourses[category.category];
        const requirementItems = report.details.requirementItems.filter(
          (item) => item.category === category.category,
        );
        const hasManualClassification = requirementItems.some(
          (item) =>
            item.isManualClassification &&
            (item.earnedUnits > 0 || item.prospectiveUnits > 0),
        );
        return (
          <section
            className="gradDetailSection"
            key={category.category}
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
                <ProgressBar
                  percent={category.percent}
                  prospectivePercent={category.prospectivePercent}
                  level={level}
                />
              </div>
              <p className="gradDetailSectionPct">
                <span className="gradResultNumFont">
                  {formatPercent(category.percent)}
                </span>{" "}
                %
                （<span className="gradResultNumFont">{formatPercent(category.prospectivePercent)}</span>%）
              </p>
            </div>

            {hasManualClassification && (
              <p className="gradDetailManualClassificationNote" role="note">
                この区分には、ご自身で分類した未分類科目の単位が含まれています。
                卒業要件上この区分への分類が正しいか、履修細則などでご確認ください。
              </p>
            )}

            <CourseTable
              courses={courses}
              reviewedCodes={reviewedCodes}
              onRequestLeave={setPendingPath}
              emptyMessage="この区分に計上された科目はありません"
            />
          </section>
        );
      })}

      <section className="gradDetailSection gradDetailUnclassifiedSection">
        <div className="gradDetailSectionHeader isUnclassified">
          <span
            className="gradDetailUnclassifiedBadge"
            aria-hidden="true"
          >
            ？
          </span>
          <h3 className="gradDetailSectionTitle">未分類科目</h3>
          <p className="gradDetailUnclassifiedCount">
            <span className="gradResultNumFont">
              {report.details.uncountedCourses.length}
            </span>{" "}
            科目
          </p>
        </div>
        <CourseTable
          courses={report.details.uncountedCourses}
          reviewedCodes={reviewedCodes}
          onRequestLeave={setPendingPath}
          emptyMessage="未分類の科目はありません"
        />
      </section>

      {pendingPath !== null && (
        <GraduationCheckLeaveConfirmModal
          onCancel={() => setPendingPath(null)}
          onOpenNewTab={openPendingInNewTab}
          onNavigate={() => navigate(pendingPath)}
        />
      )}
    </>
  );
}

export default GraduationCheckDetailView;
