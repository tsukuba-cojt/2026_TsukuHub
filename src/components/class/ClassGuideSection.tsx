import { ChevronRight, NotepadText, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

// セクション見出しのアイコン（カテゴリごと）
const categoryIcons: Record<ClassGuideCategory, LucideIcon> = {
  registration_strategy: TrendingUp,
  course_selection: NotepadText,
};

export default function ClassGuideSection({
  category,
  articles,
}: ClassGuideSectionProps) {
  const { path } = useUniversity();
  const meta = classGuideCategories[category];
  const HeadingIcon = categoryIcons[category];
  const previewItems = articles.slice(0, 3);

  return (
    <section className="classGuidePanel">
      <div className="classGuidePanelHead">
        <h2 className="classGuidePanelTitle">
          <HeadingIcon aria-hidden="true" />
          {meta.label}
        </h2>
        <Link className="classGuidePanelMore" to={path(`/class/guides/${meta.slug}`)}>
          {meta.label}一覧を見る
          <ChevronRight aria-hidden="true" />
        </Link>
      </div>
      {previewItems.length > 0 ? (
        <div className="careerMiniGrid">
          {previewItems.map((article) => (
            <ClassGuideArticleCard article={article} key={article.id} />
          ))}
        </div>
      ) : (
        <div className="careerInlineState">まだ掲載されている記事はありません。</div>
      )}
    </section>
  );
}
