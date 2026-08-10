import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../utility/Footer";
import Globalnav from "../utility/Globalnav";
import CareerGuideContent from "./CareerGuideContent";
import CareerGuideCta from "./CareerGuideCta";
import CareerGuideFeatures from "./CareerGuideFeatures";
import CareerGuideHero from "./CareerGuideHero";
import type { CareerGuidePageProps } from "./careerGuideTypes";
import "../../styles/career/CareerGuidePage.css";

export default function CareerGuidePage(props: CareerGuidePageProps) {
  return (
    <div className={`careerGuidePage is-${props.theme}`}>
      <Globalnav />
      <main>
        <div className="careerGuideContainer">
          <nav
            className="careerGuideBreadcrumb"
            aria-label="パンくずリスト"
          >
            <Link to="/">ホーム</Link>
            <ChevronRight aria-hidden="true" />
            <Link to="/career">就活・キャリア</Link>
            <ChevronRight aria-hidden="true" />
            <span>{props.title}</span>
          </nav>
          <CareerGuideHero
            eyebrow={props.eyebrow}
            title={props.title}
            lead={props.lead}
            icon={props.icon}
            heroNote={props.heroNote}
          />
          <CareerGuideFeatures
            title={props.featuresTitle}
            lead={props.featuresLead}
            features={props.features}
          />
          <CareerGuideContent
            articlesTitle={props.articlesTitle}
            articlesLead={props.articlesLead}
            articles={props.articles}
            checklistTitle={props.checklistTitle}
            checklist={props.checklist}
          />
          <CareerGuideCta
            title={props.ctaTitle}
            text={props.ctaText}
            label={props.ctaLabel}
            to={props.ctaTo}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export type {
  CareerGuidePageProps,
  GuideArticle,
  GuideFeature,
} from "./careerGuideTypes";
