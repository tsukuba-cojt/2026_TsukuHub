import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  FileUp,
  Search,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import {
  TimetableAttributeCard,
  TimetableDetailView,
  TimetableHistoryCard,
  TimetableLegend,
} from "../components/class/TimetableDisplay";
import {
  fetchPublicTimetableHistories,
  filterTimetableHistories,
} from "../services/timetableService";
import type {
  TimetableFilters,
  TimetableHistory,
  TimetableModuleKey,
} from "../types/timetable";
import {
  timetableModuleLabels,
  timetableModuleOrder,
} from "../types/timetable";
import "../styles/class/Timetable.css";
import { useUniversity } from "../components/university/universityContextValue";

const initialFilters: TimetableFilters = {
  department: "",
  studentYear: "",
  module: "all",
  major: "",
};

const firstVisibleModule = (
  history: TimetableHistory,
  selected: TimetableFilters["module"]
): TimetableModuleKey => {
  if (selected !== "all") return selected;
  return (
    timetableModuleOrder.find((module) =>
      history.courses.some((course) => course.modules.includes(module))
    ) ?? "springA"
  );
};

const uniqueOptions = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));

function TimetableSelect({
  id,
  label,
  required,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="timetableFilterField" htmlFor={id}>
      <span>
        {label}
        {required && <small>必須</small>}
      </span>
      <div className="timetableSelectWrap">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {children}
        </select>
        <ChevronDown aria-hidden="true" />
      </div>
    </label>
  );
}

function TimetableEmptyState({ onRelax }: { onRelax: () => void }) {
  return (
    <section className="timetableEmptyState">
      <div className="timetableEmptyIllustration" aria-hidden="true">
        <span className="bubbleOne" />
        <span className="bubbleTwo">?</span>
        <span className="lens" />
        <span className="campusBase" />
      </div>
      <div>
        <h2>条件に合う時間割が見つかりませんでした</h2>
        <p>フィルタを広げると、意外な先輩の時間割が見つかるかもしれません</p>
        <h3>おすすめの緩和案</h3>
        <div className="timetableEmptyActions">
          <button type="button" onClick={onRelax}>
            学年を「すべて」にする
          </button>
          <button type="button" onClick={onRelax}>
            専攻を「すべて」にする
          </button>
        </div>
      </div>
    </section>
  );
}

function Timetable() {
  const { university, path } = useUniversity();
  const [histories, setHistories] = useState<TimetableHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TimetableFilters>(initialFilters);
  const [selected, setSelected] = useState<TimetableHistory | null>(null);
  const [activeModule, setActiveModule] = useState<TimetableModuleKey>("springA");

  useEffect(() => {
    let cancelled = false;
    if (!university) return;
    fetchPublicTimetableHistories(university.id)
      .then((items) => {
        if (!cancelled) {
          setError(null);
          setHistories(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHistories([]);
          setError("時間割データの取得に失敗しました。DBマイグレーション適用後に再度お試しください。");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [university]);

  const filtered = useMemo(
    () => filterTimetableHistories(histories, filters),
    [histories, filters]
  );

  const options = useMemo(
    () => ({
      departments: uniqueOptions(histories.map((history) => history.department)),
      studentYears: uniqueOptions(histories.map((history) => history.studentYearLabel)),
      majors: uniqueOptions(histories.map((history) => history.major)),
    }),
    [histories]
  );

  const updateFilters = (next: Partial<TimetableFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setSelected(null);
  };

  const resetSoft = () => {
    setFilters((current) => ({ ...current, studentYear: "", major: "" }));
  };

  const openHistory = (history: TimetableHistory) => {
    const moduleKey = firstVisibleModule(history, filters.module);
    setSelected(history);
    setActiveModule(moduleKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="timetablePage">
      <Globalnav />
      <main className="timetablePageLayout">
        <p className="timetableBreadcrumb">
          <Link to={path()}>ホーム</Link> &gt;{" "}
          <Link to={path("/class/top")}>授業・履修</Link> &gt;{" "}
          {selected ? "時間割詳細" : "みんなの時間割"}
        </p>

        <div className="timetableHero">
          <div>
            <h1>
              <CalendarDays aria-hidden="true" />
              みんなの時間割
              <span>β版</span>
            </h1>
            <p>みんなの時間割を参考に、あなたの履修計画を立てよう</p>
          </div>
          <Link to={path("/graduation-checker")} className="timetableShareBtn">
            <FileUp aria-hidden="true" />
            自分の時間割を共有する
          </Link>
        </div>

        {!selected ? (
          <section className="timetablePanel">
            <div className="timetableFilterGrid">
              <TimetableSelect
                id="timetable-department"
                label="学類を選択"
                required
                value={filters.department}
                onChange={(value) => updateFilters({ department: value })}
              >
                <option value="">-- 選択する --</option>
                {options.departments.map((department) => (
                  <option value={department} key={department}>{department}</option>
                ))}
              </TimetableSelect>
              <TimetableSelect
                id="timetable-year"
                label="学年を選択"
                value={filters.studentYear}
                onChange={(value) => updateFilters({ studentYear: value })}
              >
                <option value="">-- 選択する --</option>
                {options.studentYears.map((year) => (
                  <option value={year} key={year}>{year}</option>
                ))}
              </TimetableSelect>
              <TimetableSelect
                id="timetable-module"
                label="モジュールを選択"
                value={filters.module}
                onChange={(value) =>
                  updateFilters({ module: value as TimetableFilters["module"] })
                }
              >
                <option value="all">-- 選択する --</option>
                {timetableModuleOrder.map((module) => (
                  <option value={module} key={module}>
                    {timetableModuleLabels[module]}
                  </option>
                ))}
              </TimetableSelect>
              <TimetableSelect
                id="timetable-major"
                label="専攻を選択"
                value={filters.major}
                onChange={(value) => updateFilters({ major: value })}
              >
                <option value="">-- 選択する --</option>
                {options.majors.map((major) => (
                  <option value={major} key={major}>{major}</option>
                ))}
              </TimetableSelect>
              <button
                type="button"
                className="timetableResetBtn"
                onClick={() => setFilters(initialFilters)}
              >
                リセット
              </button>
            </div>

            <p className="timetableCount">
              <Search aria-hidden="true" />
              {loading ? "時間割を探しています" : `${filtered.length}件の時間割が見つかりました`}
            </p>
            {error && <p className="timetableError">{error}</p>}

            {!loading && filtered.length === 0 ? (
              <TimetableEmptyState onRelax={resetSoft} />
            ) : (
              <div className="timetableResultsScroller">
                {filtered.map((history) => {
                  const moduleKey = firstVisibleModule(history, filters.module);
                  return (
                    <TimetableHistoryCard
                      history={history}
                      moduleKey={moduleKey}
                      onOpen={() => openHistory(history)}
                      key={history.id}
                    />
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section className="timetablePanel timetableDetailPanel">
            <button
              type="button"
              className="timetableBackBtn"
              onClick={() => setSelected(null)}
            >
              <ChevronLeft aria-hidden="true" />
              みんなの時間割に戻る
            </button>
            <div className="timetableDetailHeading">
              <div>
                <h2>{selected.displayName}</h2>
                <p>
                  {selected.admissionYear}年度入学・{selected.academicYear}年度履修・{selected.trackLabel}
                </p>
              </div>
            </div>
            <div className="timetableModuleTabs" role="tablist">
              {timetableModuleOrder.map((module) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeModule === module}
                  className={activeModule === module ? "isActive" : ""}
                  onClick={() => setActiveModule(module)}
                  key={module}
                >
                  {timetableModuleLabels[module]}
                </button>
              ))}
            </div>
            <div className="timetableDetailLayout">
              <div>
                <TimetableDetailView history={selected} activeModule={activeModule} />
              </div>
              <aside>
                <TimetableAttributeCard history={selected} />
                <button
                  type="button"
                  className="timetableBaseBtn"
                  onClick={() => window.alert("すいません、時間割作成機能はまだ準備中です。")}
                >
                  <FileUp aria-hidden="true" />
                  この時間割をベースにする
                </button>
              </aside>
            </div>
            <TimetableLegend />
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Timetable;
