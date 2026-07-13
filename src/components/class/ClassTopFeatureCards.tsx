import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { classMenuItems } from "../utility/classMenuItems";
import "../../styles/class/ClassTop.css";

// 3つの機能カード（講義検索／卒業要件チェック／みんなの時間割）。
// 項目・アイコン・遷移先は GlobalNav のドロップダウンと共有の classMenuItems を再利用。
function ClassTopFeatureCards() {
  return (
    <section className="classTopFeatures">
      {classMenuItems.map((item) => (
        <div className={`classTopFeatureCard ${item.colorClass}`} key={item.label}>
          <span className="classTopFeatureIcon">
            <item.icon aria-hidden="true" />
          </span>
          <h2 className="classTopFeatureTitle">{item.label}</h2>
          <p className="classTopFeatureDesc">{item.description}</p>
          <Link to={item.path} className="classTopFeatureBtn">
            {item.ctaLabel}
            <ChevronRight aria-hidden="true" />
          </Link>
        </div>
      ))}
    </section>
  );
}

export default ClassTopFeatureCards;
