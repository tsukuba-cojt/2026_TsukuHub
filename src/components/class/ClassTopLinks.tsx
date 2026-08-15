import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  CircleHelp,
  FileText,
  Shield,
} from "lucide-react";
import "../../styles/class/ClassTop.css";
import { useUniversity } from "../university/universityContextValue";

const usefulLinks = [
  { icon: FileText, label: "ダミー｜シラバス検索", path: "/syllabus-search", colorClass: "isBlue" },
  { icon: Calendar, label: "ダミー｜授業時間割表", path: "/timetable-list", colorClass: "isBlue" },
  { icon: BookOpen, label: "ダミー｜履修の手引き", path: "/course-guide", colorClass: "isYellow" },
  { icon: Shield, label: "ダミー｜学則・規程集", path: "/regulations", colorClass: "isGreen" },
  { icon: CircleHelp, label: "ダミー｜FAQ・よくある質問", path: "/faq", colorClass: "isPurple" },
];

function ClassTopLinks() {
  const { path } = useUniversity();
  return (
    <section className="classTopLinks">
      <h2 className="classTopLinksHeading">履修に役立つリンク集（ダミー）</h2>
      <div className="classTopLinksGrid">
        {usefulLinks.map((link) => (
          <Link to={path(link.path)} className="classTopLinkCard" key={link.label}>
            <span className={`classTopLinkIcon ${link.colorClass}`}>
              <link.icon aria-hidden="true" />
            </span>
            <span className="classTopLinkLabel">{link.label}</span>
            <ChevronRight className="classTopRowChevron" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ClassTopLinks;
