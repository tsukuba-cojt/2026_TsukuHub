import { useEffect, useRef, useState } from "react";
import { Ellipsis, ThumbsUp } from "lucide-react";
import RatingStars from "./RatingStars";
import type { Review } from "./mockReviews";
import "../../styles/class/ClassReviewCard.css";

type ClassReviewCardProps = {
  review: Review;
};

// これ以上の文字数のコメントは省略表示＋「もっと見る」トグルにする
const CLAMP_THRESHOLD = 100;

function ClassReviewCard({ review }: ClassReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  // 参考になったの加算は見た目のみ（永続化は後日実装）
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [voted, setVoted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLong = review.comment.length > CLAMP_THRESHOLD;

  // 通報メニュー外クリックで閉じる
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
    // 後日実装：DB への参考になった数の反映。現状はローカル state のみ
    setHelpful((v) => (voted ? v - 1 : v + 1));
    setVoted((v) => !v);
  };

  const handleReport = () => {
    // 後日実装：通報の送信処理。現状はスタブ
    setMenuOpen(false);
    window.alert("通報を受け付けました（後日実装予定のスタブです）");
  };

  return (
    <article className="reviewCard">
      <div className="reviewCardHeader">
        <div className="reviewCardMeta">
          <RatingStars rating={review.rating} />
          <span className="reviewAuthor">
            {review.grade} {review.department}
          </span>
        </div>
        <div className="reviewCardHeaderRight">
          <time className="reviewDate">{review.date}</time>
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

      <p className={`reviewComment${isLong && !expanded ? " isClamped" : ""}`}>
        {review.comment}
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

      {review.files && review.files.length > 0 && (
        <div className="reviewFiles">
          {review.files.map((file) => (
            <span className="reviewFileChip" key={file}>
              {file}
            </span>
          ))}
        </div>
      )}

      <div className="reviewCardFooter">
        <div className="reviewTags">
          {review.tags.map((tag) => (
            <span className="reviewTag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
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
