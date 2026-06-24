import { useState } from "react";
import "../../styles/home/LatestNewSection.css";

type Category = "all" | "job" | "class" | "event" | "life";

const tabs: { key: Category; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "job", label: "就活・キャリア" },
  { key: "class", label: "授業・履修" },
  { key: "event", label: "イベント" },
  { key: "life", label: "生活・便利情報" },
];

const latestNews = [
  {
    category: "job" as Category,
    tag: "就活・キャリア",
    tagClass: "tagJob",
    title: "【締切間近】大手IT企業 サマーインターン募集開始！",
    date: "2026/05/12",
  },
  {
    category: "event" as Category,
    tag: "イベント",
    tagClass: "tagEvent",
    title: "中高生合同　交流会のお知らせ",
    date: "2026/05/11",
  },
  {
    category: "event" as Category,
    tag: "サークル・課外活動",
    tagClass: "tagClub",
    title: "軽音サークルライブ開催決定！",
    date: "2026/05/11",
  },
  {
    category: "class" as Category,
    tag: "授業・履修",
    tagClass: "tagClass",
    title: "「統計学入門」の資料を追加しました",
    date: "2026/05/09",
  },
];

function LatestNewsSection() {
  const [activeTab, setActiveTab] = useState<Category>("all");

  const filtered =
    activeTab === "all"
      ? latestNews
      : latestNews.filter((n) => n.category === activeTab);

  return (
    <section className="panel latestPanel">
      <div className="panelTitle">
        {/* icon-bell.svg — replace when asset arrives */}
        <img src="/src/assets/home/LatestNewSection/icon-bell.svg" alt="" />
        <h2>新着情報</h2>
      </div>

      <div className="tabList">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="latestList">
        {filtered.map((news) => (
          <article className="latestItem" key={news.title}>
            <span className={`latestTag ${news.tagClass}`}>{news.tag}</span>
            <h3>{news.title}</h3>
            <time>{news.date}</time>
          </article>
        ))}
      </div>

      <a className="panelLink" href="#">
        新着情報一覧へ
      </a>
    </section>
  );
}

export default LatestNewsSection;
