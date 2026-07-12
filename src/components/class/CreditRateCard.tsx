import { Info } from "lucide-react";
import "../../styles/class/CreditRateCard.css";

// 単位取得率カード（講義詳細ページ右サイドバー）。
// 現状はダミーデータをデフォルト値として表示。実データ接続時は
// props を渡すだけで差し替えられる（件数不足時の非表示条件は後日実装）。

export type GradeDistribution = {
  grade: string; // 例: "A+"
  ratio: number; // 内訳の割合%（棒の高さは最大値に対する相対値で描画）
  colorClass: string; // CreditRateCard.css の色クラス名
};

type CreditRateCardProps = {
  rate?: number; // 単位取得率（%）
  confidenceLabel?: string; // 信頼度（例: 高）
  sampleCount?: number; // 集計件数
  highlightLabel?: string; // 数値横の補足ラベル
  distribution?: GradeDistribution[];
};

// ダミーの成績分布（合計100%になる値）
const defaultDistribution: GradeDistribution[] = [
  { grade: "D", ratio: 9, colorClass: "isCoral" },
  { grade: "C", ratio: 16, colorClass: "isYellow" },
  { grade: "B", ratio: 41, colorClass: "isGreen" },
  { grade: "A", ratio: 28, colorClass: "isBlue" },
  { grade: "A+", ratio: 6, colorClass: "isGradient" },
];

function CreditRateCard({
  rate = 91,
  confidenceLabel = "高",
  sampleCount = 62,
  highlightLabel = "イチオシ授業",
  distribution = defaultDistribution,
}: CreditRateCardProps) {
  return (
    <section className="sidebarCard creditRateCard">
      <div className="creditRateHeader">
        <h2>単位取得率</h2>
        <span className="creditRateConfidence">
          信頼度：{confidenceLabel}（{sampleCount}件）
        </span>
      </div>

      <div className="creditRateScoreRow">
        <strong className="creditRateScore">{rate}%</strong>
        <span className="creditRateHighlight">{highlightLabel}</span>
      </div>

      <div className="creditRateChart" aria-hidden="true">
        {distribution.map((item) => {
          const maxRatio = Math.max(...distribution.map((d) => d.ratio), 1);
          return (
            <div className="creditRateBarCol" key={item.grade}>
              <span className={`creditRateBarLabel ${item.colorClass}`}>
                {item.grade}
              </span>
              <div
                className={`creditRateBar ${item.colorClass}`}
                style={{ height: `${(item.ratio / maxRatio) * 100}%` }}
              >
                {/* ホバー時に内訳の割合を表示するツールチップ */}
                <span className="creditRateBarTooltip">{item.ratio}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="creditRateNote">
        <Info aria-hidden="true" />
        統計はデータ提供に同意した学生の匿名データのみから算出されています。
        10件未満の授業ではスコアは表示されません。
      </p>
    </section>
  );
}

export default CreditRateCard;
