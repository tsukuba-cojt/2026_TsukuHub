import { useState } from "react";
import type { ArticleHeading } from "../../lib/articleMarkdown";

type ArticleTocProps = {
  headings: ArticleHeading[];
};

export default function ArticleToc({ headings }: ArticleTocProps) {
  const [open, setOpen] = useState(true);
  if (headings.length === 0) return null;

  return (
    <nav className="articleToc" aria-label="目次">
      <div className="articleTocHead">
        <h2>目次</h2>
        <button type="button" onClick={() => setOpen((current) => !current)}>
          {open ? "目次を閉じる" : "目次を開く"}
        </button>
      </div>
      {open && (
        <ol>
          {headings.map((heading) => (
            <li key={heading.id} className={heading.level === 3 ? "isSub" : undefined}>
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
