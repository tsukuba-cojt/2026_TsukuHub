import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
// ログイン済みヘッダー（マイページ）で使われているユーザーアイコンを再利用。
import peopleIcon from "../../assets/utility/header_footer/People.svg";
import { gradeLabel, type Timetable } from "./timetableData";

const DAY_LABELS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5, 6];

type Props = {
  timetable: Timetable;
  // 一覧の絞り込み条件（クエリ文字列）。詳細ページへそのまま引き継ぐ。
  search?: string;
};

// 1件分の時間割カード（プレゼンテーショナル）。
// ミニ時間割は月〜金×1〜6限のグリッドで、セルは配色ブロックのみ（文字なし）。
function TimetableCard({ timetable, search = "" }: Props) {
  // 「day-period」→ 科目区分 の索引を作り、セル描画時に O(1) で参照する。
  const cellCategory = new Map<string, string>();
  (timetable.schedule[timetable.module] ?? []).forEach((cell) => {
    cellCategory.set(`${cell.day}-${cell.period}`, cell.category);
  });

  return (
    <article className="timetableCard">
      <div className="timetableCardHead">
        <span className="timetableCardAvatar">
          <img src={peopleIcon} alt="" aria-hidden="true" />
        </span>
        <div className="timetableCardMeta">
          <p className="timetableCardTerm">
            {gradeLabel(timetable.grade)} {timetable.module}
          </p>
          <p className="timetableCardSub">
            {timetable.enrollYear}年度入学・{timetable.major}
          </p>
        </div>
      </div>

      <div className="timetableMiniGrid" aria-hidden="true">
        {/* ヘッダー行：左上の空セル＋曜日ラベル */}
        <span className="timetableMiniCorner" />
        {DAY_LABELS.map((day) => (
          <span className="timetableMiniDay" key={day}>
            {day}
          </span>
        ))}

        {/* コマ番号行 */}
        {PERIODS.map((period) => (
          <div className="timetableMiniRow" key={period}>
            <span className="timetableMiniPeriod">{period}</span>
            {DAY_LABELS.map((_, day) => {
              const category = cellCategory.get(`${day}-${period}`);
              return (
                <span
                  className={`timetableMiniCell${
                    category ? ` is-${category}` : ""
                  }`}
                  key={day}
                />
              );
            })}
          </div>
        ))}
      </div>

      <Link
        to={{ pathname: `/timetable/${timetable.id}`, search }}
        className="timetableCardDetailLink"
      >
        詳細を見る
        <ChevronRight aria-hidden="true" />
      </Link>
    </article>
  );
}

export default TimetableCard;
