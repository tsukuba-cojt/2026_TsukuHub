import type { CareerArticleRecord } from "../../types/content";
import {
  extractArticleCover,
  hasLeadingArticleImage,
  parseArticleMarkdown,
} from "../../lib/articleMarkdown";
import ArticleMarkdown from "./ArticleMarkdown";
import ContentCover from "./ContentCover";

type CareerArticleDetailContentProps = {
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

export default function CareerArticleDetailContent({
  article,
}: CareerArticleDetailContentProps) {
  const published = formatDate(article.published_at);
  const hasMarkdown = Boolean(article.content.trim());
  const cover = extractArticleCover(article.content);
  const skipLeadingImage = hasLeadingArticleImage(article.content);

  return (
    <article className="alumniArticle">
      <ContentCover
        variant="article"
        imageUrl={cover?.src}
        eyebrow="Career Basics"
        title={article.category}
        meta={`${article.read_minutes}分で読めます`}
      />

      <h1 className="alumniArticleTitle">{article.title}</h1>

      <div className="alumniArticleInfo">
        <span className="alumniCategoryLabel">{article.category}</span>
        <dl className="alumniArticleMeta">
          <div>
            <dt>公開日</dt>
            <dd>
              <time dateTime={article.published_at}>{published}</time>
            </dd>
          </div>
          <div>
            <dt>読了時間</dt>
            <dd>{article.read_minutes}分</dd>
          </div>
        </dl>
      </div>

      <div className="alumniArticleBody">
        {article.description && <p className="alumniLead">{article.description}</p>}
        {hasMarkdown ? (
          <ArticleMarkdown source={article.content} skipLeadingImage={skipLeadingImage} />
        ) : null}
      </div>
    </article>
  );
}

export const articleHeadings = (content: string) => parseArticleMarkdown(content).toc;
