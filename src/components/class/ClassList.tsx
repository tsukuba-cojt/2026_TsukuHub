import { useState } from "react";
import "../../styles/class/Class.css";

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  department: string;
  semester: string;
  module: string;
  schedule: string;
  credits: number;
  rating: number;
  reviewCount: number;
}

export type SortKey = "ratingDesc" | "reviewCountDesc" | "codeAsc";

interface ClassListProps {
  courses: Course[];
  totalCount: number;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

function Stars({ rating }: { rating: number }) {
  const fullStars = Math.round(rating);
  return (
    <span className="classStars" aria-hidden="true">
      {"★".repeat(fullStars)}
      {"☆".repeat(5 - fullStars)}
    </span>
  );
}

function ClassList({ courses, totalCount, sortKey, onSortChange }: ClassListProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="classListArea">
      <div className="classListHeader">
        <p className="classResultCount">
          {courses.length}件/{totalCount}件中
        </p>
        <select
          className="classSortSelect"
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          <option value="ratingDesc">評価が高い順</option>
          <option value="reviewCountDesc">レビュー数が多い順</option>
          <option value="codeAsc">講座番号順</option>
        </select>
      </div>

      <ul className="classCardList">
        {courses.map((course) => (
          <li key={course.id} className="classCard">
            <div className="classCardMain">
              <span className="classDepartmentBadge">{course.department}</span>
              <p className="classCode">{course.code}</p>
              <h3 className="classCourseName">{course.name}</h3>
              <p className="classInstructor">{course.instructor}</p>
              <div className="classTags">
                <span className="classTag">{course.semester}</span>
                <span className="classTag">{course.schedule}</span>
                <span className="classTag">{course.credits}単位</span>
              </div>
              <div className="classRating">
                <span className="classRatingValue">{course.rating.toFixed(1)}</span>
                <Stars rating={course.rating} />
                <span className="classReviewCount">({course.reviewCount}件)</span>
              </div>
            </div>
            <button
              type="button"
              className={`classBookmarkButton ${bookmarkedIds.has(course.id) ? "isBookmarked" : ""}`}
              aria-label="ブックマーク"
              onClick={() => toggleBookmark(course.id)}
            >
              {bookmarkedIds.has(course.id) ? "★" : "☆"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ClassList;
