import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { alumniStories } from "../data/careerContent";
import "../styles/career/CareerPlatform.css";

export default function CareerAlumniDetail() { const { id } = useParams(); const story = alumniStories.find((item) => item.id === id); if (!story) return <div className="careerPlatform"><Globalnav /><main className="careerState"><h1>体験記が見つかりません</h1><Link to="/career/alumni">一覧へ戻る</Link></main><Footer /></div>; const sections = [["就活を始めた時期", story.startedAt], ["志望業界", story.targetIndustries], ["就活で苦労したこと", story.challenge], ["実際に行った対策", story.actions], ["後輩へのアドバイス", story.advice], ["現在の仕事", story.currentWork]]; return <div className="careerPlatform"><Globalnav /><main className="careerShell careerStoryDetail"><Link className="careerBack" to="/career/alumni"><ArrowLeft />体験記一覧へ</Link><header><span>サンプル体験記</span><h1>{story.title}</h1><p>{story.graduationYear}年度卒・{story.faculty}・{story.role}</p></header>{sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}</main><Footer /></div>; }
