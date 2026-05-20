import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/context/BookmarkContext";

interface BookmarkButtonProps {
  id: string;
  variant?: "icon" | "full";
  className?: string;
}

export function BookmarkButton({ id, variant = "icon", className = "" }: BookmarkButtonProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const bookmarked = isBookmarked(id);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) {
      removeBookmark(id);
    } else {
      addBookmark(id);
    }
  };

  if (variant === "full") {
    return (
      <Button
        variant={bookmarked ? "secondary" : "outline"}
        onClick={toggleBookmark}
        className={`${className} transition-all`}
        data-testid={`bookmark-btn-full-${id}`}
      >
        <Heart className={`w-4 h-4 mr-2 ${bookmarked ? "fill-primary text-primary" : ""}`} />
        {bookmarked ? "保存済み" : "ブックマーク"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleBookmark}
      className={`h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all ${bookmarked ? "text-primary" : "text-muted-foreground"} ${className}`}
      data-testid={`bookmark-btn-icon-${id}`}
    >
      <Heart className={`w-5 h-5 ${bookmarked ? "fill-primary text-primary" : ""}`} />
      <span className="sr-only">Toggle Bookmark</span>
    </Button>
  );
}
