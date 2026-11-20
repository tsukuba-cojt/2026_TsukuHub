import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import LifeTopHero from "../components/life/LifeTopHero";
import LifeCategoryGrid from "../components/life/LifeCategoryGrid";
import "../styles/class/Class.css";
import "../styles/class/ClassTop.css";
import "../styles/life/Life.css";

// 生活・便利情報トップページ（/life）。
// 構成は講義・履修トップ（ClassTop.tsx）／キャリアトップ（Career.tsx）と同じ。
function Life() {
  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <LifeTopHero />
        <LifeCategoryGrid />
      </main>
      <Footer />
    </div>
  );
}

export default Life;
