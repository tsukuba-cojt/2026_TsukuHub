import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, SquarePen } from "lucide-react";
import GraduationCheckLeaveConfirmModal from "./GraduationCheckLeaveConfirmModal";
import ProgressBar from "./GraduationProgressBar";
import { useReviewedCourseCodes } from "./useReviewedCourseCodes";
import {
  formatPercent,
  levelClass,
  levelFromPercent,
} from "./graduationProgressLevel";
import { getGraduationCheckProvider } from "../../features/graduationCheck/provider";
import { useUniversity } from "../university/universityContextValue";
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

// 大阪は KOAN CSV に科目番号が無いため catalogCourseNumber をリンクキーに使う。
function courseLinkCode(course: Course, universitySlug?: string): string {
  if (course.catalogCourseNumber) return course.catalogCourseNumber;
  return universitySlug === "osaka" ? "" : course.id;
}

// 科目テーブルの1行。
// 科目番号が無い科目（成績CSVに載っていない等）は講義を特定できないため、
// 講義詳細・口コミ投稿への導線を非活性にする。
// 遷移は直接行わず、親へ依頼して確認ダイアログを挟む（判定結果が失われるため）。
function CourseRow({
  course,
  linkCode,
  isReviewed,
  onRequestLeave,
}: {
  course: Course;
  linkCode: string;
  /** ログイン中ユーザーが口コミ投稿済みか */
  isReviewed: boolean;
  onRequestLeave: (path: string) => void;
}) {
  const hasCourseCode = linkCode !== "";
  const disabledReason =
    "授業カタログに未登録のため、講義詳細へリンクできません";

  return (
    <tr className="gradDetailRow">
      <td className="gradDetailCode">{linkCode || "—"}</td>
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
          title={hasCourseCode ? undefined : disabledReason}
          aria-label={`${course.name}の講義詳細を見る`}
          onClick={() => onRequestLeave(`/class/${encodeURIComponent(linkCode)}`)}
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
            title={hasCourseCode ? undefined : disabledReason}
            aria-label={`${course.name}の口コミを投稿する`}
            onClick={() =>
            onRequestLeave(`/class/${encodeURIComponent(linkCode)}/review`)
          }
          >
            <SquarePen aria-hidden="true" />
          </button>
        )}
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
  const navigate = useNavigate();
  const { university } = useUniversity();
  const provider = getGraduationCheckProvider(university?.slug);
  const categoryCourses = useMemo(
    () => provider.collectCategoryCourses(report),
    [provider, report]
  );
  const sectionRefs = useRef<Partial<Record<CategoryKey, HTMLElement | null>>>(
    {}
  );
  // 投稿済み講義は科目番号の集合としてマウント時に一括取得する（行ごとには引かない）
  const reviewedCodes = useReviewedCourseCodes();
  // 確認ダイアログで保留中の遷移先（null なら未表示）
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // 新しいタブで開く。noopener,noreferrer 付きなので開いた側から
  // このタブ（＝判定結果を持つページ）を触られることはない。
  const openPendingInNewTab = () => {
    if (pendingPath !== null) {
      window.open(pendingPath, "_blank", "noopener,noreferrer");
    }
    // このページは何も変えずに閉じるだけ（スクロール位置も判定結果もそのまま）
    setPendingPath(null);
  };

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
                    courses.map((course, index) => {
                      const linkCode = courseLinkCode(
                        course,
                        university?.slug
                      );
                      return (
                        <CourseRow
                          course={course}
                          linkCode={linkCode}
                          isReviewed={
                            linkCode !== "" && reviewedCodes.has(linkCode)
                          }
                          onRequestLeave={setPendingPath}
                          key={`${linkCode || course.id}-${course.name}-${index}`}
                        />
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

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
