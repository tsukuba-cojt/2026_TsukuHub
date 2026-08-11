import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/home/LatestNewSection.css";
import "../../styles/utility/Tags.css";
import { BellRing } from "lucide-react";
import { latestNews, latestNewsTabs, type LatestNewsCategory } from "../../data/homeContent";
import bellIcon from "../../assets/home/LatestNewSection/icon-bell.svg";

function LatestNewsSection() {
  const [activeTab, setActiveTab] = useState<LatestNewsCategory>("all");

  const filtered =
    activeTab === "all"
      ? latestNews
      : latestNews.filter((n) => n.category === activeTab);

  return (
    <section className="panel latestPanel">
      <div className="panelTitle">
        {/* icon-bell.svg — replace when asset arrives */}
        <img src={bellIcon} alt="" />
        <h2>新着情報</h2>
      </div>

      <div className="tabList">
        {latestNewsTabs.map((tab) => (
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
        {filtered.map((news) => {
          const NewsIcon = news.icon ?? BellRing;
          return (
            <article className="latestItem" key={news.title}>
              <span className={`latestItemIcon ${news.tagClass}`}>
                <NewsIcon aria-hidden="true" />
              </span>
              <span className={`tag ${news.tagClass}`}>{news.tag}</span>
              <h3>{news.title}</h3>
              <time>{news.date}</time>
            </article>
          );
        })}
      </div>

      <Link className="panelLink" to="/news">
        新着情報一覧へ
      </Link>
    </section>
  );
}

export default LatestNewsSection;
