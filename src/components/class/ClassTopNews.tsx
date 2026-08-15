import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useUniversity } from "../university/universityContextValue";
import "../../styles/class/ClassTop.css";

const newsItems = [
  {
    date: "2026/05/12",
    category: "お知らせ",
    categoryClass: "isBlue",
    title: "ダミー｜【重要】夏学期の履修登録期間について",
  },
  {
    date: "2026/05/11",
    category: "履修ガイド",
    categoryClass: "isGreen",
    title: "ダミー｜2026年度 履修の手引きを公開しました",
  },
  {
    date: "2026/05/09",
    category: "システム",
    categoryClass: "isPurple",
    title: "ダミー｜システムメンテナンスのお知らせ（5/15)",
  },
  {
    date: "2026/05/08",
    category: "お知らせ",
    categoryClass: "isBlue",
    title: "ダミー｜授業評価アンケートのご協力のお願い",
  },
];

function ClassTopNews() {
  const { path } = useUniversity();
  return (
    <section className="classTopPanel">
      <div className="classTopPanelHeading">
        <h2>お知らせ（ダミー）</h2>
        <Link to={path("/news")} className="classTopMoreLink">
          もっと見る
          <ChevronRight aria-hidden="true" />
        </Link>
      </div>

      <ul className="classTopNewsList">
        {newsItems.map((item) => (
          <li className="classTopNewsItem" key={item.title}>
            <p className="classTopNewsMeta">
              <time>{item.date}</time>
              <span className={`classTopNewsBadge ${item.categoryClass}`}>
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
