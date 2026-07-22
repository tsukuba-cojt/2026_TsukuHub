import { levelClass, levelFromPercent } from "./graduationProgressLevel";

// 卒業要件チェックのプログレスバー（サマリー・要件項目リスト・詳細画面で共通）。
// スタイルは GraduationCheckResult.css（.gradResultBar 系）を使う。
//
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

export default ProgressBar;
