import { Link } from "react-router-dom";
import type { CareerArticleRecord } from "../../types/content";
import { extractArticleCover } from "../../lib/articleMarkdown";
import { useUniversity } from "../university/universityContextValue";
import ContentCover from "./ContentCover";

type CareerArticleCardProps = {
  article: CareerArticleRecord;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replaceAll("-", ".");
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

export default function CareerArticleCard({ article }: CareerArticleCardProps) {
  const { path } = useUniversity();
  const coverImage = extractArticleCover(article.content);
  const cover = (
    <>
      <ContentCover
        variant="card"
        imageUrl={coverImage?.src}
        eyebrow="Career Basics"
        title={article.category}
        org={`${article.read_minutes}分で読めます`}
      />
      <div className="alumniCardBody">
        <div>
          <span>{article.category}</span>
        </div>
        <h2>{article.title}</h2>
        <p>{article.description}</p>
        <em>{formatDate(article.published_at)} ・ 詳しく読む</em>
      </div>
    </>
  );

  const isExternal = article.source_type === "external" && Boolean(article.external_url) && !article.content.trim();
  return (
    <article className="alumniCard">
      {isExternal ? (
        <a
          className="alumniCardLink"
          href={article.external_url ?? "#"}
          target="_blank"
          rel="noreferrer"
        >
          {cover}
        </a>
      ) : (
        <Link className="alumniCardLink" to={path(`/career/articles/${article.id}`)}>
          {cover}
        </Link>
      )}
    </article>
  );
}
