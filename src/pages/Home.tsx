import Header from "../components/utility/Header";
import Hero from "../components/home/Hero";
import CategorySection from "../components/utility/CategorySection";
import NewsBar from "../components/home/NewsBar";
import TopicSection from "../components/home/TopicSection";
import LatestNewsSection from "../components/home/LatestNewSection";
import RankingSection from "../components/home/RankingSection";
import CtaSection from "../components/home/CtaSection";

function Home() {
  return (
    <div className="homepage">
      <Header />
      <Hero />
      <CategorySection />
      <NewsBar />

      <main className="homepageLayout">
        <TopicSection />
        <LatestNewsSection />
        <RankingSection />
      </main>

      <CtaSection />
    </div>
  );
}

export default Home;