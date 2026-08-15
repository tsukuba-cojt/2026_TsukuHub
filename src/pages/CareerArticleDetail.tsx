import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ArticleToc from "../components/career/ArticleToc";
import CareerArticleDetailContent, {
  articleHeadings,
} from "../components/career/CareerArticleDetailContent";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { isInternalCareerArticle } from "../lib/articleMarkdown";
import {
  getPublishedCareerArticle,
  listPublishedCareerArticles,
} from "../services/contentService";
import { useUniversity } from "../components/university/universityContextValue";
import type { CareerArticleRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

export default function CareerArticleDetail() {
  const { id } = useParams();
  const { university, path } = useUniversity();
  const [article, setArticle] = useState<CareerArticleRecord | null>(null);
  const [related, setRelated] = useState<CareerArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !university) return;
    void Promise.all([
      getPublishedCareerArticle(id, university.id),
      listPublishedCareerArticles(university.id),
    ])
      .then(([item, articles]) => {
        setArticle(item);
        setRelated(
          articles
            .filter((entry) => entry.id !== id && isInternalCareerArticle(entry))
            .slice(0, 3),
        );
      })
      .catch(() => {
        setArticle(null);
        setRelated([]);
      })
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
          <Link to={path("/career/basics")}>一覧へ戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const headings = articleHeadings(article.content);

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell alumniStoryPage">
        <nav className="careerBreadcrumb" aria-label="パンくずリスト">
          <Link to={path("/career")}>キャリア・インターン</Link>
          <ChevronRight aria-hidden="true" />
          <Link to={path("/career/basics")}>基礎知識</Link>
          <ChevronRight aria-hidden="true" />
          <span>{article.title}</span>
        </nav>

        <div className="alumniArticleLayout">
          <CareerArticleDetailContent article={article} />

          <aside className="alumniSidebar">
            <ArticleToc headings={headings} />
            <div className="alumniSidebarCta">
              <p>就活の進め方を、基礎知識から確認できます。</p>
              <Link className="careerPrimaryButton" to={path("/career/basics")}>
                基礎知識一覧を見る
              </Link>
              <Link className="alumniSidebarSubLink" to={path("/career/internships")}>
                長期インターンを探す
              </Link>
            </div>

            {related.length > 0 && (
              <section className="alumniRelated">
                <h2>ほかの記事</h2>
                <ul>
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link to={path(`/career/articles/${item.id}`)}>
                        <span>{item.category}</span>
                        <strong>{item.title}</strong>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
