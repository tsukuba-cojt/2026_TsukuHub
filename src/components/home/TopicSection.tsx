import "../../styles/home/TopicSection.css";

const topics = [
  {
    tag: "就活・キャリア",
    title: "【26卒向け】夏インターンの探し方と選考対策ガイド",
    date: "2024/05/18",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300",
  },
  {
    tag: "授業・履修",
    title: "筑波大生が選ぶおすすめ授業まとめ",
    date: "2024/05/17",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300",
  },
  {
    tag: "サークル",
    title: "2024年度 新歓情報まとめ",
    date: "2024/05/16",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300",
  },
  {
    tag: "生活・便利情報",
    title: "一人暮らしの始め方完全ガイド",
    date: "2024/05/15",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300",
  },
];

function TopicSection() {
  return (
    <section className="panel topicPanel">
      <div className="panelTitle">
        <h2>👑 注目のトピック</h2>
      </div>

      <div className="topicList">
        {topics.map((topic) => (
          <article className="topicItem" key={topic.title}>
            <img src={topic.image} alt="" />
            <div>
              <span className="topicTag">{topic.tag}</span>
              <h3>{topic.title}</h3>
              <p>{topic.date}</p>
            </div>
            <span className="topicArrow">›</span>
          </article>
        ))}
      </div>

      <a className="panelLink" href="#">
        トピック一覧へ ›
      </a>
    </section>
  );
}

export default TopicSection;