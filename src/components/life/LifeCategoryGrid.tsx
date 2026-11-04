import { ChevronRight, CookingPot, HandHeart, House } from "lucide-react";
import { Link } from "react-router-dom";
import { useUniversity } from "../university/universityContextValue";
import { COMING_SOON_NOTICE, isUniversityComingSoon } from "../../data/comingSoon";
import "../../styles/utility/ComingSoon.css";
import "../../styles/class/ClassTop.css";

// 生活・便利情報の3機能カード（CareerCategoryGrid と同じ構造・スタイル）。
// /life/cafeteria・/life/housing は未実装のため App.tsx に未登録。
// クリック時は InternalLinkGuard が遷移を止め「準備中」トーストを出す。
// ページ実装時に App.tsx と comingSoon.ts の KNOWN_STATIC_PATHS へ登録すれば導線が有効になる。
// 譲り合い（/life/sharing）は comingSoon.ts の COMING_SOON_PATHS で準備中扱い。
const categories = [
  {
    icon: CookingPot,
    title: "学食情報",
    description: "食堂の場所・混雑・メニュー・口コミをチェック",
    to: "/life/cafeteria",
    ctaLabel: "学食情報を見る",
  },
  {
    icon: House,
    title: "住まい情報",
    description: "エリアの特徴や部屋探しのスケジュールを確認",
    to: "/life/housing",
    ctaLabel: "住まい情報を見る",
  },
  {
    icon: HandHeart,
    title: "譲り合い",
    description: "不要になったものを学生同士で譲り合い",
    to: "/life/sharing",
    ctaLabel: "譲り合いを見る",
  },
];

export default function LifeCategoryGrid() {
  const { path, isFeatureEnabled } = useUniversity();
  return (
    <section className="lifeCategories" aria-label="生活・便利情報のメニュー">
      <div className="classTopFeatures">
        {categories.map(({ icon: Icon, ...item }) => {
          const comingSoon = isUniversityComingSoon(item.to, isFeatureEnabled);
          return (
            <article
              className={`classTopFeatureCard isYellow${comingSoon ? " isComingSoon" : ""}`}
              key={item.to}
            >
              <span className="classTopFeatureIcon">
                <Icon aria-hidden="true" />
              </span>
              <h2 className="classTopFeatureTitle">{item.title}</h2>
              <p className="classTopFeatureDesc">{item.description}</p>
              {comingSoon ? (
                <span className="classTopFeatureBtn isComingSoon" role="link" aria-disabled="true" tabIndex={0}>
                  準備中
                  <span className="comingSoonTip" role="tooltip">{COMING_SOON_NOTICE}</span>
                </span>
              ) : (
                <Link className="classTopFeatureBtn" to={path(item.to)}>
                  {item.ctaLabel}
                  <ChevronRight aria-hidden="true" />
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
