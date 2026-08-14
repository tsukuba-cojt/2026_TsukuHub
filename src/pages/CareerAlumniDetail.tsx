import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AlumniStoryDetail from "../components/career/AlumniStoryDetail";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { getPublishedAlumniStory } from "../services/contentService";
import { useUniversity } from "../components/university/universityContextValue";
import type { AlumniStoryRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

export default function CareerAlumniDetail() {
  const { id } = useParams();
  const { university, path } = useUniversity();
  const [story, setStory] = useState<AlumniStoryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !university) return;
    void getPublishedAlumniStory(id, university.id)
      .then((item) => {
        if (item) setStory(item);
      })
      .catch(() => setStory(null))
      .finally(() => setLoading(false));
  }, [id, university]);

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
          <Link to={path("/career/alumni")}>一覧へ戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell careerStoryDetail">
        <Link className="careerBack" to={path("/career/alumni")}>
          <ArrowLeft aria-hidden="true" />体験記一覧へ
        </Link>
        <AlumniStoryDetail story={story} />
      </main>
      <Footer />
    </div>
  );
}
