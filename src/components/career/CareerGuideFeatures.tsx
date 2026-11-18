import { ArrowRight } from "lucide-react";
import type { GuideFeature } from "./careerGuideTypes";

type CareerGuideFeaturesProps = {
  title: string;
  lead: string;
  features: GuideFeature[];
};

export default function CareerGuideFeatures({
  title,
  lead,
  features,
}: CareerGuideFeaturesProps) {
  return (
    <section className="careerGuideFeatures" id="guide-content">
      <div className="careerGuideSectionHeading">
        <span>STEP BY STEP</span>
        <h2>{title}</h2>
        <p>{lead}</p>
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
              <span className="careerGuideFeatureLink">
                詳しく見る <ArrowRight aria-hidden="true" />
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
