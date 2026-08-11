import { Link } from "react-router-dom";
import "../../styles/home/TopicSection.css";
import "../../styles/utility/Tags.css";
import { topics } from "../../data/homeContent";
import crownIcon from "../../assets/home/TopicSection/icon-crown.svg";

function TopicSection() {
  return (
    <section className="panel topicPanel">
      <div className="panelTitle">
        {/* icon-crown.svg — replace when asset arrives */}
        <img src={crownIcon} alt="" />
        <h2>注目のトピック</h2>
      </div>

      <div className="topicList">
        {topics.map((topic) => {
          const TopicIcon = topic.icon;
          return (
            <article className="topicItem" key={topic.title}>
              <div className={`topicThumb ${topic.tagClass}`}>
                <TopicIcon aria-hidden="true" />
              </div>
              <div className="topicMeta">
                <span className={`tag ${topic.tagClass}`}>{topic.tag}</span>
                <h3>{topic.title}</h3>
                <p>{topic.date}</p>
              </div>
            </article>
          );
        })}
      </div>

      <Link className="panelLink" to="/topics">
        トピック一覧へ
      </Link>
    </section>
  );
}

export default TopicSection;
