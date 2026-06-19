import "../../styles/home/LatestNewSection.css";

const latestNews = [
  {
    tag: "就活・キャリア",
    title: "【新規掲載】大手IT企業 サマーインターン募集開始！",
    date: "2024/05/20",
  },
  {
    tag: "イベント",
    title: "5/25（土）業界研究セミナー開催のお知らせ",
    date: "2024/05/19",
  },
  {
    tag: "授業・履修",
    title: "「機械学習入門」の資料・過去問を追加しました",
    date: "2024/05/19",
  },
  {
    tag: "サークル・課外活動",
    title: "軽音楽部5ライブ開催決定！",
    date: "2024/05/18",
  },
  {
    tag: "生活・便利情報",
    title: "学食の新メニュー情報（5月版）",
    date: "2024/05/18",
  },
];

function LatestNewsSection() {
  return (
    <section className="panel latestPanel">
      <div className="panelTitle">
        <h2>🔔 新着情報</h2>
      </div>

      <div className="tabList">
        <button className="active">すべて</button>
        <button>就活・キャリア</button>
        <button>授業・履修</button>
        <button>イベント</button>
      </div>

      <div className="latestList">
        {latestNews.map((news) => (
          <article className="latestItem" key={news.title}>
            <div>
              <span className="latestTag">{news.tag}</span>
              <h3>{news.title}</h3>
            </div>
            <time>{news.date}</time>
          </article>
        ))}
      </div>

      <a className="panelLink" href="#">
        新着情報一覧へ ›
      </a>
    </section>
  );
}

export default LatestNewsSection;