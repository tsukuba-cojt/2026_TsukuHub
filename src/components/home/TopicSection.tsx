import "../../styles/home/TopicSection.css";
import crownIcon from "../../assets/home/TopicSection/icon-crown.svg";

const topics = [
  {
    tag: "就活・キャリア",
    tagClass: "tagJob",
    title: "【6/9（月）】夏インターンの探し方と選考対策ガイド",
    date: "2026/05/10",
  },
  {
    tag: "授業・履修",
    tagClass: "tagClass",
    title: "春Aにとるべきおすすめ授業【学類別】",
    date: "2026/05/12",
  },
  {
    tag: "サークル・課外活動",
    tagClass: "tagClub",
    title: "2026年度 新歓情報",
    date: "2026/04/30",
  },
  {
    tag: "生活・便利情報",
    tagClass: "tagLife",
    title: "一人暮らし始め方完全ガイド",
    date: "2026/04/10",
  },
];

function TopicSection() {
  return (
    <section className="panel topicPanel">
      <div className="panelTitle">
        {/* icon-crown.svg — replace when asset arrives */}
        <img src={crownIcon} alt="" />
        <h2>注目のトピック</h2>
      </div>

      <div className="topicList">
        {topics.map((topic) => (
          <article className="topicItem" key={topic.title}>
            {/* Thumbnail placeholder */}
            <div className="topicThumb" />
            <div className="topicMeta">
              <span className={`topicTag ${topic.tagClass}`}>{topic.tag}</span>
              <h3>{topic.title}</h3>
              <p>{topic.date}</p>
            </div>
          </article>
        ))}
      </div>

      <a className="panelLink" href="#">
        トピック一覧へ
      </a>
    </section>
  );
}

export default TopicSection;
