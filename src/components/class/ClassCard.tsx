import { Link } from "react-router-dom";
import { Bookmark, Calendar, Clock, UserRound } from "lucide-react";
import RatingStars from "./RatingStars";
import "../../styles/class/ClassCard.css";

export type ClassCourse = {
  id: string;
  code: string;
  title: string;
  teacher: string;
  term: string;
  period: string;
  credits: string;
  rating: number;
  reviews: number;
};

type ClassCardProps = {
  course: ClassCourse;
};

function ClassCard({ course }: ClassCardProps) {
  return (
    <Link to={`/class/${course.code}`} className="classCardLink">
      <article className="classCard">
      <div className="classCardMain">
        <div className="classCardMeta">
          <span className="classCode">{course.code}</span>
        </div>
        <div className="classTitleRow">
          <h2>{course.title}</h2>
          <div className="classTeacher">
            <UserRound aria-hidden="true" />
            <span>{course.teacher}</span>
            <small>先生</small>
          </div>
        </div>
        <div className="classBadges">
          <span className="classTermBadge">{course.term}</span>
          <span>
            <Calendar aria-hidden="true" />
            {course.period}
          </span>
          <span>
            <Clock aria-hidden="true" />
            {course.credits}
          </span>
        </div>
      </div>

      <div className="classCardRating">
        <button
          type="button"
          aria-label={`${course.title}をブックマーク`}
          onClick={(e) => {
            // ブックマークは後日実装。カード全体のリンク遷移だけ止める
            e.preventDefault();
          }}
        >
          <Bookmark aria-hidden="true" />
        </button>
        <span>おすすめ度</span>
        <strong>{course.rating.toFixed(1)}</strong>
        <RatingStars rating={course.rating} />
        <p>({course.reviews}件)</p>
      </div>
      </article>
    </Link>
  );
}

export default ClassCard;
