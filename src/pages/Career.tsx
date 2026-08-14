import { useEffect, useState } from "react";
import AlumniStoryPreview from "../components/career/AlumniStoryPreview";
import CareerCategoryGrid from "../components/career/CareerCategoryGrid";
import CareerTopHero from "../components/career/CareerTopHero";
import FeaturedInternships from "../components/career/FeaturedInternships";
import NoteArticleEmbed from "../components/career/NoteArticleEmbed";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { listPublishedInternships } from "../services/careerService";
import { listPublishedCareerArticles } from "../services/contentService";
import type { CareerNoteArticle } from "../data/careerNoteArticles";
import type { Internship } from "../types/career";
import { useUniversity } from "../components/university/universityContextValue";
import "../styles/career/Career.css";
import "../styles/career/CareerPlatform.css";

export default function Career() {
  const { university } = useUniversity();
  const [featured, setFeatured] = useState<Internship[]>([]);
  const [noteArticles, setNoteArticles] = useState<CareerNoteArticle[]>([]);

  useEffect(() => {
    if (!university) return;
    void Promise.all([
      listPublishedInternships(university.id),
      listPublishedCareerArticles(university.id),
    ]).then(([items, articles]) => {
      setFeatured(items.filter((item) => item.is_featured).slice(0, 3));
      setNoteArticles(articles.filter((item) => item.source_type === "external" && item.external_url).map((item) => ({ noteId: item.external_url!.split("/").pop() ?? "", title: item.title })));
    }).catch(() => { setFeatured([]); setNoteArticles([]); });
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
          {noteArticles.length > 0 ? <NoteArticleEmbed articles={noteArticles} /> : <div className="careerInlineState">まだ掲載がありません。</div>}
        </section>
        <FeaturedInternships items={featured} />
        <AlumniStoryPreview />
      </main>
      <Footer />
    </div>
  );
}
