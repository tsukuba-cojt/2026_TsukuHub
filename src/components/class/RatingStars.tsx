import "../../styles/class/RatingStars.css";

type RatingStarsProps = {
  rating: number;
};

function RatingStars({ rating }: RatingStarsProps) {
  const filled = Math.round(rating);

  return (
    <div className="ratingStars" aria-label={`おすすめ度 ${rating.toFixed(1)}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span className={index < filled ? "isFilled" : ""} key={index}>
          ★
        </span>
      ))}
    </div>
  );
}

export default RatingStars;
