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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.7-4.5 4.3-6.5 8-6.5s6.3 2 8 6.5" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10v16l-5-3-5 3z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function ClassCard({ course }: ClassCardProps) {
  return (
    <article className="classCard">
      <div className="classCardMain">
        <div className="classCardMeta">
          <span className="classCode">{course.code}</span>
        </div>
        <div className="classTitleRow">
          <h2>{course.title}</h2>
          <div className="classTeacher">
            <UserIcon />
            <span>{course.teacher}</span>
            <small>先生</small>
          </div>
        </div>
        <div className="classBadges">
          <span className="classTermBadge">{course.term}</span>
          <span>
            <CalendarIcon />
            {course.period}
          </span>
          <span>
            <ClockIcon />
            {course.credits}
          </span>
        </div>
      </div>

      <div className="classCardRating">
        <button type="button" aria-label={`${course.title}をブックマーク`}>
          <BookmarkIcon />
        </button>
        <span>おすすめ度</span>
        <strong>{course.rating.toFixed(1)}</strong>
        <RatingStars rating={course.rating} />
        <p>({course.reviews}件)</p>
      </div>
    </article>
  );
}

export default ClassCard;
