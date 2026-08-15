import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CareerArticleRecord } from "../../types/content";
import CareerArticleCard from "./CareerArticleCard";

type CareerArticlePreviewProps = {
  articles: CareerArticleRecord[];
};

export default function CareerArticlePreview({ articles }: CareerArticlePreviewProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>(".careerNoteSlide");
    const gap = 20;
    const distance = (card?.getBoundingClientRect().width ?? 360) + gap;
    scroller.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <div className="careerNoteSlider">
      {articles.length > 1 && (
        <button
          type="button"
          className="careerNoteNav isPrev"
          aria-label="前の記事"
          onClick={() => scrollByCard(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
      )}
      <div className="careerNoteGrid" ref={scrollerRef} aria-label="就活・長期インターンの基礎知識の記事">
        {articles.map((article) => (
          <div className="careerNoteSlide" key={article.id}>
            <CareerArticleCard article={article} />
          </div>
        ))}
      </div>
      {articles.length > 1 && (
        <button
          type="button"
          className="careerNoteNav isNext"
          aria-label="次の記事"
          onClick={() => scrollByCard(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
