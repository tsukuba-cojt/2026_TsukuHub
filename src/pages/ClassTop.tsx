import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import ClassTopHero from "../components/class/ClassTopHero";
import ClassTopFeatureCards from "../components/class/ClassTopFeatureCards";
import ClassTopNews from "../components/class/ClassTopNews";
import "../styles/class/Class.css";
import "../styles/class/ClassTop.css";

function ClassTop() {
  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <ClassTopHero />
        <ClassTopFeatureCards />

        <div className="classTopColumns">
          <ClassTopNews />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ClassTop;
