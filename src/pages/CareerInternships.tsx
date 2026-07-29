import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, CalendarDays, ChevronRight, MapPin } from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { listPublishedInternships } from "../services/careerService";
import type { Internship } from "../types/career";
import "../styles/career/CareerPlatform.css";

const filters = ["すべて", "エンジニア", "営業・ビジネス", "マーケティング", "企画", "デザイン", "リモート可"];
const deadlineText = (date: string) => new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(new Date(date));
const isClosingSoon = (date: string, currentTime: number) => { const days = (new Date(date).getTime() - currentTime) / 86400000; return days >= 0 && days <= 7; };

export default function CareerInternships() {
  const [items, setItems] = useState<Internship[]>([]); const [filter, setFilter] = useState("すべて"); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [currentTime] = useState(() => Date.now());
  const load = () => { setLoading(true); setError(""); void listPublishedInternships().then(setItems).catch(() => setError("求人情報を取得できませんでした。時間をおいて再度お試しください。" )).finally(() => setLoading(false)); };
  useEffect(() => { void listPublishedInternships().then(setItems).catch(() => setError("求人情報を取得できませんでした。時間をおいて再度お試しください。" )).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => items.filter((item) => filter === "すべて" || (filter === "リモート可" ? item.is_remote : item.job_category.includes(filter))), [filter, items]);
  return <div className="careerPlatform"><Globalnav /><main className="careerShell"><nav className="careerBreadcrumb"><Link to="/career">就活</Link><ChevronRight /><span>長期インターン</span></nav><header className="careerPageHeader"><span>LONG-TERM INTERNSHIPS</span><h1>長期インターン情報</h1><p>筑波大生におすすめの求人を掲載しています。現在 <strong>{items.length}件</strong> 募集中です。</p></header><section className="quickFilter" aria-label="求人の絞り込み"><h2>クイックフィルター</h2><div>{filters.map((name) => <button type="button" className={filter === name ? "isActive" : ""} onClick={() => setFilter(name)} key={name}>{name}</button>)}</div></section>
  <section className="internshipList"><h2>募集中の求人 <span>{visible.length}件</span></h2>{loading ? <div className="careerState">求人を読み込んでいます...</div> : error ? <div className="careerState isError"><p>{error}</p><button onClick={load}>再読み込み</button></div> : visible.length === 0 ? <div className="careerState"><BriefcaseBusiness /><h3>条件に合う求人はありません</h3><button onClick={() => setFilter("すべて")}>すべて表示する</button></div> : <div className="internshipCards">{visible.map((item) => <article className="internshipCard" key={item.id}><div className="companyLogo">{item.company_logo_url ? <img src={item.company_logo_url} alt={`${item.company_name}のロゴ`} /> : <span>{item.company_name.slice(0, 1)}</span>}</div><div className="internshipCardBody"><div className="tagRow">{item.is_featured && <span>おすすめ</span>}{item.tags.map((tag) => <span key={tag}>{tag}</span>)}{isClosingSoon(item.deadline, currentTime) && <span className="isWarning">締切間近</span>}</div><h3>{item.title}</h3><p className="companyName">{item.company_name}</p><dl><div><dt><BriefcaseBusiness />職種</dt><dd>{item.job_category}</dd></div><div><dt><MapPin />勤務地</dt><dd>{item.location}{item.is_remote ? "（リモート可）" : ""}</dd></div><div><dt>勤務条件</dt><dd>{item.work_conditions}</dd></div><div><dt>報酬</dt><dd>{item.compensation}</dd></div></dl><footer><span><CalendarDays />締切 {deadlineText(item.deadline)}</span><Link to={`/career/internships/${item.id}`}>詳細を見る<ChevronRight /></Link></footer></div></article>)}</div>}</section></main><Footer /></div>;
}
