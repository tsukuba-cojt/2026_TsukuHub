import { Link } from "react-router-dom";
import { BookOpenCheck, ChevronRight } from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { basicTopics } from "../data/careerContent";
import "../styles/career/CareerPlatform.css";

export default function CareerBasics() {
  return <div className="careerPlatform"><Globalnav /><main className="careerShell">
    <nav className="careerBreadcrumb" aria-label="パンくずリスト"><Link to="/career">就活</Link><ChevronRight /><span>基礎知識</span></nav>
    <header className="careerPageHeader"><span>CAREER BASICS</span><h1>就活・長期インターンの基礎知識</h1><p>就活の全体像から、応募書類や面接まで。必要なテーマから一つずつ確認できます。</p></header>
    <section className="careerTopicGrid" aria-label="基礎知識のカテゴリ">
      {basicTopics.map(([title, description], index) => <article className="careerTopicCard" key={title}><span>{String(index + 1).padStart(2, "0")}</span><BookOpenCheck /><h2>{title}</h2><p>{description}</p></article>)}
    </section>
  </main><Footer /></div>;
}
