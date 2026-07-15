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

// 履修に役立つリンク集。
// 遷移先はすべて未実装のためダミー（未登録パス＝404ページで仮止め）。
// 本実装時はこの配列の path を差し替えるだけでよい。
const usefulLinks = [
  { icon: FileText, label: "シラバス検索", path: "/syllabus-search", colorClass: "isBlue" },
  { icon: Calendar, label: "授業時間割表", path: "/timetable-list", colorClass: "isBlue" },
  { icon: BookOpen, label: "履修の手引き", path: "/course-guide", colorClass: "isYellow" },
  { icon: Shield, label: "学則・規程集", path: "/regulations", colorClass: "isGreen" },
  { icon: CircleHelp, label: "FAQ・よくある質問", path: "/faq", colorClass: "isPurple" },
];

function ClassTopLinks() {
  return (
    <section className="classTopLinks">
      <h2 className="classTopLinksHeading">履修に役立つリンク集</h2>
      <div className="classTopLinksGrid">
        {usefulLinks.map((link) => (
          <Link to={link.path} className="classTopLinkCard" key={link.label}>
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
