import React from "react";
import "../../styles/class/ClassSearchPanel.css";
import "rc-slider/assets/index.css";
import Slider from "rc-slider";
import bookIcon from "../../assets/home/CategoryCard/Book.svg";
import { getTermUi } from "../../features/timetable/termUi";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <path d="M4 17h2" />
      <path d="M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}

type Filters = {
  text: string;
  code: string;
  moduleRangeStart: number;
  moduleRangeEnd: number;
  classType: "normal" | "intensive" | "consultation" | "anytime" | "nt";
  schedule: string;
  scheduleDay: string;
  schedulePeriod: string;
};

type Props = {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
  universitySlug?: string | null;
};

const SCHEDULE_SELECTION_MODE: "split" | "combined" = "split";
const DAY_OPTIONS = [
  { label: "すべて", value: "all" },
  { label: "月", value: "mon" },
  { label: "火", value: "tue" },
  { label: "水", value: "wed" },
  { label: "木", value: "thu" },
  { label: "金", value: "fri" },
];
const CLASS_TYPE_OPTIONS = [
  { label: "通常", value: "normal" },
  { label: "集中", value: "intensive" },
  { label: "相談", value: "consultation" },
  { label: "オンデマンド", value: "anytime" },
  { label: "その他", value: "nt" },
];

export default function ClassSearchPanel({
  filters,
  onChange,
  universitySlug,
}: Props) {
  const termUi = getTermUi(universitySlug);
  const handleReset = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    onChange({
      text: "",
      code: "",
      moduleRangeStart: 1,
      moduleRangeEnd: termUi.classModuleMax,
      classType: "normal",
      schedule: "all",
      scheduleDay: "all",
      schedulePeriod: "all",
    });
  };

  return (
    <section className="classSearchPanel">
      <div className="classSearchHeading">
        <img src={bookIcon} alt="" className="classSearchHeadingIcon" />
        <div>
          <h1>授業検索</h1>
          <p>条件で授業を絞り込みます</p>
        </div>
      </div>

      <form className="classSearchForm" onReset={handleReset}>
        <label className="classField classFieldText">
          <span>授業名</span>
          <div className="classInputShell">
            <input
              placeholder="検索ワード"
              value={filters.text}
              onChange={(e) => onChange({ text: e.target.value })}
            />
            <SearchIcon />
          </div>
        </label>

        <label className="classField classFieldCode">
          <span>授業コード</span>
            <input
              placeholder="XXXXXXXX"
              value={filters.code}
              onChange={(e) => onChange({ code: e.target.value })}
            />
        </label>

        {SCHEDULE_SELECTION_MODE === "split" ? (
          <>
            <label className="classField classFieldScheduleDay">
              <span>曜日</span>
              <select value={filters.scheduleDay} onChange={(e) => onChange({ scheduleDay: e.target.value, schedulePeriod: "all" })}>
                {DAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {filters.scheduleDay !== "all" && (
              <label className="classField classFieldSchedulePeriod">
                <span>時限</span>
                <select value={filters.schedulePeriod} onChange={(e) => onChange({ schedulePeriod: e.target.value })}>
                  <option value="all">すべて</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                    <option key={period} value={String(period)}>
                      {period}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        ) : (
          <label className="classField classFieldScheduleCombined">
            <span>曜日時限</span>
            <select value={filters.schedule} onChange={(e) => onChange({ schedule: e.target.value })}>
              <option value="all">すべて</option>
              {DAY_OPTIONS.slice(1).flatMap((day) =>
                [1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                  <option key={`${day.value}-${period}`} value={`${day.value}-${period}`}>
                    {day.label}
                    {period}
                  </option>
                ))
              )}
            </select>
          </label>
        )}

        <label className="classField classFieldClassType">
          <span>授業の種類</span>
          <select value={filters.classType} onChange={(e) => onChange({ classType: e.target.value as Filters["classType"] })}>
            {CLASS_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {filters.classType === "normal" && (
          <label className="classField classFieldModule">
            <span>{termUi.classModuleFieldLabel}</span>
            <div className="classModuleRangeSlider">
              <Slider
                range
                min={1}
                max={termUi.classModuleMax}
                step={1}
                allowCross={false}
                dots={false}
                value={[
                  Math.min(filters.moduleRangeStart, termUi.classModuleMax),
                  Math.min(filters.moduleRangeEnd, termUi.classModuleMax),
                ]}
                marks={termUi.classModuleMarks}
                onChange={(value) => {
                  const [start, end] = value as number[];
                  onChange({ moduleRangeStart: start, moduleRangeEnd: end });
                }}
                styles={{
                  rail: { backgroundColor: "#dce5f4", height: 6 },
                  track: { backgroundColor: "var(--color-primary)", height: 6 },
                  handle: {
                    borderColor: "var(--color-primary)",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 12px rgba(0, 81, 224, 0.24)",
                    width: 18,
                    height: 18,
                    marginTop: -6,
                    zIndex: 10,
                  },
                }}
              />
            </div>
          </label>
        )}

        <button className="classClearButton" type="reset">
          <SlidersIcon />
          フィルターをクリア
        </button>
      </form>
    </section>
  );
}
