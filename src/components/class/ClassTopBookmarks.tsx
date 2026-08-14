import { Link } from "react-router-dom";
import { Bookmark, ChevronRight } from "lucide-react";
import "../../styles/class/ClassTop.css";
import { useUniversity } from "../university/universityContextValue";

// ブックマークした講義の表示用データ。
// ブックマーク機構は未実装のため、当面は親から渡すダミー配列で表示する。
// 実データ接続（Supabase）は別タスク。
export type BookmarkedCourse = {
  code: string; // 講義番号（詳細ページへのリンクに使用）
  category: string; // 区分バッジ（例：専門基礎科目）
  categoryClass: string; // バッジの色クラス（ClassTop.css）
  title: string;
  department: string; // 学類／学域
  schedule: string; // 開講時期・曜時限
  rating: number;
  reviews: number;
};

type ClassTopBookmarksProps = {
  bookmarks: BookmarkedCourse[];
};

function ClassTopBookmarks({ bookmarks }: ClassTopBookmarksProps) {
  const { path } = useUniversity();
  return (
    <section className="classTopPanel">
      <div className="classTopPanelHeading">
        <h2>ブックマーク一覧</h2>
        {/* もっと見る先は未実装のため仮リンク（404） */}
        <Link to={path("/bookmarks")} className="classTopMoreLink">
          もっと見る
          <ChevronRight aria-hidden="true" />
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <p className="classTopEmpty">
          まだブックマークした講義がありません。
          <br />
          講義検索から気になる講義を保存できます。
        </p>
      ) : (
        <ul className="classTopBookmarkList">
          {bookmarks.map((course) => (
            <li key={course.code}>
              <Link to={path(`/class/${course.code}`)} className="classTopBookmarkRow">
                <div className="classTopBookmarkMain">
                  <p className="classTopBookmarkTitleRow">
                    <span className={`classTopCategoryBadge ${course.categoryClass}`}>
                      {course.category}
                    </span>
                    <span className="classTopBookmarkTitle">{course.title}</span>
                  </p>
                  <p className="classTopBookmarkMeta">
                    <span>{course.department}</span>
                    <span>{course.schedule}</span>
                  </p>
                </div>
                <div className="classTopBookmarkSide">
                  <span className="classTopBookmarkRating">
                    <span className="classTopStar">★</span>
                    {course.rating.toFixed(1)}
                    <small>({course.reviews})</small>
                  </span>
                  <Bookmark className="classTopBookmarkIcon" aria-hidden="true" />
                  <ChevronRight className="classTopRowChevron" aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ClassTopBookmarks;
