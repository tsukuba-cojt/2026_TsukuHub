import { Utensils } from "lucide-react";
import "../../styles/class/ClassTop.css";
import "../../styles/life/Life.css";

// 生活・便利情報トップページのヒーローセクション（ClassTopHero と同じ構造）
function LifeTopHero() {
  return (
    <section className="classTopHero lifeTopHero">
      <div className="classTopHeroText">
        <h1 className="classTopHeroTitle">
          <Utensils aria-hidden="true" />
          生活・便利情報
        </h1>
        <p className="classTopHeroDesc">
          学食や住まいなど、筑波での生活に役立つ情報をまとめています
        </p>
      </div>
    </section>
  );
}

export default LifeTopHero;
