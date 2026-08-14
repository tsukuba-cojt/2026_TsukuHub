import { useEffect, useState } from "react";
import CareerPageHeader from "../components/career/CareerPageHeader";
import NoteArticleEmbed from "../components/career/NoteArticleEmbed";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { useUniversity } from "../components/university/universityContextValue";
import { listPublishedCareerArticles } from "../services/contentService";
import type { CareerNoteArticle } from "../data/careerNoteArticles";
import "../styles/career/CareerPlatform.css";

export default function CareerBasics() {
  const { university } = useUniversity();
  const [articles, setArticles] = useState<CareerNoteArticle[]>([]);
  useEffect(() => {
    if (!university) return;
    void listPublishedCareerArticles(university.id).then((items) => setArticles(items.filter((item) => item.source_type === "external" && item.external_url).map((item) => ({ noteId: item.external_url!.split("/").pop() ?? "", title: item.title })))).catch(() => setArticles([]));
  }, [university]);
  return <div className="careerPlatform"><Globalnav /><main className="careerShell"><CareerPageHeader eyebrow="CAREER BASICS" title="就活・長期インターンの基礎知識">就活の全体像から、応募書類や面接まで。必要なテーマから一つずつ確認できます。</CareerPageHeader>{articles.length ? <NoteArticleEmbed articles={articles} /> : <div className="careerState"><h2>まだ掲載がありません</h2></div>}</main><Footer /></div>;
}
