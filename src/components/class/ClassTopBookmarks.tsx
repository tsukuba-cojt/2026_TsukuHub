import { Link } from "react-router-dom";
import { Bookmark, ChevronRight } from "lucide-react";
import "../../styles/class/ClassTop.css";

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
  return (
    <section className="classTopPanel">
      <div className="classTopPanelHeading">
        <h2>ブックマーク一覧</h2>
        {/* もっと見る先は未実装のため仮リンク（404） */}
        <Link to="/bookmarks" className="classTopMoreLink">
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
              <Link to={`/class/${course.code}`} className="classTopBookmarkRow">
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
                  {/* 一覧に載る講義は登録済みのため常に塗りつぶし表示。
                      解除ロジックは未実装（実データ接続時に実装）。 */}
                  <button
                    type="button"
                    className="classTopBookmarkBtn"
                    aria-pressed="true"
                    aria-label={`${course.title}のブックマークを解除`}
                    onClick={(e) => {
                      // 行全体のリンク遷移だけ止める
                      e.preventDefault();
                    }}
                  >
                    <Bookmark
                      aria-hidden="true"
                      fill="currentColor"
                      stroke="currentColor"
                    />
                  </button>
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
