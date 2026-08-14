import { useEffect, useState } from "react";
import Globalnav from "../components/utility/Globalnav";
import Hero from "../components/home/Hero";
import CategorySection from "../components/home/CategorySection";
import NewsBar from "../components/home/NewsBar";
import TopicSection from "../components/home/TopicSection";
import LatestNewsSection from "../components/home/LatestNewSection";
import RankingSection from "../components/home/RankingSection";
import CtaSection from "../components/home/CtaSection";
import CompanyScroll from "../components/home/CompanyScroll";
import Footer from "../components/utility/Footer";
import "../styles/home/Home.css";
import { useAuth } from "../components/auth/authContextValue";
import { useUniversity } from "../components/university/universityContextValue";
import { listPublishedNews } from "../services/newsService";
import type { NewsItemRecord } from "../types/news";

function Home() {
  const { user } = useAuth();
  const { university } = useUniversity();
  const [news, setNews] = useState<NewsItemRecord[]>([]);
  const [topics, setTopics] = useState<NewsItemRecord[]>([]);

  useEffect(() => {
    if (!university) return;
    void Promise.all([
      listPublishedNews(university.id, "news"),
      listPublishedNews(university.id, "topic"),
    ]).then(([nextNews, nextTopics]) => {
      setNews(nextNews);
      setTopics(nextTopics);
    }).catch(() => {
      setNews([]);
      setTopics([]);
    });
  }, [university]);

  return (
    <div className="homepage">
      <Globalnav />
      <Hero />
      <CategorySection />
      <NewsBar title={news[0]?.title} />

      <main 
        className="homepageLayout" 
        style={{ 
          height: '500px',          /* ① 高さをここで決める（minHeightでも可） */
          width: '100%',            /* ① 横幅をここで決める（minWidthでも可） */
          display: 'flex',          /* ② Flexboxを有効にする */
          justifyContent: 'center', /* ③ 横並びにした要素全体を「中央揃え」にする */
          gap: '24px'               /* ④ コンポーネント間の隙間（お好みの数値に） */
        }}
      >
        <TopicSection topics={topics} />
        <LatestNewsSection newsItems={news} />
        <RankingSection />
      </main>

      <CtaSection user={user} />
      <CompanyScroll />
      <Footer />
    </div>
  );
}

export default Home;
