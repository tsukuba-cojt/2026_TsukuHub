import { PageSeo } from "../seo/PageSeo";
import { classTopMetadata } from "../seo/metadata";
import { useUniversity } from "../components/university/universityContextValue";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import ClassTopHero from "../components/class/ClassTopHero";
import ClassTopFeatureCards from "../components/class/ClassTopFeatureCards";
import ClassTopGuides from "../components/class/ClassTopGuides";
import "../styles/class/Class.css";
import "../styles/class/ClassTop.css";
import "../styles/class/ClassGuide.css";

function ClassTop() {
  const { university } = useUniversity();
  return (
    <div className="classPage">
      {university && <PageSeo {...classTopMetadata(university.slug, university.name)} />}
      <Globalnav />
      <main className="classPageLayout">
        <ClassTopHero />
        <ClassTopFeatureCards />
        <ClassTopGuides />
      </main>
      <Footer />
    </div>
  );
}

export default ClassTop;
