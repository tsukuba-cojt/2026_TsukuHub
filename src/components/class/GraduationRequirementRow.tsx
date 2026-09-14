import { Check, ChevronRight } from "lucide-react";
import ProgressBar from "./GraduationProgressBar";
import {
  formatPercent,
  levelClass,
  levelFromPercent,
} from "./graduationProgressLevel";
import type { RequirementBarItem } from "../../features/graduationCheck";

type Props = {
  item: RequirementBarItem;
  nested?: boolean;
  onOpen?: () => void;
};

// 要件項目リストの1行。
// 単位数と%は未クランプの実値を出し（100%超あり）、バーの塗りのみ100%で頭打ち。
function GraduationRequirementRow({ item, nested = false, onOpen }: Props) {
  const level = levelFromPercent(item.percent);
  const clickable = onOpen !== undefined;
  const className = [
    "gradResultReqRow",
    levelClass[level],
    nested ? "isNested" : "",
    clickable ? "" : "isStatic",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} onClick={onOpen}>
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
      {clickable ? (
        <button
          type="button"
          className="gradResultReqChevronBtn"
          aria-label={`${item.label}の詳細を見る`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          <ChevronRight className="gradResultReqChevron" aria-hidden="true" />
        </button>
      ) : (
        <span className="gradResultReqChevronSpacer" aria-hidden="true" />
      )}
    </div>
  );
}

export default GraduationRequirementRow;
