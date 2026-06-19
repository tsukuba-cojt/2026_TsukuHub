import "../../styles/home/RankingSection.css";

const ranking = [
  "長期インターン",
  "新歓情報",
  "おすすめ授業",
  "サークル新歓",
  "学食",
  "ES対策",
  "面接練習",
  "一人暮らし",
  "留学",
];

const crownSrc: Record<number, string> = {
  1: "/src/assets/icon-rank-gold.svg",
  2: "/src/assets/icon-rank-silver.svg",
  3: "/src/assets/icon-rank-bronze.svg",
};

const badgeClass: Record<number, string> = {
  1: "gold",
  2: "silver",
  3: "bronze",
};

function RankingSection() {
  return (
    <section className="panel rankingPanel">
      <div className="panelTitle">
        {/* icon-trending.svg — replace when asset arrives */}
        <img src="/src/assets/icon-trending.svg" alt="" />
        <h2>人気の検索ワード</h2>
      </div>

      <ol className="rankingList">
        {ranking.map((keyword, i) => {
          const rank = i + 1;
          const isTop3 = rank <= 3;
          return (
            <li key={keyword}>
              <span className={`rankBadge ${isTop3 ? badgeClass[rank] : "normal"}`}>
                {isTop3 && (
                  <img
                    src={crownSrc[rank]}
                    alt=""
                    className="rankCrownImg"
                  />
                )}
                <span className={`rankNum ${isTop3 ? "top3" : "other"}`}>
                  {rank}
                </span>
              </span>
              <p className={isTop3 ? "rankKeywordTop" : "rankKeywordOther"}>
                {keyword}
              </p>
            </li>
          );
        })}
      </ol>

      <a className="panelLink" href="#">
        もっと見る
      </a>
    </section>
  );
}

export default RankingSection;
