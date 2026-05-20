import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  className?: string;
}

export function StarRating({ rating, max = 5, className = "" }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className={`flex items-center space-x-1 ${className}`} aria-label={`${rating} out of ${max} stars`}>
      {[...Array(max)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
        }
        // Could implement half star using SVG mask if really needed, but keeping it simple
        return <Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />;
      })}
      <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}
