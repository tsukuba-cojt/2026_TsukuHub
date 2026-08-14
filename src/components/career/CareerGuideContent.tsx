import { ArrowRight, CalendarDays, Check, Clock3 } from "lucide-react";
import type { GuideArticle } from "./careerGuideTypes";

type CareerGuideContentProps = {
  articlesTitle: string;
  articlesLead: string;
  articles: GuideArticle[];
  checklistTitle: string;
  checklist: string[];
};

export default function CareerGuideContent({
  articlesTitle,
  articlesLead,
  articles,
  checklistTitle,
  checklist,
}: CareerGuideContentProps) {
  return (
    <section className="careerGuideContent">
      <div className="careerGuideArticles">
        <div className="careerGuideSectionHeading">
          <span>RECOMMENDED</span>
          <h2>{articlesTitle}</h2>
          <p>{articlesLead}</p>
        </div>
        <div className="careerGuideArticleList">
          {articles.map((article) => (
            <article className="careerGuideArticle" key={article.title}>
              <div className="careerGuideArticleTop">
                <span
                  style={
                    { "--article-accent": article.accent } as React.CSSProperties
                  }
                >
                  {article.tag}
                </span>
                <span>
                  <Clock3 aria-hidden="true" />
                  {article.meta}
                </span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <button type="button">
                記事を読む <ArrowRight aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </div>

      <aside className="careerGuideChecklist">
        <span className="careerGuideChecklistIcon">
          <Check aria-hidden="true" />
        </span>
        <p className="careerGuideChecklistLabel">CHECK LIST</p>
        <h2>{checklistTitle}</h2>
        <ul>
          {checklist.map((item) => (
            <li key={item}>
              <Check aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="careerGuideChecklistNote">
          <CalendarDays aria-hidden="true" />
          自分のペースで、一つずつ進めれば大丈夫です。
        </p>
      </aside>
    </section>
  );
}
