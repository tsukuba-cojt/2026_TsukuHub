import "../../styles/home/RankingSection.css";
import rankGoldIcon from "../../assets/home/RankingSection/icon-rank-gold.svg";
import rankSilverIcon from "../../assets/home/RankingSection/icon-rank-silver.svg";
import rankBronzeIcon from "../../assets/home/RankingSection/icon-rank-bronze.svg";
import trendingIcon from "../../assets/home/RankingSection/icon-trending.svg";

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
  1: rankGoldIcon,
  2: rankSilverIcon,
  3: rankBronzeIcon,
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
        <img src={trendingIcon} alt="" />
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
                <span className="rankNum">{rank}</span>
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
