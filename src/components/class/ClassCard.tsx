import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Calendar, Clock, UserRound } from "lucide-react";
import RatingStars from "./RatingStars";
import "../../styles/class/ClassCard.css";
import { useUniversity } from "../university/universityContextValue";

export type ClassCourse = {
  id: string;
  academicYear: number;
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

function CardText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setOverflowing(element.scrollWidth > element.clientWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return (
    <span
      ref={ref}
      className="classCardText"
      data-overflowing={overflowing || undefined}
      title={overflowing ? text : undefined}
    >
      {text}
    </span>
  );
}

function ClassCard({ course }: ClassCardProps) {
  const { path } = useUniversity();
  return (
    <Link
      to={path(`/class/${course.code}?year=${course.academicYear}`)}
      className="classCardLink"
    >
      <article className="classCard">
      <div className="classCardMain">
        <div className="classCardMeta">
          <span className="classCode">{course.code}</span>
        </div>
        <div className="classTitleRow">
          <h2><CardText text={course.title} /></h2>
          <div className="classTeacher">
            <UserRound aria-hidden="true" />
            <CardText text={course.teacher} />
            <small>先生</small>
          </div>
        </div>
        <div className="classBadges">
          <span className="classTermBadge"><CardText text={course.term} /></span>
          <span>
            <Calendar aria-hidden="true" />
            <CardText text={course.period} />
          </span>
          <span>
            <Clock aria-hidden="true" />
            <CardText text={course.credits} />
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
