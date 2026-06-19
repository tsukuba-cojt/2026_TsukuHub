import "../../styles/home/Hero.css";

const keywords = [
  "長期インターン",
  "インターンシップ",
  "就活準備",
  "履修登録",
  "新歓情報",
  "おすすめ授業",
  "学食",
  "一人暮らし",
  "留学",
  "ボランティア",
];

function Hero() {
  return (
    <section className="hero">
      <div className="heroOverlay">
        <div className="heroCard">
          <h1>
            筑波大生の「知りたい」が、
            <br />
            ここに全部ある。
          </h1>

          <p>
            授業、サークル、就活、生活情報まで。
            <br />
            筑波大学生に必要な情報をまとめて見つけよう。
          </p>

          <div className="heroSearch">
            <input type="text" placeholder="気になる情報を検索してみよう！" />
            <button>検索</button>
          </div>
        </div>

        <div className="keywordCard">
          <h2>🔥 いま注目のキーワード</h2>
          <div className="keywordList">
            {keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;