import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { alumniStories } from "../data/careerContent";
import "../styles/career/CareerPlatform.css";

export default function CareerAlumni() { return <div className="careerPlatform"><Globalnav /><main className="careerShell"><nav className="careerBreadcrumb"><Link to="/career">就活</Link><ChevronRight /><span>卒業生の体験記</span></nav><header className="careerPageHeader"><span>ALUMNI STORIES</span><h1>卒業生のキャリア・体験記</h1><p>進路に正解は一つではありません。サンプル体験記から、考え方や行動のヒントを探せます。</p></header><div className="alumniGrid">{alumniStories.map((story) => <article className="alumniCard" key={story.id}><div><span>{story.graduationYear}年度卒</span><span>{story.faculty}</span></div><p className="alumniRole">{story.destination}／{story.role}</p><h2>{story.title}</h2><p>{story.summary}</p><ul>{story.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul><Link to={`/career/alumni/${story.id}`}>詳しく読む</Link></article>)}</div></main><Footer /></div>; }
