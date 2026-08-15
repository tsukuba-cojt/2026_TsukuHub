import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ClassGuideCategory } from "../../data/classGuideCategories";
import { classGuideCategories } from "../../data/classGuideCategories";
import type { ClassGuideArticleRecord } from "../../types/classGuide";
import { useUniversity } from "../university/universityContextValue";
import ClassGuideArticleCard from "./ClassGuideArticleCard";

type ClassGuideSectionProps = {
  category: ClassGuideCategory;
  articles: ClassGuideArticleRecord[];
};

export default function ClassGuideSection({
  category,
  articles,
}: ClassGuideSectionProps) {
  const { path } = useUniversity();
  const meta = classGuideCategories[category];
  const previewItems = articles.slice(0, 3);

  return (
    <section className="careerHomeSection classGuideHomeSection">
      <div className="careerSectionHeading">
        <span>{meta.sectionLabel}</span>
        <h2>{meta.label}</h2>
      </div>
      {previewItems.length > 0 ? (
        <>
          <div className="careerMiniGrid">
            {previewItems.map((article) => (
              <ClassGuideArticleCard article={article} key={article.id} />
            ))}
          </div>
          <p className="alumniPreviewMore">
            <Link className="careerPrimaryButton" to={path(`/class/guides/${meta.slug}`)}>
              {meta.label}一覧を見る
              <ArrowRight aria-hidden="true" />
            </Link>
          </p>
        </>
      ) : (
        <div className="careerInlineState">まだ掲載されている記事はありません。</div>
      )}
    </section>
  );
}
