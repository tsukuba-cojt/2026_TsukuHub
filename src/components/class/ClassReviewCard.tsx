import { useEffect, useRef, useState } from "react";
import { Ellipsis, ThumbsUp } from "lucide-react";
import RatingStars from "./RatingStars";
import FeatureTag from "./FeatureTag";
// [変更] mockReviews からの型インポートを削除。DB 由来の型をここで定義
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
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  helpful_count: number;
};

type ClassReviewCardProps = {
  review: Review;
};

// これ以上の文字数のコメントは省略表示＋「もっと見る」トグルにする
const CLAMP_THRESHOLD = 100;

// [変更] created_at（ISO文字列）を表示用に整形する
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function ClassReviewCard({ review }: ClassReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  // [変更] helpfulCount → helpful_count
  const [helpful, setHelpful] = useState(review.helpful_count);
  const [voted, setVoted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // [変更] comment が null の場合を考慮
  const commentText = review.comment ?? "";
  const isLong = commentText.length > CLAMP_THRESHOLD;

  // [変更] 口コミの任意フィールドからタグを動的に生成（null でないものだけ表示）
  const tags = [
    review.lecture_format,
    review.difficulty,
    review.workload,
    review.attendance,
    review.past_exam,
  ].filter((v): v is string => v !== null);

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
    // 後日実装：review_helpfuls テーブルへの insert/delete。現状はローカル state のみ
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
          {/* [変更] grade/department は profiles テーブル実装後に表示する。
              現状は匿名かどうかだけ表示 */}
          <span className="reviewAuthor">
            {review.is_anonymous ? "匿名" : "ユーザー"}
          </span>
        </div>
        <div className="reviewCardHeaderRight">
          {/* [変更] date → created_at を整形して表示 */}
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

      {/* [変更] comment が空の場合はコメント欄自体を非表示にする */}
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

      {/* [変更] files フィールドは DB スキーマに未定義のため削除。
          ファイル添付機能を実装する際に復活させる */}

      <div className="reviewCardFooter">
        {/* [変更] review.tags → 任意フィールドから動的生成したタグ */}
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