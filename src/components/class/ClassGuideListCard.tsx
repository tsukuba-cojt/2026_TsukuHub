import { Link } from "react-router-dom";
import { classGuideCategories } from "../../data/classGuideCategories";
import type { ClassGuideArticleRecord } from "../../types/classGuide";
import { extractArticleCover } from "../../lib/articleMarkdown";
import { useUniversity } from "../university/universityContextValue";

const defaultCoverByTheme = {
  strategy: "/data/dummy/dummy-internship-engineer.jpg",
  selection: "/data/dummy/dummy-internship-marketing.jpg",
} as const;

type ClassGuideListCardProps = {
  article: ClassGuideArticleRecord;
};

export default function ClassGuideListCard({ article }: ClassGuideListCardProps) {
  const { path } = useUniversity();
  const categoryLabel = classGuideCategories[article.category].label;
  const coverImage =
    article.cover_image_url
    ?? extractArticleCover(article.content)?.src
    ?? defaultCoverByTheme[article.cover_theme];

  return (
    <article className="classGuideListCard">
      <Link className="classGuideListCardLink" to={path(`/class/guide/${article.id}`)}>
        <div className={`classGuideListCardCover is${article.cover_theme === "strategy" ? "Strategy" : "Selection"}`}>
          {coverImage ? <img src={coverImage} alt="" /> : null}
        </div>
        <div className="classGuideListCardBody">
          <h3>{article.title}</h3>
          <span className="classGuideListCardTag">{categoryLabel}</span>
        </div>
      </Link>
    </article>
  );
}
