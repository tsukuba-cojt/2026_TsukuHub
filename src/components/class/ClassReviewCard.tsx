import { useEffect, useRef, useState } from "react";
import { Ellipsis, ThumbsUp } from "lucide-react";
import RatingStars from "./RatingStars";
import FeatureTag from "./FeatureTag";
import type { Review } from "./mockReviews";
import { useAuth } from "../auth/authContextValue";
import { createReviewReport } from "../../services/contentService";
import "../../styles/class/ClassReviewCard.css";

type ClassReviewCardProps = {
  review: Review;
  courseCode: string;
};

// これ以上の文字数のコメントは省略表示＋「もっと見る」トグルにする
const CLAMP_THRESHOLD = 100;

function ClassReviewCard({ review, courseCode }: ClassReviewCardProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  // 参考になったの加算は見た目のみ（永続化は後日実装）
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [voted, setVoted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
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

  const handleReport = async () => {
    setMenuOpen(false);
    if (!user) {
      window.alert("口コミを通報するにはログインしてください。");
      return;
    }
    const reason = window.prompt("通報理由を入力してください（例：個人情報、誹謗中傷、授業と無関係）");
    if (!reason?.trim()) return;
    setReporting(true);
    try {
      await createReviewReport({
        review_id: review.id,
        course_code: courseCode,
        review_snapshot: review.comment,
        reporter_id: user.id,
        reason: reason.trim(),
      });
      window.alert("通報を受け付けました。管理者が内容を確認します。");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      window.alert(message.includes("duplicate") || message.includes("unique") ? "この口コミはすでに通報済みです。" : "通報を送信できませんでした。時間をおいて再度お試しください。");
    } finally {
      setReporting(false);
    }
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
                  disabled={reporting}
                  onClick={() => void handleReport()}
                >
                  {reporting ? "送信中..." : "通報する"}
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
            <FeatureTag label={tag} key={tag} />
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
