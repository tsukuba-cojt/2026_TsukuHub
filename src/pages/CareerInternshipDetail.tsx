import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Check, MapPin } from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import ApplicationForm from "../components/career/ApplicationForm";
import { getInternship } from "../services/careerService";
import type { Internship } from "../types/career";
import "../styles/career/CareerPlatform.css";

const formatDate = (date: string) => new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(new Date(date));
export default function CareerInternshipDetail() {
  const { internshipId = "" } = useParams(); const [item, setItem] = useState<Internship | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [showForm, setShowForm] = useState(false); const [success, setSuccess] = useState(false);
  const [currentTime] = useState(() => Date.now());
  useEffect(() => { void getInternship(internshipId).then(setItem).catch(() => setError("求人情報を取得できませんでした。" )).finally(() => setLoading(false)); }, [internshipId]);
  if (loading) return <div className="careerPlatform"><Globalnav /><main className="careerState">求人を読み込んでいます...</main><Footer /></div>;
  if (error || !item) return <div className="careerPlatform"><Globalnav /><main className="careerState isError"><h1>求人が見つかりません</h1><p>{error || "公開が終了した可能性があります。"}</p><Link to="/career/internships">求人一覧へ戻る</Link></main><Footer /></div>;
  const closed = item.status !== "published" || new Date(item.deadline).getTime() < currentTime;
  const sections = [["仕事内容", item.description], ["応募条件", item.requirements], ["歓迎スキル", item.preferred_skills], ["身につくスキル", item.acquirable_skills], ["選考フロー", item.selection_process], ["企業紹介", item.company_description]];
  return <div className="careerPlatform"><Globalnav /><main className="careerShell internshipDetail"><Link className="careerBack" to="/career/internships"><ArrowLeft />求人一覧へ戻る</Link><header className="internshipDetailHero"><div className="companyLogo isLarge">{item.company_logo_url ? <img src={item.company_logo_url} alt={`${item.company_name}のロゴ`} /> : <span>{item.company_name.slice(0, 1)}</span>}</div><div><div className="tagRow">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}<span className={closed ? "isWarning" : "isOpen"}>{closed ? "募集終了" : "募集中"}</span></div><h1>{item.title}</h1><p>{item.company_name}</p><strong>{item.summary}</strong></div></header><div className="internshipDetailLayout"><div className="internshipDetailMain"><section className="detailFacts"><h2>募集情報</h2><dl><div><dt><BriefcaseBusiness />職種</dt><dd>{item.job_category}</dd></div><div><dt><MapPin />勤務地</dt><dd>{item.location}</dd></div><div><dt>勤務形態</dt><dd>{item.work_style}・{item.is_remote ? "リモート可" : "原則出社"}</dd></div><div><dt>稼働条件</dt><dd>{item.work_conditions}</dd></div><div><dt>報酬</dt><dd>{item.compensation}</dd></div><div><dt><CalendarDays />募集締切</dt><dd>{formatDate(item.deadline)}</dd></div></dl></section>{sections.map(([title, body]) => <section className="detailTextSection" key={title}><h2>{title}</h2>{title === "選考フロー" ? <ol>{body.split(/→|\n/).filter(Boolean).map((line) => <li key={line}><Check />{line.trim()}</li>)}</ol> : <p>{body}</p>}</section>)}</div><aside className="detailApplyBox"><p>{closed ? "この求人の募集は終了しました" : "興味を持ったら、応募情報を入力してください"}</p><button disabled={closed} className="careerPrimaryButton" onClick={() => setShowForm(true)}>{closed ? "募集は終了しました" : "応募する"}</button><small>応募前に仕事内容・条件をご確認ください。</small></aside></div>{success && <div className="applicationSuccess" role="status"><h2>応募を受け付けました</h2><p>マイページから現在のステータスを確認できます。</p><Link to="/mypage/applications">応募状況を見る</Link></div>}{showForm && !closed && !success && <section id="application"><ApplicationForm internshipId={item.id} onSuccess={() => { setSuccess(true); setShowForm(false); }} /></section>}</main><Footer /></div>;
}
