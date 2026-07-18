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
import "../styles/class/GraduationCheck.css";
import "../styles/class/GraduationCheckResult.css";

// アップロードページから遷移時に受け取るデータ（永続化しない）
type GraduationCheckResultState = {
  fileName: string;
  major: string;
  admissionYear: string;
  agreedStats: boolean;
} | null;

// ── 表示データの型（実データ連携時はここへ判定結果を流し込む） ──
export type GraduationCheckSummary = {
  earnedCredits: number;
  requiredCredits: number;
  gpa: number;
  gpaMax: number;
  /** 取得単位中 A以上の割合（%） */
  aRatePercent: number;
  /** GPAバーに重ねる目安マーカーの位置（%） */
  aRateMarkerPercent: number;
};

export type RequirementItem = {
  name: string;
  earned: number;
  required: number;
};

// ダミーデータ（デザイン実装用）。CSVパース・判定ロジックはスコープ外のため、
// 実データ連携時はこの2つを判定結果で差し替える。
// 注：デザイン画像の単位数・%表記は色分けルール（100%以上=緑）と矛盾するため、
// 緑にする行は取得=必要のダミー値にしている（色分けロジックが正となる）。
const dummySummary: GraduationCheckSummary = {
  earnedCredits: 78,
  requiredCredits: 124,
  gpa: 2.85,
  gpaMax: 4.3,
  aRatePercent: 62,
  aRateMarkerPercent: 70,
};

const dummyRequirements: RequirementItem[] = [
  { name: "必修科目", earned: 40, required: 40 },
  { name: "選択科目（専門）", earned: 24, required: 38 },
  { name: "選択科目（専門基礎）", earned: 12, required: 38 },
  { name: "選択科目（共通）", earned: 36, required: 36 },
  { name: "選択科目（関連）", earned: 36, required: 36 },
];

// ── 達成率の色分け（サマリー・要件リスト共通仕様） ──
// 100%以上=緑 / 51〜99%=黄 / 0〜50%=ピンク
type ProgressLevel = "ok" | "warn" | "low";

const levelFromPercent = (percent: number): ProgressLevel =>
  percent >= 100 ? "ok" : percent > 50 ? "warn" : "low";

const levelClass: Record<ProgressLevel, string> = {
  ok: "isOk",
  warn: "isWarn",
  low: "isLow",
};

// %表示用：小数1桁に丸め、整数なら小数点以下を省く（例：62.9 / 100）
const formatPercent = (percent: number): string => {
  const rounded = Math.round(percent * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

// プログレスバー（サマリー・要件リスト共通）
// バーの塗りは100%で頭打ち。%の数字表示は超過した実値のまま呼び出し側で出す。
// tone="auto" は達成率による色分け、"blue"/"purple" はサマリー用の固定色。
function ProgressBar({
  percent = 0,
  tone = "auto",
  markerPercent,
}: {
  percent?: number;
  tone?: "auto" | "blue" | "purple";
  markerPercent?: number;
}) {
  const fillClass =
    tone === "auto"
      ? levelClass[levelFromPercent(percent)]
      : tone === "blue"
        ? "isBlue"
        : "isPurple";
  return (
    <div className="gradResultBar">
      <div
        className={`gradResultBarFill ${fillClass}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
      {markerPercent !== undefined && (
        <span
          className="gradResultBarMarker"
          style={{ left: `${Math.min(markerPercent, 100)}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

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

// 要件項目リストの1行
function RequirementRow({ item }: { item: RequirementItem }) {
  const percent = item.required > 0 ? (item.earned / item.required) * 100 : 0;
  const level = levelFromPercent(percent);
  const LevelIcon = level === "ok" ? Check : TriangleAlert;
  return (
    <li className={`gradResultReqRow ${levelClass[level]}`}>
      <div className="gradResultReqName">
        <span
          className={`gradResultReqBadge ${levelClass[level]}`}
          aria-hidden="true"
        >
          <LevelIcon />
        </span>
        {item.name}
      </div>
      <p className="gradResultReqUnits">
        <span className="gradResultReqEarned gradResultNumFont">
          {item.earned}
        </span>
        <span className="gradResultReqUnitsSub">/ {item.required} 単位</span>
      </p>
      <div className="gradResultReqBarCell">
        <ProgressBar percent={percent} />
      </div>
      <p className="gradResultReqPct">
        <span className="gradResultNumFont">{formatPercent(percent)}</span> %
      </p>
      <ChevronRight className="gradResultReqChevron" aria-hidden="true" />
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

  useEffect(() => {
    if (location.state !== null) {
      navigate("/graduation-checker/result", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  // ダミー値をそのまま表示（実データ連携時に差し替え）
  const summary = dummySummary;
  const requirements = dummyRequirements;
  const progressPercent =
    summary.requiredCredits > 0
      ? (summary.earnedCredits / summary.requiredCredits) * 100
      : 0;
  const shortageCredits = Math.max(
    summary.requiredCredits - summary.earnedCredits,
    0
  );

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

        {result ? (
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
                value={String(summary.earnedCredits)}
                valueSub={`/ ${summary.requiredCredits} 単位`}
                meta={{
                  label: "進捗率",
                  percent: progressPercent,
                  barTone: "blue",
                }}
              />
              <SummaryCard
                tone="pink"
                icon={<TriangleAlert />}
                label="不足単位"
                value={String(shortageCredits)}
                valueSub="単位"
              />
              <SummaryCard
                tone="purple"
                icon={<Star fill="currentColor" />}
                label="GPA"
                value={summary.gpa.toFixed(2)}
                valueSub={`/ ${summary.gpaMax.toFixed(2)}`}
                meta={{
                  label: "取得単位中 A以上の割合",
                  percent: summary.aRatePercent,
                  barTone: "purple",
                  markerPercent: summary.aRateMarkerPercent,
                }}
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
                {requirements.map((item) => (
                  <RequirementRow item={item} key={item.name} />
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
                ページを離れると内容は破棄されます
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
    </div>
  );
}

export default GraduationCheckResult;
