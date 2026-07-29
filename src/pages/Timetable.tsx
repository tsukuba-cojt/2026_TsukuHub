import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import TimetableCard from "../components/class/TimetableCard";
import TimetablePageHeader from "../components/class/TimetablePageHeader";
import {
  EMPTY_FILTERS,
  filterTimetables,
  GAKURUI_OPTIONS,
  getTimetables,
  GRADE_OPTIONS,
  MAJOR_OPTIONS,
  MODULE_OPTIONS,
  type TimetableFilters,
} from "../components/class/timetableData";
// 404ページで使用しているイラストを空状態に再利用。
import searchIllust from "../assets/NotFound/SearchIllust.svg";
import "../styles/class/Class.css";
import "../styles/class/Timetable.css";

function Timetable() {
  const [filters, setFilters] = useState<TimetableFilters>(EMPTY_FILTERS);

  // データ取得と絞り込みは timetableData.ts に分離済み。
  const allTimetables = getTimetables();
  const results = useMemo(
    () => filterTimetables(allTimetables, filters),
    [allTimetables, filters]
  );

  // 学類（必須）が選ばれて初めて検索結果セクションを表示する。
  const showResults = filters.gakurui !== "";

  const updateFilter = (key: keyof TimetableFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <TimetablePageHeader />

        {/* フィルターカード */}
        <div className="timetableFilterCard">
          <div className="timetableFilterRow">
            <div className="timetableField">
              <label className="timetableFieldLabel" htmlFor="tt-gakurui">
                学類を選択
                <span className="timetableRequired">必須</span>
              </label>
              <div className="timetableSelectWrap">
                <select
                  id="tt-gakurui"
                  className={`timetableSelect${
                    filters.gakurui === "" ? " isPlaceholder" : ""
                  }`}
                  value={filters.gakurui}
                  onChange={(e) => updateFilter("gakurui", e.target.value)}
                >
                  <option value="">-- 選択する --</option>
                  {GAKURUI_OPTIONS.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
            </div>

            <div className="timetableField">
              <label className="timetableFieldLabel" htmlFor="tt-grade">
                学年を選択
              </label>
              <div className="timetableSelectWrap">
                <select
                  id="tt-grade"
                  className={`timetableSelect${
                    filters.grade === "" ? " isPlaceholder" : ""
                  }`}
                  value={filters.grade}
                  onChange={(e) => updateFilter("grade", e.target.value)}
                >
                  <option value="">-- 選択する --</option>
                  {GRADE_OPTIONS.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
            </div>

            <div className="timetableField">
              <label className="timetableFieldLabel" htmlFor="tt-module">
                モジュールを選択
              </label>
              <div className="timetableSelectWrap">
                <select
                  id="tt-module"
                  className={`timetableSelect${
                    filters.module === "" ? " isPlaceholder" : ""
                  }`}
                  value={filters.module}
                  onChange={(e) => updateFilter("module", e.target.value)}
                >
                  <option value="">-- 選択する --</option>
                  {MODULE_OPTIONS.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
            </div>

            <div className="timetableField">
              <label className="timetableFieldLabel" htmlFor="tt-major">
                専攻を選択
              </label>
              <div className="timetableSelectWrap">
                <select
                  id="tt-major"
                  className={`timetableSelect${
                    filters.major === "" ? " isPlaceholder" : ""
                  }`}
                  value={filters.major}
                  onChange={(e) => updateFilter("major", e.target.value)}
                >
                  <option value="">-- 選択する --</option>
                  {MAJOR_OPTIONS.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon />
              </div>
            </div>

            <button
              type="button"
              className="timetableResetLink"
              onClick={resetFilters}
            >
              リセット
            </button>
          </div>

          {/* 学類選択後のみ検索結果セクションを表示 */}
          {showResults && (
            <div className="timetableResults">
              <p className="timetableResultCount">
                <Search aria-hidden="true" />
                {results.length}件の時間割が見つかりました
              </p>

              {results.length > 0 ? (
                <div className="timetableCarousel">
                  <div className="timetableCarouselTrack">
                    {results.map((timetable) => (
                      <TimetableCard timetable={timetable} key={timetable.id} />
                    ))}
                  </div>
                  {/* 「次へ」を示すシェブロン（カルーセルの続きがあることの視覚的な合図） */}
                  <span className="timetableCarouselNext" aria-hidden="true">
                    <ChevronRight />
                  </span>
                </div>
              ) : (
                <EmptyState
                  onExpandGrade={() => updateFilter("grade", "")}
                  onExpandMajor={() => updateFilter("major", "")}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// フィルターのプルダウン右端に置くシェブロン（アイコンのみの共通パーツ）。
function ChevronDownIcon() {
  return (
    <svg
      className="timetableSelectChevron"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type EmptyStateProps = {
  onExpandGrade: () => void;
  onExpandMajor: () => void;
};

// 検索結果0件のときの空状態カード。
function EmptyState({ onExpandGrade, onExpandMajor }: EmptyStateProps) {
  return (
    <div className="timetableEmpty">
      <img
        src={searchIllust}
        alt=""
        className="timetableEmptyIllust"
        aria-hidden="true"
      />
      <div className="timetableEmptyBody">
        <h2 className="timetableEmptyTitle">
          条件に合う時間割が見つかりませんでした
        </h2>
        <p className="timetableEmptyLead">
          フィルタを広げると、意外な先輩の時間割が見つかるかもしれません
        </p>
        <p className="timetableEmptyHint">おすすめの緩和案</p>
        <div className="timetableEmptyActions">
          <button
            type="button"
            className="timetablePill"
            onClick={onExpandGrade}
          >
            学年を「すべて」にする
          </button>
          <button
            type="button"
            className="timetablePill"
            onClick={onExpandMajor}
          >
            専攻を「すべて」にする
          </button>
        </div>
      </div>
    </div>
  );
}

export default Timetable;
