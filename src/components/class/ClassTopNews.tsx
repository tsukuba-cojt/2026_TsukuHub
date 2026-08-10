import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { listPublishedClassAnnouncements } from "../../services/contentService";
import type { ClassAnnouncementRecord } from "../../types/content";
import "../../styles/class/ClassTop.css";

// お知らせセクション。
// 既存のお知らせ機構は無い（ホームの NewsBar も固定文言）ため、
// 当面はダミーデータで表示する。実データ接続は別タスク。
const fallbackNewsItems = [
  {
    date: "2026/05/12",
    category: "お知らせ",
    categoryClass: "isBlue",
    title: "【重要】夏学期の履修登録期間について",
  },
  {
    date: "2026/05/11",
    category: "履修ガイド",
    categoryClass: "isGreen",
    title: "2026年度 履修の手引きを公開しました",
  },
  {
    date: "2026/05/09",
    category: "システム",
    categoryClass: "isPurple",
    title: "システムメンテナンスのお知らせ（5/15)",
  },
  {
    date: "2026/05/08",
    category: "お知らせ",
    categoryClass: "isBlue",
    title: "授業評価アンケートのご協力のお願い",
  },
];

const fallbackAnnouncements: ClassAnnouncementRecord[] = fallbackNewsItems.map((item, index) => ({
  id: `fallback-${index}`,
  category: item.category,
  title: item.title,
  content: "",
  published_at: item.date.replaceAll("/", "-"),
  status: "published",
  created_at: item.date,
  updated_at: item.date,
}));

const badgeClass = (category: string) => {
  if (category.includes("履修")) return "isGreen";
  if (category.includes("システム")) return "isPurple";
  return "isBlue";
};

function ClassTopNews() {
  const [newsItems, setNewsItems] = useState(fallbackAnnouncements);
  useEffect(() => {
    void listPublishedClassAnnouncements().then((items) => setNewsItems(items.slice(0, 4))).catch(() => { /* 既存サンプルを表示 */ });
  }, []);
  return (
    <section className="classTopPanel">
      <div className="classTopPanelHeading">
        <h2>お知らせ</h2>
        {/* もっと見る先は未実装のため仮リンク（404） */}
        <Link to="/news" className="classTopMoreLink">
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
