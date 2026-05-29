const ranking = [
  "長期インターン",
  "履修登録",
  "おすすめ授業",
  "サークル新歓",
  "学食",
  "ES対策",
  "面接練習",
  "一人暮らし",
  "留学",
  "ボランティア",
];

function RankingSection() {
  return (
    <section className="panel rankingPanel">
      <div className="panelTitle">
        <h2>📈 人気の検索キーワード</h2>
      </div>

      <ol className="rankingList">
        {ranking.map((item, index) => (
          <li key={item}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>

      <a className="panelLink" href="#">
        もっと見る ›
      </a>
    </section>
  );
}

export default RankingSection;