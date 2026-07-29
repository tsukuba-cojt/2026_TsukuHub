import { useEffect, useState } from "react";
import AlumniStoryPreview from "../components/career/AlumniStoryPreview";
import CareerCategoryGrid from "../components/career/CareerCategoryGrid";
import CareerTopHero from "../components/career/CareerTopHero";
import FeaturedInternships from "../components/career/FeaturedInternships";
import NoteArticleEmbed from "../components/career/NoteArticleEmbed";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { fallbackAlumniStories } from "../data/careerFallbacks";
import { careerNoteArticles } from "../data/careerNoteArticles";
import { listPublishedInternships } from "../services/careerService";
import { listPublishedAlumniStories } from "../services/contentService";
import type { Internship } from "../types/career";
import type { AlumniStoryRecord } from "../types/content";
import "../styles/career/Career.css";
import "../styles/career/CareerPlatform.css";

export default function Career() {
  const [featured, setFeatured] = useState<Internship[]>([]);
  const [stories, setStories] = useState<AlumniStoryRecord[]>(
    fallbackAlumniStories,
  );

  useEffect(() => {
    void listPublishedInternships()
      .then((items) =>
        setFeatured(items.filter((item) => item.is_featured).slice(0, 3)),
      )
      .catch(() => setFeatured([]));
  }, []);

  useEffect(() => {
    void listPublishedAlumniStories()
      .then(setStories)
      .catch(() => {
        // Supabase未設定時は既存サンプルを表示する
      });
  }, []);

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
          <NoteArticleEmbed articles={careerNoteArticles} />
        </section>
        <FeaturedInternships items={featured} />
        <AlumniStoryPreview stories={stories} />
      </main>
      <Footer />
    </div>
  );
}
