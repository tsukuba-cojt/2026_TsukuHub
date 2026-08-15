import { Link } from "react-router-dom";
import "../../styles/home/TopicSection.css";
import "../../styles/utility/Tags.css";
import type { NewsItemRecord } from "../../types/news";
import { newsPresentation } from "./newsPresentation";
import crownIcon from "../../assets/home/TopicSection/icon-crown.svg";
import { useUniversity } from "../university/universityContextValue";

function TopicSection({ topics }: { topics: NewsItemRecord[] }) {
  const { path } = useUniversity();
  return (
    <section className="panel topicPanel">
      <div className="panelTitle">
        {/* icon-crown.svg — replace when asset arrives */}
        <img src={crownIcon} alt="" />
        <h2>注目のトピック</h2>
      </div>

      <div className="topicList">
        {topics.length === 0 && (
          <p className="topicEmpty">まだ掲載されているトピックはありません。</p>
        )}
        {topics.map((topic) => {
          const presentation = newsPresentation(topic.category);
          const TopicIcon = presentation.icon;
          return (
            <article className="topicItem" key={topic.title}>
              <div className={`topicThumb ${presentation.tagClass}`}>
                <TopicIcon aria-hidden="true" />
              </div>
              <div className="topicMeta">
                <span className={`tag ${presentation.tagClass}`}>{topic.category}</span>
                <h3>{topic.title}</h3>
                <p>{topic.published_at.replaceAll("-", "/")}</p>
              </div>
            </article>
          );
        })}
      </div>

      <Link className="panelLink" to={path("/topics")}>
        トピック一覧へ
      </Link>
    </section>
  );
}

export default TopicSection;
