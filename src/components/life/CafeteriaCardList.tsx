import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RatingStars from "../class/RatingStars";
import { CafeteriaCategoryBadge, PaymentIcons } from "./CafeteriaTags";
import type { Cafeteria } from "./mockCafeterias";
import "../../styles/life/Cafeteria.css";

const SCROLL_PADDING = 16;

type ScrollState = {
  atStart: boolean;
  atEnd: boolean;
  thumbWidth: number;
  thumbLeft: number;
};

type CafeteriaCardListProps = {
  cafeterias: Cafeteria[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function CafeteriaCardList({ cafeterias, selectedId, onSelect }: CafeteriaCardListProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const [scrollState, setScrollState] = useState<ScrollState>({
    atStart: true,
    atEnd: true,
    thumbWidth: 100,
    thumbLeft: 0,
  });

  const updateScrollState = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    setScrollState({
      atStart: scroller.scrollLeft <= 1,
      atEnd: scroller.scrollLeft >= maxScroll - 1,
      thumbWidth: scroller.scrollWidth > 0 ? (scroller.clientWidth / scroller.scrollWidth) * 100 : 100,
      thumbLeft: scroller.scrollWidth > 0 ? (scroller.scrollLeft / scroller.scrollWidth) * 100 : 0,
    });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [updateScrollState, cafeterias]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const card = selectedId ? cardRefs.current.get(selectedId) : undefined;
    if (!scroller || !card) return;
    const cardStart = card.offsetLeft;
    const cardEnd = cardStart + card.offsetWidth;
    if (cardStart < scroller.scrollLeft) {
      scroller.scrollTo({ left: cardStart - SCROLL_PADDING, behavior: "smooth" });
    } else if (cardEnd > scroller.scrollLeft + scroller.clientWidth) {
      scroller.scrollTo({ left: cardEnd - scroller.clientWidth + SCROLL_PADDING, behavior: "smooth" });
    }
  }, [selectedId, cafeterias]);

  const scrollByPage = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: "smooth" });
  };

  if (cafeterias.length === 0) {
    return (
      <section className="cafeteriaResults" aria-label="検索結果">
        <p className="cafeteriaEmpty cafeteriaResultsEmpty">
          条件に合う施設が見つかりませんでした。絞り込み条件を変更してください。
        </p>
      </section>
    );
  }

  return (
    <section className="cafeteriaResults" aria-label="検索結果">
      <div className="cafeteriaCarousel">
        {!scrollState.atStart && (
          <button
            type="button"
            className="cafeteriaCarouselArrow isPrev"
            aria-label="前の施設を表示"
            onClick={() => scrollByPage(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
        )}

        <div className="cafeteriaCardScroller" ref={scrollerRef} onScroll={updateScrollState}>
          {cafeterias.map((cafeteria) => {
            const selected = cafeteria.id === selectedId;
            return (
              <article
                className={`cafeteriaCard${selected ? " isSelected" : ""}`}
                key={cafeteria.id}
                ref={(node) => {
                  if (node) cardRefs.current.set(cafeteria.id, node);
                  else cardRefs.current.delete(cafeteria.id);
                }}
              >
                <div className="cafeteriaCardHead">
                  <h3>
                    <button
                      type="button"
                      className="cafeteriaCardSelect"
                      aria-pressed={selected}
                      onClick={() => onSelect(cafeteria.id)}
                    >
                      {cafeteria.name}
                    </button>
                  </h3>
                  <CafeteriaCategoryBadge category={cafeteria.category} />
                </div>
                <RatingStars rating={cafeteria.rating} />
                <p className="cafeteriaCardLocation">{cafeteria.location}</p>
                <div className="cafeteriaCardHours">
                  {cafeteria.hours.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <PaymentIcons payments={cafeteria.payments} />
              </article>
            );
          })}
        </div>

        {!scrollState.atEnd && (
          <button
            type="button"
            className="cafeteriaCarouselArrow isNext"
            aria-label="次の施設を表示"
            onClick={() => scrollByPage(1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="cafeteriaScrollIndicator" aria-hidden="true">
        <span
          style={{ width: `${scrollState.thumbWidth}%`, left: `${scrollState.thumbLeft}%` }}
        />
      </div>
    </section>
  );
}

export default CafeteriaCardList;
