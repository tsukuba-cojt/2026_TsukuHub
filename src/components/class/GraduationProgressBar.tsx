import {
  levelClass,
  levelFromPercent,
  type ProgressLevel,
} from "./graduationProgressLevel";

// 卒業要件チェックのプログレスバー（サマリー・要件項目リスト・詳細画面で共通）。
// スタイルは GraduationCheckResult.css（.gradResultBar 系）を使う。
//
// バーの塗りは100%で頭打ち。%の数字表示は超過した実値のまま呼び出し側で出す。
// tone="auto" は達成率による色分け、"blue"/"purple" はサマリー用の固定色。
function ProgressBar({
  percent = 0,
  prospectivePercent,
  tone = "auto",
  level,
  markerPercent,
}: {
  percent?: number;
  /** 履修中を含む合計割合。取得済み部分の先を薄い色で表示する。 */
  prospectivePercent?: number;
  tone?: "auto" | "blue" | "purple";
  /** 個別要件を含む判定など、割合だけでは決まらない表示レベル */
  level?: ProgressLevel;
  markerPercent?: number;
}) {
  const fillClass =
    tone === "auto"
      ? levelClass[level ?? levelFromPercent(percent)]
      : tone === "blue"
        ? "isBlue"
        : "isPurple";
  return (
    <div className="gradResultBar">
      {prospectivePercent !== undefined && (
        <div
          className={`gradResultBarFill gradResultBarProspective ${fillClass}`}
          style={{ width: `${Math.max(0, Math.min(prospectivePercent, 100))}%` }}
        />
      )}
      <div
        className={`gradResultBarFill ${fillClass}`}
        style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
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

export default ProgressBar;
