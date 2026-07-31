import { Fragment, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  GraduationCap,
  PencilLine,
  ScrollText,
  Upload,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import TimetablePageHeader from "../components/class/TimetablePageHeader";
import {
  CATEGORY_LEGEND,
  enrollYearLabel,
  getTimetableById,
  gradeLabel,
  majorFieldLabel,
  MODULE_TABS,
  OTHER_CATEGORIES,
  OTHER_MODULE,
  type OtherCourses,
  type TimetableCell,
  type TimetableCourse,
} from "../components/class/timetableData";
import "../styles/class/Class.css";
import "../styles/class/Timetable.css";
import "../styles/class/TimetableDetail.css";

const DAY_LABELS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5, 6];

function TimetableDetail() {
  const { timetableId } = useParams();
  // 一覧から引き継いだ絞り込み条件。「戻る」でそのまま同じ検索結果へ復帰する。
  const [searchParams] = useSearchParams();
  const timetable = getTimetableById(timetableId);

  // 表示中の学期タブ。初期値はこの時間割の代表モジュール。
  const [module, setModule] = useState(timetable.module);
  // 取得単位数の表示に使う学期。「その他」タブでは直前の春／秋を維持する。
  const [season, setSeason] = useState<"spring" | "autumn">(
    timetable.module.startsWith("秋") ? "autumn" : "spring"
  );

  const selectModule = (next: string) => {
    setModule(next);
    if (next.startsWith("春")) setSeason("spring");
    else if (next.startsWith("秋")) setSeason("autumn");
  };

  const moduleIndex = MODULE_TABS.indexOf(module);
  // 端（春Aの「‹」／その他の「›」）では何もしない（ボタンを無効化する）。
  const goModule = (step: number) => {
    const next = moduleIndex + step;
    if (next < 0 || next >= MODULE_TABS.length) return;
    selectModule(MODULE_TABS[next]);
  };

  // 「day-period」→ コマ の索引を作り、セル描画時に O(1) で参照する。
  const cellMap = new Map<string, TimetableCell>();
  (timetable.schedule[module] ?? []).forEach((cell) => {
    cellMap.set(`${cell.day}-${cell.period}`, cell);
  });

  const isOther = module === OTHER_MODULE;
  const creditsLabel =
    season === "autumn" ? "秋学期取得単位数" : "春学期取得単位数";
  const credits =
    season === "autumn" ? timetable.autumnCredits : timetable.springCredits;

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <TimetablePageHeader currentPage="時間割詳細" />

        <div className="timetableDetailCard">
          {/* 直前の検索結果（絞り込み条件）を保ったまま一覧へ戻る */}
          <Link
            to={{ pathname: "/timetable", search: searchParams.toString() }}
            className="timetableBackLink"
          >
            <ChevronLeft aria-hidden="true" />
            みんなの時間割に戻る
          </Link>

          <h2 className="timetableDetailTitle">
            {timetable.gakurui} {gradeLabel(timetable.grade)}
          </h2>
          <p className="timetableDetailSub">
            {timetable.enrollYear}年度入学・{timetable.major}
          </p>

          <div className="timetableDetailBody">
            <div className="timetableDetailMain">
              {/* 学期タブ */}
              <div className="timetableModuleTabs" role="tablist">
                {MODULE_TABS.map((tab) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === module}
                    className={`timetableModuleTab${
                      tab === module ? " isActive" : ""
                    }`}
                    onClick={() => selectModule(tab)}
                    key={tab}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* 時間割（左右の矢印で学期タブを順送りする） */}
              <div className="timetableGridWrap">
                <button
                  type="button"
                  className="timetableGridNav"
                  onClick={() => goModule(-1)}
                  disabled={moduleIndex <= 0}
                  aria-label="前の学期"
                >
                  <ChevronLeft aria-hidden="true" />
                </button>

                {isOther ? (
                  <OtherCourseList otherCourses={timetable.otherCourses} />
                ) : (
                  <div className="timetableGrid">
                    <div className="timetableGridHead">
                      <span />
                      {DAY_LABELS.map((day) => (
                        <span className="timetableGridDay" key={day}>
                          {day}
                        </span>
                      ))}
                    </div>

                    <div className="timetableGridBody">
                      {PERIODS.map((period) => (
                        <Fragment key={period}>
                          <span className="timetableGridPeriod">{period}</span>
                          {DAY_LABELS.map((_, day) => {
                            const cell = cellMap.get(`${day}-${period}`);
                            return (
                              <div className="timetableGridCell" key={day}>
                                {cell && (
                                  <div
                                    className={`timetableCourse is-${cell.category}`}
                                  >
                                    <span className="timetableCourseCode">
                                      {cell.code}
                                    </span>
                                    <span className="timetableCourseName">
                                      {cell.name}
                                    </span>
                                    <span className="timetableCourseLabel">
                                      {cell.label}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="timetableGridNav"
                  onClick={() => goModule(1)}
                  disabled={moduleIndex >= MODULE_TABS.length - 1}
                  aria-label="次の学期"
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>

              {/* 科目区分の凡例 */}
              <ul className="timetableLegend">
                {CATEGORY_LEGEND.map((item) => (
                  <li className="timetableLegendItem" key={item.category}>
                    <span
                      className={`timetableLegendSwatch is-${item.category}`}
                      aria-hidden="true"
                    />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="timetableDetailSide">
              <section className="timetableAttrBox">
                <h3 className="timetableAttrTitle">この時間割の属性（匿名）</h3>
                <dl className="timetableAttrGrid">
                  <div className="timetableAttrItem">
                    <dt className="timetableAttrLabel">
                      <Calendar aria-hidden="true" />
                      入学年度
                    </dt>
                    <dd className="timetableAttrValue">
                      {enrollYearLabel(timetable.enrollYear)}
                    </dd>
                  </div>
                  <div className="timetableAttrItem">
                    <dt className="timetableAttrLabel">
                      <GraduationCap aria-hidden="true" />
                      学類
                    </dt>
                    <dd className="timetableAttrValue">{timetable.gakurui}</dd>
                  </div>
                  <div className="timetableAttrItem">
                    <dt className="timetableAttrLabel">
                      <Clock aria-hidden="true" />
                      学年
                    </dt>
                    <dd className="timetableAttrValue">
                      {gradeLabel(timetable.grade)}
                    </dd>
                  </div>
                  <div className="timetableAttrItem">
                    <dt className="timetableAttrLabel">
                      <BookOpen aria-hidden="true" />
                      専攻・分野
                    </dt>
                    <dd className="timetableAttrValue">
                      {majorFieldLabel(timetable.major)}
                    </dd>
                  </div>
                  <div className="timetableAttrItem">
                    <dt className="timetableAttrLabel">
                      <PencilLine aria-hidden="true" />
                      {creditsLabel}
                      <CircleHelp
                        className="timetableAttrHelp"
                        aria-label="投稿者の自己申告値です"
                      />
                    </dt>
                    <dd className="timetableAttrValue">{credits}単位</dd>
                  </div>
                  {/* 備考は他の項目と区切って下部に配置する */}
                  <div className="timetableAttrItem isWide">
                    <dt className="timetableAttrLabel">
                      <ScrollText aria-hidden="true" />
                      備考
                    </dt>
                    <dd className="timetableAttrValue">{timetable.note}</dd>
                  </div>
                </dl>
              </section>

              {/* ベースにする（時間割作成）フローは未実装のためプレースホルダーのルート。 */}
              <Link to="/timetable/share" className="timetableBaseBtn">
                <Upload aria-hidden="true" />
                この時間割をベースにする
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// 曜日・時限を持たない科目のチップ。グリッドのセルと同じ区分色を使う。
function CourseChip({ course }: { course: TimetableCourse }) {
  return (
    <span className={`timetableChip is-${course.category}`}>
      <span className="timetableChipCode">{course.code}</span>
      <span className="timetableChipName">{course.name}</span>
    </span>
  );
}

// 「その他」タブ：集中／応談／随時／NT を常に見出しごと表示する。
// 該当科目が無いカテゴリ・実施時期は見出しのみで中身は白紙（プレースホルダーは出さない）。
function OtherCourseList({ otherCourses }: { otherCourses: OtherCourses }) {
  return (
    <div className="timetableOtherBox">
      {OTHER_CATEGORIES.map(({ key, label }) => (
        <section className="timetableOtherSection" key={key}>
          <h4 className="timetableOtherLabel">{label}</h4>
          {key === "intensive" ? (
            // 集中のみ実施時期ごとのサブ行を持つ
            <div className="timetableOtherRows">
              {otherCourses.intensive.map((group) => (
                <div className="timetableOtherRow" key={group.term}>
                  <span className="timetableOtherTerm">{group.term}</span>
                  <div className="timetableOtherChips">
                    {group.courses.map((course, i) => (
                      <CourseChip course={course} key={`${course.code}-${i}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="timetableOtherChips">
              {otherCourses[key].map((course, i) => (
                <CourseChip course={course} key={`${course.code}-${i}`} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

export default TimetableDetail;
