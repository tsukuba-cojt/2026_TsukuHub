import { Link } from "react-router-dom";
import { Bookmark, ChevronRight } from "lucide-react";
import "../../styles/class/ClassTop.css";
import { useUniversity } from "../university/universityContextValue";

export type BookmarkedCourse = {
  code: string;
  category: string;
  categoryClass: string;
  title: string;
  department: string;
  schedule: string;
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
        <h2>ブックマーク一覧（ダミー）</h2>
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
