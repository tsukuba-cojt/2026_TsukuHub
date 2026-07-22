import { useEffect, useRef, useState } from "react";
import { Ellipsis, ThumbsUp } from "lucide-react";
import RatingStars from "./RatingStars";
import FeatureTag from "./FeatureTag";
import "../../styles/class/ClassReviewCard.css";

// DB 由来の口コミ型（ClassDetail.tsx の Review 型と同一。共通化は後日検討）
type Review = {
  id: string;
  course_id: number;
  user_id: string;
  rating: number;
  lecture_format: string | null;
  test_format: string | null;
  difficulty: string | null;
  workload: string | null;
  attendance: string | null;
  past_exam: string | null;
  comment: string | null;
  author_major: string | null;
  author_grade: number | null;
  created_at: string;
  updated_at: string;
  helpful_count: number;
};

type ClassReviewCardProps = {
  review: Review;
};

const CLAMP_THRESHOLD = 100;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

// [変更] 投稿者の表示文字列を生成（「○○学類 ○年」形式）
function formatAuthor(major: string | null, grade: number | null): string {
  if (major && grade != null) return `${major} ${grade}年`;
  if (major) return major;
  if (grade != null) return `${grade}年`;
  return "ユーザー";
}

function ClassReviewCard({ review }: ClassReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState(review.helpful_count);
  const [voted, setVoted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const commentText = review.comment ?? "";
  const isLong = commentText.length > CLAMP_THRESHOLD;

  // 口コミの任意フィールドからタグを動的に生成（「項目名：値」形式）
  const tagSources: [string, string | null][] = [
    ["講義", review.lecture_format],
    ["難易度", review.difficulty],
    ["課題量", review.workload],
    ["出席", review.attendance],
    ["過去問", review.past_exam],
  ];
  const tags = tagSources
    .filter((pair): pair is [string, string] => pair[1] !== null)
    .map(([label, value]) => `${label}：${value}`);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleHelpful = () => {
    setHelpful((v) => (voted ? v - 1 : v + 1));
    setVoted((v) => !v);
  };

  const handleReport = () => {
    setMenuOpen(false);
    window.alert("通報を受け付けました（後日実装予定のスタブです）");
  };

  return (
    <article className="reviewCard">
      <div className="reviewCardHeader">
        <div className="reviewCardMeta">
          <RatingStars rating={review.rating} />
          {/* [変更] author_major + author_grade で「○○学類 ○年」表示 */}
          <span className="reviewAuthor">
            {formatAuthor(review.author_major, review.author_grade)}
          </span>
        </div>
        <div className="reviewCardHeaderRight">
          <time className="reviewDate">{formatDate(review.created_at)}</time>
          <div className="reviewMenuWrap" ref={menuRef}>
            <button
              type="button"
              className="reviewMenuBtn"
              aria-label="その他の操作"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Ellipsis aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="reviewMenu" role="menu">
                <button
                  type="button"
                  className="reviewMenuItem"
                  role="menuitem"
                  onClick={handleReport}
                >
                  通報する
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {commentText.length > 0 && (
        <>
          <p className={`reviewComment${isLong && !expanded ? " isClamped" : ""}`}>
            {commentText}
          </p>
          {isLong && (
            <button
              type="button"
              className="reviewExpandBtn"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "折りたたむ" : "もっと見る"}
            </button>
          )}
        </>
      )}

      <div className="reviewCardFooter">
        {tags.length > 0 && (
          <div className="reviewTags">
            {tags.map((tag) => (
              <FeatureTag label={tag} key={tag} />
            ))}
          </div>
        )}
        <button
          type="button"
          className={`reviewHelpfulBtn${voted ? " isVoted" : ""}`}
          onClick={handleHelpful}
        >
          <ThumbsUp aria-hidden="true" />
          参考になった
          <span className="reviewHelpfulCount">{helpful}</span>
        </button>
      </div>
    </article>
  );
}

export default ClassReviewCard;