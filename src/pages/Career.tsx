import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AlumniStoryPreview from "../components/career/AlumniStoryPreview";
import CareerArticlePreview from "../components/career/CareerArticlePreview";
import CareerCategoryGrid from "../components/career/CareerCategoryGrid";
import CareerTopHero from "../components/career/CareerTopHero";
import FeaturedInternships from "../components/career/FeaturedInternships";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { isInternalCareerArticle } from "../lib/articleMarkdown";
import { listPublishedInternships } from "../services/careerService";
import { listPublishedCareerArticles } from "../services/contentService";
import type { Internship } from "../types/career";
import type { CareerArticleRecord } from "../types/content";
import { useUniversity } from "../components/university/universityContextValue";
import "../styles/career/Career.css";
import "../styles/career/CareerPlatform.css";

export default function Career() {
  const { university, path } = useUniversity();
  const [featured, setFeatured] = useState<Internship[]>([]);
  const [articles, setArticles] = useState<CareerArticleRecord[]>([]);

  useEffect(() => {
    if (!university) return;
    void Promise.all([
      listPublishedInternships(university.id),
      listPublishedCareerArticles(university.id),
    ]).then(([items, nextArticles]) => {
      setFeatured(items.filter((item) => item.is_featured).slice(0, 3));
      setArticles(nextArticles.filter(isInternalCareerArticle).slice(0, 6));
    }).catch(() => { setFeatured([]); setArticles([]); });
  }, [university]);

  return (
    <div className="careerPage">
      <Globalnav />
      <main className="careerContainer">
        <CareerTopHero />
        <CareerCategoryGrid />
        <section className="careerHomeSection">
          <div className="careerSectionHeading">
            <span>CAREER BASICS</span>
            <h2>就活・長期インターンの基礎知識</h2>
          </div>
          {articles.length > 0 ? (
            <>
              <CareerArticlePreview articles={articles} />
              <p className="alumniPreviewMore">
                <Link className="careerPrimaryButton" to={path("/career/basics")}>
                  基礎知識一覧を見る
                  <ArrowRight aria-hidden="true" />
                </Link>
              </p>
            </>
          ) : (
            <div className="careerInlineState">まだ掲載がありません。</div>
          )}
        </section>
        <FeaturedInternships items={featured} />
        <AlumniStoryPreview />
      </main>
      <Footer />
    </div>
  );
}
