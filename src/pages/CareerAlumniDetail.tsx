import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AlumniStoryDetail from "../components/career/AlumniStoryDetail";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { fallbackAlumniStories } from "../data/careerFallbacks";
import { getPublishedAlumniStory } from "../services/contentService";
import type { AlumniStoryRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

export default function CareerAlumniDetail() {
  const { id } = useParams();
  const [story, setStory] = useState<AlumniStoryRecord | null>(
    () => fallbackAlumniStories.find((item) => item.id === id) ?? null,
  );
  const [loading, setLoading] = useState(!story);

  useEffect(() => {
    if (!id) return;
    void getPublishedAlumniStory(id)
      .then((item) => {
        if (item) setStory(item);
      })
      .catch(() => {
        // Supabase取得失敗時はフォールバックを維持する
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="careerPlatform">
        <Globalnav />
        <main className="careerState">読み込んでいます...</main>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="careerPlatform">
        <Globalnav />
        <main className="careerState">
          <h1>体験記が見つかりません</h1>
          <Link to="/career/alumni">一覧へ戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell careerStoryDetail">
        <Link className="careerBack" to="/career/alumni">
          <ArrowLeft aria-hidden="true" />体験記一覧へ
        </Link>
        <AlumniStoryDetail story={story} />
      </main>
      <Footer />
    </div>
  );
}
