import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { listPublishedClassAnnouncements } from "../../services/contentService";
import type { ClassAnnouncementRecord } from "../../types/content";
import { useUniversity } from "../university/universityContextValue";
import "../../styles/class/ClassTop.css";

const badgeClass = (category: string) => {
  if (category.includes("履修")) return "isGreen";
  if (category.includes("システム")) return "isPurple";
  return "isBlue";
};

function ClassTopNews() {
  const { university, path } = useUniversity();
  const [newsItems, setNewsItems] = useState<ClassAnnouncementRecord[]>([]);
  useEffect(() => {
    if (!university) return;
    void listPublishedClassAnnouncements(university.id).then((items) => setNewsItems(items.slice(0, 4))).catch(() => setNewsItems([]));
  }, [university]);
  return (
    <section className="classTopPanel">
      <div className="classTopPanelHeading">
        <h2>お知らせ</h2>
        {/* もっと見る先は未実装のため仮リンク（404） */}
        <Link to={path("/news")} className="classTopMoreLink">
          もっと見る
          <ChevronRight aria-hidden="true" />
        </Link>
      </div>

      <ul className="classTopNewsList">
        {newsItems.map((item) => (
          <li className="classTopNewsItem" key={item.id} title={item.content}>
            <p className="classTopNewsMeta">
              <time dateTime={item.published_at}>{item.published_at.replaceAll("-", "/")}</time>
              <span className={`classTopNewsBadge ${badgeClass(item.category)}`}>
                {item.category}
              </span>
            </p>
            <p className="classTopNewsTitle">{item.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ClassTopNews;
