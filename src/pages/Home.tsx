import Header from "../components/Header";
import Hero from "../components/Hero";
import CategorySection from "../components/CategoryCard";
import NewsBar from "../components/NewsBar";
import TopicSection from "../components/TopicSection";
import LatestNewsSection from "../components/LatestNewSection";
import RankingSection from "../components/RankingSection";
import CtaSection from "../components/CtaSection";
import "../styles/App.css";

function Home() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <CategorySection />
      <NewsBar />

      <main className="mainLayout">
        <TopicSection />
        <LatestNewsSection />
        <RankingSection />
      </main>

      <CtaSection />
    </div>
  );
}

export default Home;