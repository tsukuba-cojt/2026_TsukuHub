import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, BriefcaseBusiness, Clock3, GraduationCap, Sparkles } from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { alumniStories, careerArticles } from "../data/careerContent";
import { listPublishedInternships } from "../services/careerService";
import type { Internship } from "../types/career";
import "../styles/career/Career.css";
import "../styles/career/CareerPlatform.css";

const categories = [
  { icon: BookOpenCheck, title: "就活・長期インターンの基礎知識", description: "就活の進め方、長期インターンの探し方、ESや面接の基本を学べる。", to: "/career/basics", className: "" },
  { icon: BriefcaseBusiness, title: "長期インターン情報", description: "筑波大生におすすめの長期インターンを確認し、そのまま応募できる。", to: "/career/internships", className: "is-green" },
  { icon: GraduationCap, title: "卒業生のキャリア・体験記", description: "筑波大学の卒業生がどのように就活し、キャリアを選んだかを知る。", to: "/career/alumni", className: "is-purple" },
];

export default function Career() {
  const [featured, setFeatured] = useState<Internship[]>([]);
  useEffect(() => { void listPublishedInternships().then((items) => setFeatured(items.filter((item) => item.is_featured).slice(0, 3))).catch(() => setFeatured([])); }, []);
  return <div className="careerPage"><Globalnav /><main className="careerContainer">
    <section className="careerHero"><div className="careerHeroCopy"><span className="careerEyebrow">TSUKUBA CAREER HUB</span><h1>筑波大生の就活を、<br />情報収集から行動まで支える</h1><p>基礎を学び、先輩の経験を知り、自分に合う長期インターンへ。次の一歩に必要な情報を一か所にまとめました。</p><Link to="/career/internships" className="careerHeroButton">募集中のインターンを見る<ArrowRight /></Link></div><div className="careerHeroVisual" aria-hidden="true"><Sparkles /></div></section>
    <section className="careerCategories"><div className="careerSectionHeading"><span>EXPLORE</span><h2>目的から探す</h2></div><div className="careerCategoryGrid">{categories.map(({ icon: Icon, ...item }) => <article className={`careerCategoryCard ${item.className}`} key={item.to}><span className="careerCategoryIcon"><Icon /></span><h3>{item.title}</h3><p className="careerCategoryDescription">{item.description}</p><Link className="careerCategoryButton" to={item.to}>詳しく見る<ArrowRight /></Link></article>)}</div></section>
    <section className="careerHomeSection"><div className="careerSectionHeading"><span>FEATURED</span><h2>おすすめの長期インターン</h2></div>{featured.length ? <div className="careerMiniGrid">{featured.map((item) => <Link className="careerMiniCard" to={`/career/internships/${item.id}`} key={item.id}><span>{item.job_category}</span><h3>{item.title}</h3><p>{item.company_name}</p><strong>詳細を見る <ArrowRight /></strong></Link>)}</div> : <div className="careerInlineState">公開中のおすすめ求人は、現在準備中です。</div>}</section>
    <section className="careerHomeSection"><div className="careerArticlesHeader"><div className="careerSectionHeading"><span>CAREER ARTICLES</span><h2>役立つ就活・キャリア情報</h2></div></div><div className="careerArticleList">{careerArticles.map((article) => <article className="careerArticleCard" key={article.id}><div className="careerArticleMeta"><span>{article.category}</span><time dateTime={article.publishedAt}>{article.publishedAt.replaceAll("-", ".")}</time></div><h3>{article.title}</h3><p>{article.description}</p><div className="careerArticleFooter"><span><Clock3 />{article.readMinutes}分で読めます</span><Link to="/career/basics">詳しく見る<ArrowRight /></Link></div></article>)}</div></section>
    <section className="careerHomeSection"><div className="careerSectionHeading"><span>ALUMNI STORIES</span><h2>卒業生の体験記</h2></div><div className="careerMiniGrid">{alumniStories.slice(0, 3).map((story) => <Link className="careerMiniCard" to={`/career/alumni/${story.id}`} key={story.id}><span>{story.graduationYear}年度卒・{story.role}</span><h3>{story.title}</h3><p>{story.summary}</p><strong>体験記を読む <ArrowRight /></strong></Link>)}</div></section>
    <section className="careerFirstGuide"><div><span>初めて利用する方へ</span><h2>まずは基礎を知り、気になる求人を保存する感覚で見てみよう</h2><p>応募前に仕事内容と勤務条件を確認し、不明点は面談で質問しましょう。</p></div><Link to="/career/basics">基礎知識を見る<ArrowRight /></Link></section>
  </main><Footer /></div>;
}
