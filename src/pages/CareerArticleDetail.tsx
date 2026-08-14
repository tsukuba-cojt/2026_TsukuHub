import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CareerArticleDetailContent from "../components/career/CareerArticleDetailContent";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { getPublishedCareerArticle } from "../services/contentService";
import { useUniversity } from "../components/university/universityContextValue";
import type { CareerArticleRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

export default function CareerArticleDetail() {
  const { id } = useParams();
  const { university, path } = useUniversity();
  const [article, setArticle] = useState<CareerArticleRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !university) return;
    void getPublishedCareerArticle(id, university.id)
      .then((item) => {
        if (item) setArticle(item);
      })
      .catch(() => setArticle(null))
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

  if (!article) {
    return (
      <div className="careerPlatform">
        <Globalnav />
        <main className="careerState">
          <h1>記事が見つかりません</h1>
          <Link to={path("/career")}>就活ページへ戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell careerStoryDetail careerArticleDetail">
        <Link className="careerBack" to={path("/career")}>
          <ArrowLeft aria-hidden="true" />就活ページへ戻る
        </Link>
        <CareerArticleDetailContent article={article} />
      </main>
      <Footer />
    </div>
  );
}
