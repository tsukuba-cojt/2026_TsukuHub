import { Fragment, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bookmark,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  GraduationCap,
  SquarePen,
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
  type TimetableCell,
} from "../components/class/timetableData";
import "../styles/class/Class.css";
import "../styles/class/Timetable.css";
import "../styles/class/TimetableDetail.css";

const DAY_LABELS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5, 6];

function TimetableDetail() {
  const { timetableId } = useParams();
  const timetable = getTimetableById(timetableId);

  // 表示中のモジュール。初期値はこの時間割の代表モジュール。
  const [module, setModule] = useState(timetable?.module ?? MODULE_TABS[0]);

  const moduleIndex = MODULE_TABS.indexOf(module);
  const goModule = (step: number) => {
    const next = moduleIndex + step;
    if (next < 0 || next >= MODULE_TABS.length) return;
    setModule(MODULE_TABS[next]);
  };

  // 「day-period」→ コマ の索引を作り、セル描画時に O(1) で参照する。
  const cellMap = new Map<string, TimetableCell>();
  (timetable?.schedule[module] ?? []).forEach((cell) => {
    cellMap.set(`${cell.day}-${cell.period}`, cell);
  });

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <TimetablePageHeader currentPage="時間割詳細" />

        <div className="timetableDetailCard">
          <Link to="/timetable" className="timetableBackLink">
            <ChevronLeft aria-hidden="true" />
            みんなの時間割に戻る
          </Link>

          {!timetable ? (
            <p className="timetableDetailMissing">
              指定された時間割は見つかりませんでした。
            </p>
          ) : (
            <>
              <h2 className="timetableDetailTitle">
                {timetable.gakurui} {gradeLabel(timetable.grade)}
              </h2>
              <p className="timetableDetailSub">
                {timetable.enrollYear}年度入学・{timetable.major}
              </p>

              <div className="timetableDetailBody">
                <div className="timetableDetailMain">
                  {/* モジュール切り替えタブ */}
                  <div className="timetableModuleTabs" role="tablist">
                    {MODULE_TABS.map((tab) => (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === module}
                        className={`timetableModuleTab${
                          tab === module ? " isActive" : ""
                        }`}
                        onClick={() => setModule(tab)}
                        key={tab}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* 時間割グリッド（左右のシェブロンでモジュールを送る） */}
                  <div className="timetableGridWrap">
                    <button
                      type="button"
                      className="timetableGridNav"
                      onClick={() => goModule(-1)}
                      disabled={moduleIndex <= 0}
                      aria-label="前のモジュール"
                    >
                      <ChevronLeft aria-hidden="true" />
                    </button>

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

                    <button
                      type="button"
                      className="timetableGridNav"
                      onClick={() => goModule(1)}
                      disabled={moduleIndex >= MODULE_TABS.length - 1}
                      aria-label="次のモジュール"
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
                    <h3 className="timetableAttrTitle">
                      この時間割の属性（匿名）
                    </h3>
                    <dl className="timetableAttrGrid">
                      <div className="timetableAttrItem">
                        <dt className="timetableAttrLabel">
                          <CalendarRange aria-hidden="true" />
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
                        <dd className="timetableAttrValue">
                          {timetable.gakurui}
                        </dd>
                      </div>
                      <div className="timetableAttrItem">
                        <dt className="timetableAttrLabel">
                          <Clock3 aria-hidden="true" />
                          学年
                        </dt>
                        <dd className="timetableAttrValue">
                          {gradeLabel(timetable.grade)}
                        </dd>
                      </div>
                      <div className="timetableAttrItem">
                        <dt className="timetableAttrLabel">
                          <Bookmark aria-hidden="true" />
                          専攻・分野
                        </dt>
                        <dd className="timetableAttrValue">
                          {majorFieldLabel(timetable.major)}
                        </dd>
                      </div>
                      <div className="timetableAttrItem">
                        <dt className="timetableAttrLabel">
                          <SquarePen aria-hidden="true" />
                          春学期取得単位数
                          <CircleHelp
                            className="timetableAttrHelp"
                            aria-label="投稿者の自己申告値です"
                          />
                        </dt>
                        <dd className="timetableAttrValue">
                          {timetable.springCredits}単位
                        </dd>
                      </div>
                      <div className="timetableAttrItem isWide">
                        <dt className="timetableAttrLabel">備考</dt>
                        <dd className="timetableAttrValue">{timetable.note}</dd>
                      </div>
                    </dl>
                  </section>

                  {/* ベースにする（共有）フローは未実装のためプレースホルダーのルート。 */}
                  <Link to="/timetable/share" className="timetableBaseBtn">
                    <Upload aria-hidden="true" />
                    この時間割をベースにする
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TimetableDetail;
