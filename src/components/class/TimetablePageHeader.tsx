import { Link } from "react-router-dom";
import { CalendarDays, Upload } from "lucide-react";

type Props = {
  // 現在地のラベル（例：「時間割詳細」）。
  // 指定するとパンくず末尾に追加され、「みんなの時間割」がリンクになる。
  // 未指定＝みんなの時間割トップ自身なので非リンクのテキストのまま。
  currentPage?: string;
};

// 「みんなの時間割」系ページ共通のパンくず＋タイトル行。
// トップ（/timetable）と詳細（/timetable/:timetableId）で同じ見出しを共有する。
function TimetablePageHeader({ currentPage }: Props) {
  return (
    <>
      <p className="classBreadcrumb">
        <Link to="/" className="classBreadcrumbLink">
          ホーム
        </Link>{" "}
        &gt;{" "}
        <Link to="/class/top" className="classBreadcrumbLink">
          授業・履修
        </Link>{" "}
        &gt;{" "}
        {currentPage ? (
          <>
            <Link to="/timetable" className="classBreadcrumbLink">
              みんなの時間割
            </Link>{" "}
            &gt; {currentPage}
          </>
        ) : (
          "みんなの時間割"
        )}
      </p>

      {/* 見出し行：タイトル＋β版バッジ＋共有ボタン */}
      <div className="timetableHeading">
        <div className="timetableHeadingMain">
          <h1 className="timetableTitle">
            <CalendarDays aria-hidden="true" />
            みんなの時間割
            <span className="timetableBetaBadge">β版</span>
          </h1>
          <p className="timetableLead">
            みんなの時間割を参考に、あなたの履修計画を立てよう
          </p>
        </div>
        {/* 共有フローは未実装のためプレースホルダーのルート。 */}
        <Link to="/timetable/share" className="timetableShareBtn">
          <Upload aria-hidden="true" />
          自分の時間割を共有する
        </Link>
      </div>
    </>
  );
}

export default TimetablePageHeader;
