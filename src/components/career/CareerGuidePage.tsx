import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
} from "lucide-react";
import Globalnav from "../utility/Globalnav";
import Footer from "../utility/Footer";
import "../../styles/career/CareerGuidePage.css";

export type GuideArticle = {
  tag: string;
  title: string;
  description: string;
  meta: string;
  accent?: string;
};

export type GuideFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type CareerGuidePageProps = {
  theme: "blue" | "green" | "purple";
  eyebrow: string;
  title: string;
  lead: string;
  icon: LucideIcon;
  heroNote: string;
  featuresTitle: string;
  featuresLead: string;
  features: GuideFeature[];
  articlesTitle: string;
  articlesLead: string;
  articles: GuideArticle[];
  checklistTitle: string;
  checklist: string[];
  ctaTitle: string;
  ctaText: string;
  ctaLabel: string;
  ctaTo: string;
};

function CareerGuidePage({
  theme,
  eyebrow,
  title,
  lead,
  icon: HeroIcon,
  heroNote,
  featuresTitle,
  featuresLead,
  features,
  articlesTitle,
  articlesLead,
  articles,
  checklistTitle,
  checklist,
  ctaTitle,
  ctaText,
  ctaLabel,
  ctaTo,
}: CareerGuidePageProps) {
  return (
    <div className={`careerGuidePage is-${theme}`}>
      <Globalnav />
      <main>
        <div className="careerGuideContainer">
          <nav className="careerGuideBreadcrumb" aria-label="パンくずリスト">
            <Link to="/">ホーム</Link><ChevronRight aria-hidden="true" />
            <Link to="/career">就活・キャリア</Link><ChevronRight aria-hidden="true" />
            <span>{title}</span>
          </nav>

          <section className="careerGuideHero">
            <div className="careerGuideHeroCopy">
              <span className="careerGuideEyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p>{lead}</p>
              <a href="#guide-content" className="careerGuideHeroButton">
                まずはここから <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <div className="careerGuideHeroVisual" aria-hidden="true">
              <span className="careerGuideHeroIcon"><HeroIcon /></span>
              <p>{heroNote}</p>
              <span className="careerGuideOrb orbOne" />
              <span className="careerGuideOrb orbTwo" />
            </div>
          </section>

          <section className="careerGuideFeatures" id="guide-content">
            <div className="careerGuideSectionHeading">
              <span>STEP BY STEP</span>
              <h2>{featuresTitle}</h2>
              <p>{featuresLead}</p>
            </div>
            <div className="careerGuideFeatureGrid">
              {features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <article className="careerGuideFeature" key={feature.title}>
                    <span className="careerGuideFeatureNumber">0{index + 1}</span>
                    <FeatureIcon aria-hidden="true" />
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <span className="careerGuideFeatureLink">詳しく見る <ArrowRight /></span>
                  </article>
                );
              })}
            </div>
          </section>

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
                      <span style={{ "--article-accent": article.accent } as React.CSSProperties}>
                        {article.tag}
                      </span>
                      <span><Clock3 aria-hidden="true" />{article.meta}</span>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>
                    <button type="button">記事を読む <ArrowRight aria-hidden="true" /></button>
                  </article>
                ))}
              </div>
            </div>

            <aside className="careerGuideChecklist">
              <span className="careerGuideChecklistIcon"><Check aria-hidden="true" /></span>
              <p className="careerGuideChecklistLabel">CHECK LIST</p>
              <h2>{checklistTitle}</h2>
              <ul>
                {checklist.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}
              </ul>
              <p className="careerGuideChecklistNote">
                <CalendarDays aria-hidden="true" />
                自分のペースで、一つずつ進めれば大丈夫です。
              </p>
            </aside>
          </section>

          <section className="careerGuideCta">
            <span><MapPin aria-hidden="true" /></span>
            <div><h2>{ctaTitle}</h2><p>{ctaText}</p></div>
            <Link to={ctaTo}>{ctaLabel}<ArrowRight aria-hidden="true" /></Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CareerGuidePage;
