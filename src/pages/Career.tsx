import { useEffect, useState } from "react";
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
import "../styles/class/ClassGuide.css";

export default function Career() {
  const { university } = useUniversity();
  const [featured, setFeatured] = useState<Internship[]>([]);
  const [articles, setArticles] = useState<CareerArticleRecord[]>([]);

  useEffect(() => {
    if (!university) return;
    void Promise.all([
      listPublishedInternships(university.id),
      listPublishedCareerArticles(university.id),
    ]).then(([items, nextArticles]) => {
      setFeatured(items.filter((item) => item.is_featured).slice(0, 3));
      setArticles(nextArticles.filter(isInternalCareerArticle).slice(0, 3));
    }).catch(() => { setFeatured([]); setArticles([]); });
  }, [university]);

  return (
    <div className="careerPage">
      <Globalnav />
      <main className="careerContainer">
        <CareerTopHero />
        <CareerCategoryGrid />
        <div className="classTopGuides">
          <CareerArticlePreview articles={articles} />
          <FeaturedInternships items={featured} />
          <AlumniStoryPreview />
        </div>
      </main>
      <Footer />
    </div>
  );
}
