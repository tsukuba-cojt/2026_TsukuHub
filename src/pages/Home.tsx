import { useEffect, useState } from "react";
import { createClient, type User } from "@supabase/supabase-js";
import Header from "../components/Header";
import Hero from "../components/Hero";
import CategorySection from "../components/CategoryCard";
import NewsBar from "../components/NewsBar";
import TopicSection from "../components/TopicSection";
import LatestNewsSection from "../components/LatestNewSection";
import RankingSection from "../components/RankingSection";
import CtaSection from "../components/CtaSection";
import "../styles/App.css";

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      <Hero />
      <CategorySection />
      <NewsBar />

      <main className="mainLayout">
        <TopicSection />
        <LatestNewsSection />
        <RankingSection />
      </main>

      <CtaSection user={user} />
    </div>
  );
}

export default Home;