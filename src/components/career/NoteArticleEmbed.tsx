import { useEffect } from "react";
import type { CareerNoteArticle } from "../../data/careerNoteArticles";

const noteEmbedScript = "https://note.com/scripts/embed.js";
const noteEmbedScriptSelector = "script[data-note-embed-script]";

type NoteArticleEmbedProps = {
  articles: CareerNoteArticle[];
};

export default function NoteArticleEmbed({ articles }: NoteArticleEmbedProps) {
  useEffect(() => {
    if (document.querySelector(noteEmbedScriptSelector)) return;

    const script = document.createElement("script");
    script.src = noteEmbedScript;
    script.async = true;
    script.charset = "utf-8";
    script.dataset.noteEmbedScript = "true";
    document.body.appendChild(script);
  }, []);

  return (
    <section
      className="careerNoteGrid"
      aria-label="就活・長期インターンの基礎知識の記事"
    >
      {articles.map((article) => (
        <iframe
          className="note-embed"
          src={`https://note.com/embed/notes/${article.noteId}`}
          title={article.title}
          height={400}
          style={{
            border: 0,
            display: "block",
            maxWidth: "99%",
            width: "494px",
            padding: 0,
            margin: "10px 0",
            position: "static",
            visibility: "visible",
          }}
          key={article.noteId}
        />
      ))}
    </section>
  );
}
