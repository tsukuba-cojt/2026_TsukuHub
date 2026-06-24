import { useEffect, useState } from "react";
import { createClient, type User } from "@supabase/supabase-js";
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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="homepage">
      <Globalnav />
      <Hero />
      <CategorySection />
      <NewsBar />

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
        <TopicSection />
        <LatestNewsSection />
        <RankingSection />
      </main>

      <CtaSection user={user} />
      <CompanyScroll />
      <Footer />
    </div>
  );
}

export default Home;
