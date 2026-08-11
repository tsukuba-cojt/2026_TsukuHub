import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronRight,
  GraduationCap,
  RefreshCw,
  Star,
  TriangleAlert,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import Toast from "../components/utility/Toast";
import GraduationCheckDetailView from "../components/class/GraduationCheckDetailView";
import {
  TimetableAttributeCard,
  TimetableDetailView,
  TimetableHistoryCard,
  TimetableLegend,
} from "../components/class/TimetableDisplay";
import ProgressBar from "../components/class/GraduationProgressBar";
import {
  formatPercent,
  levelClass,
  levelFromPercent,
} from "../components/class/graduationProgressLevel";
import type {
  CategoryKey,
  CategoryResult,
  CsvRowError,
  GraduationCheckReport,
} from "../features/graduationCheck";
import type { TimetableHistory, TimetableModuleKey } from "../types/timetable";
import { timetableModuleLabels, timetableModuleOrder } from "../types/timetable";
import "../styles/class/GraduationCheck.css";
import "../styles/class/GraduationCheckResult.css";

// アップロードページから遷移時に受け取るデータ（永続化しない）
type GraduationCheckResultState = {
  fileName: string;
  department?: string;
  major: string;
  admissionYear: string;
  agreedStats: boolean;
  /** CSVの行単位パースエラー（0件でない場合は警告トーストを出す） */
  csvErrors: CsvRowError[];
  /** アップロードページで判定済みの結果（features/graduationCheck） */
  report: GraduationCheckReport;
  timetableHistories?: TimetableHistory[];
  timetableSaveStatus?: "saved" | "guest" | "failed";
} | null;

// サマリーカード（取得済み単位 / 不足単位 / GPA）
function SummaryCard({
  tone,
  icon,
  label,
  value,
  valueSub,
  meta,
}: {
  tone: "blue" | "pink" | "purple";
  icon: ReactNode;
  label: string;
  value: string;
  valueSub: string;
  meta?: {
    label: string;
    percent: number;
    barTone: "blue" | "purple";
    markerPercent?: number;
  };
}) {
  const toneClass = { blue: "isBlue", pink: "isPink", purple: "isPurple" }[tone];
  return (
    <section className={`gradResultSummaryCard ${toneClass}`}>
      <div className="gradResultSummaryTop">
        <span className="gradResultSummaryIcon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <p className="gradResultSummaryLabel">{label}</p>
          <p className="gradResultSummaryValueRow">
            <span className="gradResultSummaryValue gradResultNumFont">
              {value}
            </span>
            <span className="gradResultSummaryValueSub">{valueSub}</span>
          </p>
        </div>
      </div>
      {meta && (
        <div className="gradResultSummaryMeta">
          <p className="gradResultSummaryMetaRow">
            <span className="gradResultSummaryMetaLabel">{meta.label}</span>
            <span className="gradResultSummaryMetaValue">
              <span className="gradResultNumFont">
                {formatPercent(meta.percent)}
              </span>{" "}
              %
            </span>
          </p>
          <ProgressBar
            percent={meta.percent}
            tone={meta.barTone}
            markerPercent={meta.markerPercent}
          />
        </div>
      )}
    </section>
  );
}

// 要件項目リストの1行。
// 単位数と%は未クランプの実値を出し（100%超あり）、バーの塗りのみ100%で頭打ち。
// 行（またはシェブロン）を押すとその区分の詳細画面へ移動する。
function RequirementRow({
  item,
  onOpenDetail,
}: {
  item: CategoryResult;
  onOpenDetail: (category: CategoryKey) => void;
}) {
  const level = levelFromPercent(item.percent);
  return (
    <li
      className={`gradResultReqRow ${levelClass[level]}`}
      onClick={() => onOpenDetail(item.category)}
    >
      <div className="gradResultReqName">
        <span
          className={`gradResultReqBadge ${levelClass[level]}`}
          aria-hidden="true"
        >
          {level === "ok" ? <Check /> : "！"}
        </span>
        {item.label}
      </div>
      <p className="gradResultReqUnits">
        <span className="gradResultReqEarned gradResultNumFont">
          {item.earnedUnits}
        </span>
        <span className="gradResultReqUnitsSub">/ {item.requiredUnits} 単位</span>
      </p>
      <div className="gradResultReqBarCell">
        <ProgressBar percent={item.percent} />
      </div>
      <p className="gradResultReqPct">
        <span className="gradResultNumFont">{formatPercent(item.percent)}</span>{" "}
        %
      </p>
      <button
        type="button"
        className="gradResultReqChevronBtn"
        aria-label={`${item.label}の詳細を見る`}
        onClick={(e) => {
          // 親（行）の onClick と二重に発火させない
          e.stopPropagation();
          onOpenDetail(item.category);
        }}
      >
        <ChevronRight className="gradResultReqChevron" aria-hidden="true" />
      </button>
    </li>
  );
}

// 卒業要件チェック 結果ページ（/graduation-checker/result）
//
// 結果データは意図的に揮発扱いにしている：
// 遷移時の history state をマウント時にメモリへ退避して即座に消去するため、
// リロードやブラウザバックで再訪しても結果は残らない（永続化しない仕様）。
function GraduationCheckResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result] = useState<GraduationCheckResultState>(
    () => location.state as GraduationCheckResultState
  );
  // 詳細画面は同一ページ内のビュー切替にする。
  // 別ルートへ遷移すると、下の useEffect で history state を消しているぶん
  // 判定結果を引き継げず破棄されてしまうため。
  const [view, setView] = useState<"summary" | "detail" | "timetable">("summary");
  const [focusCategory, setFocusCategory] = useState<CategoryKey | null>(null);
  const [selectedTimetable, setSelectedTimetable] = useState<TimetableHistory | null>(null);
  const [activeTimetableModule, setActiveTimetableModule] = useState<TimetableModuleKey>("springA");
  // CSVに読めない行があった場合の警告（閉じるまで表示し続ける）
  const [isCsvWarningOpen, setIsCsvWarningOpen] = useState(
    () => (result?.csvErrors?.length ?? 0) > 0
  );

  useEffect(() => {
    if (location.state !== null) {
      navigate("/graduation-checker/result", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  // サマリーカード・要件項目リスト・詳細画面とも同一の判定結果（report）を参照する
  const report = result?.report ?? null;

  const openDetail = (category: CategoryKey) => {
    setFocusCategory(category);
    setView("detail");
  };

  const backToSummary = () => {
    setView("summary");
    setSelectedTimetable(null);
    window.scrollTo({ top: 0 });
  };

  const openTimetable = (history: TimetableHistory) => {
    const module =
      timetableModuleOrder.find((item) =>
        history.courses.some((course) => course.modules.includes(item))
      ) ?? "springA";
    setSelectedTimetable(history);
    setActiveTimetableModule(module);
    setView("timetable");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="gradCheckPage">
      <Globalnav />
      <main className="gradCheckPageLayout">
        <p className="gradCheckBreadcrumb">
          <Link to="/" className="gradCheckBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt;{" "}
          <Link to="/class/top" className="gradCheckBreadcrumbLink">
            授業・履修
          </Link>{" "}
          &gt; 卒業要件チェック
        </p>

        {/* 見出しエリア（アップロードページと共通） */}
        <div className="gradCheckHeading">
          <h1 className="gradCheckTitle">
            <GraduationCap aria-hidden="true" />
            卒業要件チェック
            <span className="gradCheckBetaBadge">β版</span>
          </h1>
          <p className="gradCheckLead">
            TWINSの成績csvをアップロードすると、卒業要件の充足状況を確認できます
          </p>
        </div>

        {report && view === "detail" ? (
          <div className="gradCheckCard">
            <GraduationCheckDetailView
              report={report}
              focusCategory={focusCategory}
              onBack={backToSummary}
            />
          </div>
        ) : report && view === "timetable" && selectedTimetable ? (
          <div className="gradCheckCard timetableDetailPanel">
            <button
              type="button"
              className="timetableBackBtn"
              onClick={backToSummary}
            >
              チェック結果に戻る
            </button>
            <div className="timetableDetailHeading">
              <div>
                <h2>{selectedTimetable.displayName}</h2>
                <p>
                  {selectedTimetable.admissionYear}年度入学・{selectedTimetable.academicYear}年度履修・{selectedTimetable.trackLabel}
                </p>
              </div>
            </div>
            <div className="timetableModuleTabs" role="tablist">
              {timetableModuleOrder.map((module) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTimetableModule === module}
                  className={activeTimetableModule === module ? "isActive" : ""}
                  onClick={() => setActiveTimetableModule(module)}
                  key={module}
                >
                  {timetableModuleLabels[module]}
                </button>
              ))}
            </div>
            <div className="timetableDetailLayout">
              <div>
                <TimetableDetailView
                  history={selectedTimetable}
                  activeModule={activeTimetableModule}
                />
              </div>
              <aside>
                <TimetableAttributeCard history={selectedTimetable} />
              </aside>
            </div>
            <TimetableLegend />
          </div>
        ) : report ? (
          <div className="gradCheckCard">
            {/* 見出し行＋CSV再アップロード */}
            <div className="gradResultCardHeader">
              <div className="gradCheckStepHeader gradResultStepHeader">
                <span className="gradCheckStepNumber" aria-hidden="true">
                  3
                </span>
                <h2 className="gradCheckStepTitle">卒業要件チェック結果</h2>
              </div>
              <Link to="/graduation-checker" className="gradResultReuploadBtn">
                <RefreshCw aria-hidden="true" />
                CSV を再アップロード
              </Link>
            </div>

            {/* サマリーカード（3枚） */}
            <div className="gradResultSummaryGrid">
              <SummaryCard
                tone="blue"
                icon={<GraduationCap />}
                label="取得済み単位"
                value={String(report.summary.earnedUnits)}
                valueSub={`/ ${report.summary.requiredUnits} 単位`}
                meta={{
                  label: "進捗率",
                  percent: report.summary.percent,
                  barTone: "blue",
                }}
              />
              <SummaryCard
                tone="pink"
                icon={<TriangleAlert />}
                label="不足単位"
                value={String(report.summary.shortageUnits)}
                valueSub="単位"
              />
              <SummaryCard
                tone="purple"
                icon={<Star fill="currentColor" />}
                label="GPA"
                value={report.gpa.value === null ? "-" : report.gpa.value.toFixed(2)}
                valueSub={`/ ${report.gpa.max.toFixed(2)}`}
                meta={
                  report.gpa.aRatePercent === null
                    ? undefined
                    : {
                        label: "取得単位中 A以上の割合",
                        percent: report.gpa.aRatePercent,
                        barTone: "purple",
                      }
                }
              />
            </div>

            {/* 要件項目リスト */}
            <section>
              <div className="gradResultReqHead">
                <span>要件項目</span>
                <span className="gradResultReqHeadStatus">履修状況</span>
                <span className="gradResultReqHeadDetail">詳細</span>
              </div>
              <ul className="gradResultReqList">
                {report.categories.map((item) => (
                  <RequirementRow
                    item={item}
                    onOpenDetail={openDetail}
                    key={item.category}
                  />
                ))}
              </ul>
              <div className="gradResultNotes">
                <p>
                  現在は2021〜2024年度入学の情報学群メディア創成学類、知識情報図書館学類の卒業要件のみに対応しています
                </p>
                <p>
                  卒業要件は、
                  <a
                    className="gradResultNotesLink"
                    href="https://www.tsukuba.ac.jp/education/ug-courses-directory/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    学群等履修細則
                  </a>
                  に基づいています
                </p>
                <p>
                  ツールの使用によって生じた不利益等について、開発側は一切の責任を負いません
                </p>
              </div>
            </section>

            {(result?.timetableHistories?.length ?? 0) > 0 && (
              <section className="gradResultTimetableSection">
                <div className="gradResultReqHead">
                  <span>過去の時間割</span>
                  <span className="gradResultReqHeadStatus">
                    {result?.timetableSaveStatus === "saved"
                      ? "本人履歴として保存済み"
                      : result?.timetableSaveStatus === "failed"
                        ? "保存に失敗しました（画面内表示のみ）"
                        : "未ログインのため画面内表示のみ"}
                  </span>
                </div>
                <div className="timetableResultsScroller">
                  {result?.timetableHistories?.map((history) => {
                    const module =
                      timetableModuleOrder.find((item) =>
                        history.courses.some((course) => course.modules.includes(item))
                      ) ?? "springA";
                    return (
                      <TimetableHistoryCard
                        history={history}
                        moduleKey={module}
                        onOpen={() => openTimetable(history)}
                        key={history.id}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* 見込みメッセージバー */}
            <div className="gradResultForecast">
              <div>
                <p className="gradResultForecastTitle">
                  このまま計画的に学習を進めると、卒業要件を満たせる見込みです！
                </p>
                <p className="gradResultForecastSub">
                  不足単位を計画的に取得できるよう、履修提案を活用してみませんか？
                </p>
              </div>
              {/* TODO: 履修プラン機能の実装後に遷移先を設定する（現状はダミー） */}
              <button type="button" className="gradResultPlanBtn">
                <span className="gradResultPlanBtnLabel">
                  履修プランを確認する
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            </div>

            {/* フッターアクション */}
            <div>
              <div className="gradResultActions">
                <Link to="/class/top" className="gradResultBackOutlineBtn">
                  履修トップページへ戻る
                </Link>
                <Link to="/" className="gradResultBackPrimaryBtn">
                  トップページへ戻る
                </Link>
              </div>
              <p className="gradResultLeaveNote">
                未ログインの場合、ページを離れると時間割表示は破棄されます
              </p>
            </div>
          </div>
        ) : (
          <div className="gradCheckResultCard">
            <h1 className="gradCheckResultTitle">チェック結果がありません</h1>
            <p className="gradCheckResultBody">
              結果は保存されないため、ページの再読み込みや戻る操作では表示できません。
              <br />
              もう一度CSVをアップロードしてチェックを実行してください。
            </p>
            <Link to="/graduation-checker" className="gradCheckResultBackLink">
              アップロードページへ戻る
            </Link>
          </div>
        )}
      </main>
      <Footer />
      {isCsvWarningOpen && (
        <Toast
          message="CSVエラーのため一部不正確な場合があります"
          variant="warning"
          dismissible
          onClose={() => setIsCsvWarningOpen(false)}
        />
      )}
    </div>
  );
}

export default GraduationCheckResult;
