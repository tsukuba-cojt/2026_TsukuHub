import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { classMenuItems } from "../utility/classMenuItems";
import "../../styles/class/ClassTop.css";
import "../../styles/utility/ComingSoon.css";
import "../../styles/utility/HubFeatureCards.css";
import { useUniversity } from "../university/universityContextValue";
import { COMING_SOON_NOTICE, isUniversityComingSoon } from "../../data/comingSoon";

function ClassTopFeatureCards() {
  const { path, isFeatureEnabled } = useUniversity();
  return (
    <section className="hubFeatureGrid classTopFeatures">
      {classMenuItems.map((item) => {
        const comingSoon = isUniversityComingSoon(item.path, isFeatureEnabled);
        return (
        <div className={`hubFeatureCard ${item.colorClass}${comingSoon ? " isComingSoon" : ""}`} key={item.label}>
          <span className="hubFeatureIcon">
            <item.icon aria-hidden="true" />
          </span>
          <h2 className="hubFeatureTitle">{item.label}</h2>
          <p className="hubFeatureDesc">{item.description}</p>
          {comingSoon ? <span className="hubFeatureBtn isComingSoon" role="link" aria-disabled="true" tabIndex={0}>
            準備中
            <span className="comingSoonTip" role="tooltip">{COMING_SOON_NOTICE}</span>
          </span> : <Link to={path(item.path)} className="hubFeatureBtn">
            {item.ctaLabel}
            <ArrowRight aria-hidden="true" />
          </Link>}
        </div>
        );
      })}
    </section>
  );
}

export default ClassTopFeatureCards;
