import { useState } from "react";
import "../../styles/class/RatingStarsInput.css";

// 星5段階のクリック選択式コンポーネント（口コミ投稿ページ用）。
// 既存の RatingStars は表示専用のため、同じ配色で入力用を別途用意している。
// ホバーで一時プレビュー、クリックで確定。初期状態は未選択（0）。
type RatingStarsInputProps = {
  value: number; // 0 = 未選択
  onChange: (value: number) => void;
};

function RatingStarsInput({ value, onChange }: RatingStarsInputProps) {
  const [hovered, setHovered] = useState(0);
  const preview = hovered || value;

  return (
    <div className="ratingStarsInput">
      <div
        className="ratingStarsInputStars"
        role="radiogroup"
        aria-label="おすすめ度"
        onMouseLeave={() => setHovered(0)}
      >
        {Array.from({ length: 5 }, (_, index) => {
          const star = index + 1;
          return (
            <button
              type="button"
              key={star}
              role="radio"
              aria-checked={value === star}
              aria-label={`星${star}`}
              className={star <= preview ? "isFilled" : ""}
              onMouseEnter={() => setHovered(star)}
              onFocus={() => setHovered(star)}
              onBlur={() => setHovered(0)}
              onClick={() => onChange(star)}
            >
              ★
            </button>
          );
        })}
      </div>
      <p className="ratingStarsInputValue">
        {value > 0 ? (
          <>
            <strong>{value}</strong> / 5
          </>
        ) : (
          <span className="ratingStarsInputUnset">未選択</span>
        )}
      </p>
    </div>
  );
}

export default RatingStarsInput;
