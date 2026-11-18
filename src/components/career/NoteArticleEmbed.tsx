import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CareerNoteArticle } from "../../data/careerNoteArticles";

const noteEmbedScript = "https://note.com/scripts/embed.js";
const noteEmbedScriptSelector = "script[data-note-embed-script]";

type NoteArticleEmbedProps = {
  articles: CareerNoteArticle[];
};

export default function NoteArticleEmbed({ articles }: NoteArticleEmbedProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.querySelector(noteEmbedScriptSelector)) return;

    const script = document.createElement("script");
    script.src = noteEmbedScript;
    script.async = true;
    script.charset = "utf-8";
    script.dataset.noteEmbedScript = "true";
    document.body.appendChild(script);
  }, []);

  const scrollByCard = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>(".careerNoteSlide");
    const gap = 20;
    const distance = (card?.getBoundingClientRect().width ?? 494) + gap;
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
      <div
        className="careerNoteGrid"
        ref={scrollerRef}
        aria-label="就活・長期インターンの基礎知識の記事"
      >
        {articles.map((article) => (
          <div className="careerNoteSlide" key={article.noteId}>
            <iframe
              className="note-embed"
              src={`https://note.com/embed/notes/${article.noteId}`}
              title={article.title}
              height={400}
              style={{
                border: 0,
                display: "block",
                width: "100%",
                padding: 0,
                margin: 0,
              }}
            />
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
