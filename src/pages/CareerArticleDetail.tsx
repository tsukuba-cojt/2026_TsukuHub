import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CareerArticleDetailContent from "../components/career/CareerArticleDetailContent";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { fallbackCareerArticles } from "../data/careerFallbacks";
import { getPublishedCareerArticle } from "../services/contentService";
import type { CareerArticleRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

export default function CareerArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState<CareerArticleRecord | null>(
    () => fallbackCareerArticles.find((item) => item.id === id) ?? null,
  );
  const [loading, setLoading] = useState(!article);

  useEffect(() => {
    if (!id) return;
    void getPublishedCareerArticle(id)
      .then((item) => {
        if (item) setArticle(item);
      })
      .catch(() => {
        // Supabase取得失敗時は既存サンプルを維持する
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

  if (!article) {
    return (
      <div className="careerPlatform">
        <Globalnav />
        <main className="careerState">
          <h1>記事が見つかりません</h1>
          <Link to="/career">就活ページへ戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell careerStoryDetail careerArticleDetail">
        <Link className="careerBack" to="/career">
          <ArrowLeft aria-hidden="true" />就活ページへ戻る
        </Link>
        <CareerArticleDetailContent article={article} />
      </main>
      <Footer />
    </div>
  );
}
