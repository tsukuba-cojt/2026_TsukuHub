import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ArticleToc from "../components/career/ArticleToc";
import ClassGuideArticleCard from "../components/class/ClassGuideArticleCard";
import ClassGuideDetailContent from "../components/class/ClassGuideDetailContent";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { parseClassGuideMarkdown } from "../components/class/ClassGuideDetailContent";
import { classGuideCategories } from "../data/classGuideCategories";
import {
  getPublishedClassGuide,
  listPublishedClassGuides,
} from "../services/classGuideService";
import { useUniversity } from "../components/university/universityContextValue";
import type { ClassGuideArticleRecord } from "../types/classGuide";
import "../styles/class/Class.css";
import "../styles/class/ClassGuide.css";
import "../styles/career/CareerPlatform.css";

export default function ClassGuideDetail() {
  const { id } = useParams();
  const { university, path } = useUniversity();
  const [article, setArticle] = useState<ClassGuideArticleRecord | null>(null);
  const [related, setRelated] = useState<ClassGuideArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !university) return;
    void Promise.all([
      getPublishedClassGuide(id, university.id),
      listPublishedClassGuides(university.id),
    ])
      .then(([item, articles]) => {
        setArticle(item);
        setRelated(
          articles
            .filter((entry) => entry.id !== id && entry.category === item?.category)
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
      <div className="classPage">
        <Globalnav />
        <main className="classPageLayout classGuideDetailPage careerState">読み込んでいます...</main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="classPage">
        <Globalnav />
        <main className="classPageLayout classGuideDetailPage careerState">
          <h1>記事が見つかりません</h1>
          <Link to={path("/class/top")}>授業・履修トップへ戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryMeta = classGuideCategories[article.category];
  const headings = parseClassGuideMarkdown(article.content).toc;

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout classGuideDetailPage">
        <nav className="careerBreadcrumb" aria-label="パンくずリスト">
          <Link to={path("/class/top")}>授業・履修</Link>
          <ChevronRight aria-hidden="true" />
          <Link to={path(`/class/guides/${categoryMeta.slug}`)}>{categoryMeta.label}</Link>
          <ChevronRight aria-hidden="true" />
          <span>{article.title.replace(/^ダミー｜/, "")}</span>
        </nav>

        <div className="alumniArticleLayout classGuideArticleLayout">
          <ClassGuideDetailContent article={article} />

          <aside className="alumniSidebar classGuideSidebar">
            <ArticleToc headings={headings} />
            <div className="alumniSidebarCta">
              <p>{categoryMeta.label}の記事をもっと読む</p>
              <Link className="careerPrimaryButton" to={path(`/class/guides/${categoryMeta.slug}`)}>
                一覧ページへ
              </Link>
              <Link className="alumniSidebarSubLink" to={path("/class/top")}>
                授業・履修トップへ戻る
              </Link>
            </div>

            {related.length > 0 && (
              <section className="alumniRelated">
                <h2>ほかの記事</h2>
                <ul>
                  {related.map((entry) => (
                    <li key={entry.id}>
                      <Link to={path(`/class/guide/${entry.id}`)}>
                        <span>{categoryMeta.label}</span>
                        <strong>{entry.title}</strong>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="careerHomeSection classGuideRelatedSection">
            <div className="careerSectionHeading">
              <span>{categoryMeta.sectionLabel}</span>
              <h2>あわせて読みたい{categoryMeta.label}</h2>
            </div>
            <div className="careerMiniGrid">
              {related.map((entry) => (
                <ClassGuideArticleCard article={entry} key={entry.id} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
