import "../../styles/home/Hero.css";
import heroIllustration from "../../assets/home/hero/hero-illustration.svg";
import { useUniversity } from "../university/universityContextValue";

/* 検索機能は未実装のため、ホバー時に出す案内文言 */
const SEARCH_NOTICE = "すみません！まだ準備中です";

function Hero() {
  const { university } = useUniversity();
  // 検索は未実装。Enter キーでの送信も含め、何も起こらないようにする
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="hero">
      <div className="heroInner">
        <div className="heroContent">
          <h1 className="heroTitle">
            {university?.short_name}生の「
            <span className="heroTitleAccent">知りたい</span>
            」が、
            <br />
            ここに全部ある。
          </h1>

          <p className="heroDescription">
            授業、サークル、就活、生活情報まで、
            <br />
            {university?.short_name}生に必要な情報をまとめて見つけよう。
          </p>

          <div className="heroSearch">
            <form onSubmit={handleSearchSubmit} className="heroSearchForm">
              <input
                className="heroSearchInput"
                type="text"
                placeholder="気になる情報を検索してみよう！"
                readOnly
                aria-disabled="true"
                title={SEARCH_NOTICE}
              />
              <button
                type="button"
                className="heroSearchBtn"
                aria-disabled="true"
                aria-label={`検索（${SEARCH_NOTICE}）`}
                title={SEARCH_NOTICE}
                onClick={(e) => e.preventDefault()}
              >
                検索
                {/* ホバー時の吹き出し。読み上げは title / aria-label に任せる */}
                <span className="heroSearchNotice" aria-hidden="true">
                  {SEARCH_NOTICE}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: hero-illustration.svg — replace when asset arrives */}
        <div className="heroIllust">
          <img
            src={heroIllustration}
            alt=""
            className="heroIllustImg"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
