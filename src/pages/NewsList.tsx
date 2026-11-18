import { useEffect, useState } from "react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { useUniversity } from "../components/university/universityContextValue";
import { listPublishedNews } from "../services/newsService";
import type { NewsItemRecord } from "../types/news";
import { newsPresentation } from "../components/home/newsPresentation";
import ArticleMarkdown from "../components/career/ArticleMarkdown";
import "../styles/listing/ListingPages.css";

export default function NewsList() {
  const { university } = useUniversity();
  const [items, setItems] = useState<NewsItemRecord[]>([]);
  useEffect(() => { if (university) void listPublishedNews(university.id, "news").then(setItems).catch(() => setItems([])); }, [university]);
  return <div className="listingPage"><Globalnav /><main className="listingShell"><header className="listingHero"><span>NEWS</span><h1>新着情報一覧</h1><p>{university?.name}向けの新着情報をまとめて確認できます。</p></header>{items.length === 0 ? <section className="careerState"><h2>まだ掲載がありません</h2></section> : <section className="listingCardGrid">{items.map((item) => { const presentation = newsPresentation(item.category); return <article className="listingCard" key={item.id} id={`news-${item.id}`}><span className={`listingTag ${presentation.tagClass}`}>{item.category}</span><h2>{item.title}</h2><time dateTime={item.published_at}>{item.published_at.replaceAll("-", "/")}</time>{item.description.trim() && <details className="newsArticleDetails"><summary>記事を読む</summary><ArticleMarkdown source={item.description} /></details>}</article>; })}</section>}</main><Footer /></div>;
}
