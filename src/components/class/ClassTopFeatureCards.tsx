import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { classMenuItems } from "../utility/classMenuItems";
import "../../styles/class/ClassTop.css";
import "../../styles/utility/ComingSoon.css";
import { useUniversity } from "../university/universityContextValue";
import { COMING_SOON_NOTICE, isUniversityComingSoon } from "../../data/comingSoon";

// 3つの機能カード（講義検索／卒業要件チェック／みんなの時間割）。
// 項目・アイコン・遷移先は GlobalNav のドロップダウンと共有の classMenuItems を再利用。
function ClassTopFeatureCards() {
  const { path, isFeatureEnabled } = useUniversity();
  return (
    <section className="classTopFeatures">
      {classMenuItems.map((item) => {
        const comingSoon = isUniversityComingSoon(item.path, isFeatureEnabled);
        return (
        <div className={`classTopFeatureCard ${item.colorClass}${comingSoon ? " isComingSoon" : ""}`} key={item.label}>
          <span className="classTopFeatureIcon">
            <item.icon aria-hidden="true" />
          </span>
          <h2 className="classTopFeatureTitle">{item.label}</h2>
          <p className="classTopFeatureDesc">{item.description}</p>
          {comingSoon ? <span className="classTopFeatureBtn isComingSoon" role="link" aria-disabled="true" tabIndex={0}>
            準備中
            <span className="comingSoonTip" role="tooltip">{COMING_SOON_NOTICE}</span>
          </span> : <Link to={path(item.path)} className="classTopFeatureBtn">
            {item.ctaLabel}
            <ChevronRight aria-hidden="true" />
          </Link>}
        </div>
        );
      })}
    </section>
  );
}

export default ClassTopFeatureCards;
