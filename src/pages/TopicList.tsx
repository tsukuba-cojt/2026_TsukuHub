import { useEffect, useState } from "react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { useUniversity } from "../components/university/universityContextValue";
import { listPublishedNews } from "../services/newsService";
import type { NewsItemRecord } from "../types/news";
import { newsPresentation } from "../components/home/newsPresentation";
import "../styles/listing/ListingPages.css";

export default function TopicList() {
  const { university } = useUniversity();
  const [items, setItems] = useState<NewsItemRecord[]>([]);
  useEffect(() => { if (university) void listPublishedNews(university.id, "topic").then(setItems).catch(() => setItems([])); }, [university]);
  return <div className="listingPage"><Globalnav /><main className="listingShell"><header className="listingHero"><span>TOPICS</span><h1>トピック一覧</h1><p>{university?.name}で注目度の高い情報をまとめています。</p></header>{items.length === 0 ? <section className="careerState"><h2>まだ掲載がありません</h2></section> : <section className="listingCardGrid">{items.map((item) => { const presentation = newsPresentation(item.category); const Icon = presentation.icon; return <article className="listingCard isTopic" key={item.id}><div className={`listingIcon ${presentation.tagClass}`}><Icon /></div><span className={`listingTag ${presentation.tagClass}`}>{item.category}</span><h2>{item.title}</h2><time>{item.published_at.replaceAll("-", "/")}</time></article>; })}</section>}</main><Footer /></div>;
}
