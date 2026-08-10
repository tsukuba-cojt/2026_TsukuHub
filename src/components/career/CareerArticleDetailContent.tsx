import { Clock3 } from "lucide-react";
import type { CareerArticleRecord } from "../../types/content";

type CareerArticleDetailContentProps = {
  article: CareerArticleRecord;
};

export default function CareerArticleDetailContent({
  article,
}: CareerArticleDetailContentProps) {
  return (
    <>
      <header>
        <span>{article.category}</span>
        <h1>{article.title}</h1>
        <p>
          <time dateTime={article.published_at}>
            {article.published_at.replaceAll("-", ".")}
          </time>
          <Clock3 aria-hidden="true" /> {article.read_minutes}分で読めます
        </p>
      </header>
      <section>
        <p className="careerArticleLead">{article.description}</p>
        <div className="careerArticleBody">
          {article.content || article.description}
        </div>
      </section>
    </>
  );
}
