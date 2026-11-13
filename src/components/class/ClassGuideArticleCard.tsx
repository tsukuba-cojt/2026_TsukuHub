import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { classGuideCategories } from "../../data/classGuideCategories";
import type { ClassGuideArticleRecord } from "../../types/classGuide";
import { extractArticleCover } from "../../lib/articleMarkdown";
import { useUniversity } from "../university/universityContextValue";

const defaultCoverByTheme = {
  strategy: "/data/dummy/dummy-internship-engineer.jpg",
  selection: "/data/dummy/dummy-internship-marketing.jpg",
} as const;

type ClassGuideArticleCardProps = {
  article: ClassGuideArticleRecord;
};

export default function ClassGuideArticleCard({ article }: ClassGuideArticleCardProps) {
  const { path } = useUniversity();
  const categoryLabel = classGuideCategories[article.category].label;
  const coverImage =
    article.cover_image_url
    ?? extractArticleCover(article.content)?.src
    ?? defaultCoverByTheme[article.cover_theme];

  return (
    <Link className="careerMiniCard" to={path(`/class/guide/${article.id}`)}>
      <div className={`careerMiniCover${coverImage ? " hasImage" : ""}`}>
        {coverImage ? <img src={coverImage} alt="" /> : null}
        <span>{article.badge_label ?? categoryLabel}</span>
      </div>
      <div className="careerMiniCardBody">
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <strong>
          詳細を見る <ArrowRight aria-hidden="true" />
        </strong>
      </div>
    </Link>
  );
}
