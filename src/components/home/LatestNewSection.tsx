import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/home/LatestNewSection.css";
import "../../styles/utility/Tags.css";
import { latestNewsTabs, type LatestNewsCategory } from "../../data/homeContent";
import type { NewsItemRecord } from "../../types/news";
import { newsPresentation } from "./newsPresentation";
import bellIcon from "../../assets/home/LatestNewSection/icon-bell.svg";
import { useUniversity } from "../university/universityContextValue";

function LatestNewsSection({ newsItems }: { newsItems: NewsItemRecord[] }) {
  const { path } = useUniversity();
  const [activeTab, setActiveTab] = useState<LatestNewsCategory>("all");

  const filtered =
    activeTab === "all"
      ? newsItems
      : newsItems.filter((item) => newsPresentation(item.category).filter === activeTab);

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
        {filtered.length === 0 && (
          <p className="latestEmpty">まだ掲載されている新着情報はありません。</p>
        )}
        {filtered.map((news) => {
          const presentation = newsPresentation(news.category);
          const NewsIcon = presentation.icon;
          return (
            <article className="latestItem" key={news.title}>
              <span className={`latestItemIcon ${presentation.tagClass}`}>
                <NewsIcon aria-hidden="true" />
              </span>
              <span className={`tag ${presentation.tagClass}`}>{news.category}</span>
              <h3>{news.title}</h3>
              <time>{news.published_at.replaceAll("-", "/")}</time>
            </article>
          );
        })}
      </div>

      <Link className="panelLink" to={path("/news")}>
        新着情報一覧へ
      </Link>
    </section>
  );
}

export default LatestNewsSection;
