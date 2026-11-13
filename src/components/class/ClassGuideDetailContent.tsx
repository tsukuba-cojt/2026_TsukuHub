import type { ClassGuideArticleRecord } from "../../types/classGuide";
import {
  extractArticleCover,
  hasLeadingArticleImage,
} from "../../lib/articleMarkdown";
import ArticleMarkdown from "../career/ArticleMarkdown";
import { classGuideCategories } from "../../data/classGuideCategories";

type ClassGuideDetailContentProps = {
  article: ClassGuideArticleRecord;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replaceAll("-", "/");
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

export default function ClassGuideDetailContent({ article }: ClassGuideDetailContentProps) {
  const categoryLabel = classGuideCategories[article.category].label;
  const published = formatDate(article.published_at);
  const coverImage = article.cover_image_url ?? extractArticleCover(article.content)?.src;
  const skipLeadingImage = hasLeadingArticleImage(article.content);

  return (
    <article className="classGuideArticle">
      {coverImage ? (
        <div className="classGuideArticleCover">
          <img src={coverImage} alt="" />
        </div>
      ) : null}

      <span className="classGuideArticleCategory">{categoryLabel}</span>
      <h1 className="classGuideArticleTitle">{article.title}</h1>

      {article.description ? (
        <p className="classGuideArticleLead">{article.description}</p>
      ) : null}

      <div className="classGuideArticleMeta">
        <time dateTime={article.published_at}>{published}</time>
        <span>{article.read_minutes}分で読めます</span>
      </div>

      <div className="classGuideArticleBody">
        {article.content.trim() ? (
          <ArticleMarkdown source={article.content} skipLeadingImage={skipLeadingImage} />
        ) : null}
      </div>
    </article>
  );
}

export { parseArticleMarkdown as parseClassGuideMarkdown } from "../../lib/articleMarkdown";
