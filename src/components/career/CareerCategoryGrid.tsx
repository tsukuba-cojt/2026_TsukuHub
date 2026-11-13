import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUniversity } from "../university/universityContextValue";
import { COMING_SOON_NOTICE, isUniversityComingSoon } from "../../data/comingSoon";
import "../../styles/utility/ComingSoon.css";
import "../../styles/utility/HubFeatureCards.css";

const categories = [
  {
    icon: BookOpenCheck,
    title: "就活・長期インターンの基礎知識",
    description: "就活の進め方、長期インターンの探し方、ESや面接の基本を学べる。",
    to: "/career/basics",
    className: "isBlue",
  },
  {
    icon: BriefcaseBusiness,
    title: "長期インターン情報",
    description: "筑波大生におすすめの長期インターンを確認し、そのまま応募できる。",
    to: "/career/internships",
    className: "isGreen",
  },
  {
    icon: GraduationCap,
    title: "卒業生のキャリア・体験記",
    description: "筑波大学の卒業生がどのように就活し、キャリアを選んだかを知る。",
    to: "/career/alumni",
    className: "isPurple",
  },
];

export default function CareerCategoryGrid() {
  const { university, path, isFeatureEnabled } = useUniversity();
  return (
    <section className="careerCategories" aria-label="キャリア・インターンのメニュー">
      <div className="hubFeatureGrid">
        {categories.map(({ icon: Icon, ...item }) => {
          const comingSoon = isUniversityComingSoon(item.to, isFeatureEnabled);
          return (
          <article
            className={`hubFeatureCard ${item.className}${comingSoon ? " isComingSoon" : ""}`}
            key={item.to}
          >
            <span className="hubFeatureIcon">
              <Icon aria-hidden="true" />
            </span>
            <h3 className="hubFeatureTitle">{item.title}</h3>
            <p className="hubFeatureDesc">{item.description.replace("筑波大生", `${university?.short_name}生`).replace("筑波大学", university?.name ?? "大学")}</p>
            {comingSoon ? <span className="hubFeatureBtn isComingSoon" role="link" aria-disabled="true" tabIndex={0}>
              準備中
              <span className="comingSoonTip" role="tooltip">{COMING_SOON_NOTICE}</span>
            </span> : <Link className="hubFeatureBtn" to={path(item.to)}>
              詳しく見る
              <ArrowRight aria-hidden="true" />
            </Link>}
          </article>
          );
        })}
      </div>
    </section>
  );
}
