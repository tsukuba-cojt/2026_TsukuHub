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
import { collectCategoryCourses } from "../../features/graduationCheck";
import type {
  CategoryKey,
  Course,
  Grade,
  GraduationCheckReport,
  RequirementItemProgress,
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

function RequirementItemBlock({
  item,
  reviewedCodes,
  onRequestLeave,
}: {
  item: RequirementItemProgress;
  reviewedCodes: ReadonlySet<string>;
  onRequestLeave: (path: string) => void;
}) {
  const unitRange =
    item.minimumUnits === null
      ? null
      : item.maximumUnits !== null && item.maximumUnits !== item.minimumUnits
        ? `${item.minimumUnits}〜${item.maximumUnits}`
        : String(item.minimumUnits);

  return (
    <div className="gradDetailRequirementItem">
      <div className="gradDetailRequirementItemHeader">
        <span
          className={`gradDetailRequirementItemBadge ${item.isSatisfied ? "isSatisfied" : "isUnsatisfied"}`}
          aria-hidden="true"
        >
          {item.isSatisfied ? <Check /> : "！"}
        </span>
        <h4>{item.label}</h4>
        <p>
          {unitRange === null ? (
            item.isSatisfied ? "充足" : "未充足"
          ) : (
            <>
              <span className="gradResultNumFont">{item.earnedUnits}</span>
              {` / ${unitRange} 単位`}
            </>
          )}
        </p>
        {!item.isSatisfied && item.isProspectivelySatisfied && (
          <span className="gradDetailRequirementProspective">
            履修中を含めると充足
          </span>
        )}
      </div>
      <CourseTable
        courses={item.courses}
        reviewedCodes={reviewedCodes}
        onRequestLeave={onRequestLeave}
        emptyMessage="この個別要件に該当する科目はありません"
      />
    </div>
  );
}

function CompulsoryGroupBlock({
  report,
  courses,
  reviewedCodes,
  onRequestLeave,
}: {
  report: GraduationCheckReport;
  courses: Course[];
  reviewedCodes: ReadonlySet<string>;
  onRequestLeave: (path: string) => void;
}) {
  const compulsory = report.categories.find(
    (category) => category.category === "compulsory",
  );
  if (!compulsory) return null;

  return (
    <div className="gradDetailRequirementList">
      <div className="gradDetailRequirementItem">
        <div className="gradDetailRequirementItemHeader">
          <span
            className={`gradDetailRequirementItemBadge ${compulsory.isSatisfied ? "isSatisfied" : "isUnsatisfied"}`}
            aria-hidden="true"
          >
            {compulsory.isSatisfied ? <Check /> : "！"}
          </span>
          <h4>必修</h4>
          <p>
            <span className="gradResultNumFont">{compulsory.earnedUnits}</span>
            {` / ${compulsory.requiredUnits} 単位`}
          </p>
          {!compulsory.isSatisfied &&
            compulsory.isProspectivelySatisfied && (
              <span className="gradDetailRequirementProspective">
                履修中を含めると充足
              </span>
            )}
        </div>
        <CourseTable
          courses={courses}
          reviewedCodes={reviewedCodes}
          onRequestLeave={onRequestLeave}
          emptyMessage="必修に計上された科目はありません"
        />
      </div>
    </div>
  );
}

type Props = {
  report: GraduationCheckReport;
  /** 概要画面で押された区分（この区分が先頭に来るようスクロールする） */
  focusCategory: CategoryKey | null;
  onBack: () => void;
};

// 卒業要件チェック 詳細画面（結果ページ内のビュー切替で表示）
// 5区分と未分類を縦に並べ、判定済みの科目一覧を閲覧専用で出す。
function GraduationCheckDetailView({ report, focusCategory, onBack }: Props) {
  const navigate = useNavigate();
  const categoryCourses = useMemo(
    () => collectCategoryCourses(report),
    [report]
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
                <ProgressBar percent={category.percent} level={level} />
              </div>
              <p className="gradDetailSectionPct">
                <span className="gradResultNumFont">
                  {formatPercent(category.percent)}
                </span>{" "}
                %
              </p>
            </div>

            {hasManualClassification && (
              <p className="gradDetailManualClassificationNote" role="note">
                この区分には、ご自身で分類した未分類科目の単位が含まれています。
                卒業要件上この区分への分類が正しいか、履修細則などでご確認ください。
              </p>
            )}

            {category.category === "compulsory" ? (
              <CompulsoryGroupBlock
                report={report}
                courses={courses}
                reviewedCodes={reviewedCodes}
                onRequestLeave={setPendingPath}
              />
            ) : requirementItems.length === 0 ? (
              <CourseTable
                courses={courses}
                reviewedCodes={reviewedCodes}
                onRequestLeave={setPendingPath}
                emptyMessage="この区分に計上された科目はありません"
              />
            ) : (
              <div className="gradDetailRequirementList">
                {requirementItems.map((item) => (
                  <RequirementItemBlock
                    item={item}
                    reviewedCodes={reviewedCodes}
                    onRequestLeave={setPendingPath}
                    key={item.id}
                  />
                ))}
              </div>
            )}
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
