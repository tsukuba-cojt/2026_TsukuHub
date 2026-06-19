import { useState } from "react";
import "../../styles/home/Hero.css";

function Hero() {
  const [query, setQuery] = useState("");

  return (
    <section className="hero">
      <div className="heroInner">
        <div className="heroContent">
          <h1 className="heroTitle">
            筑波大生の「
            <span className="heroTitleAccent">知りたい</span>
            」が、
            <br />
            ここに全部ある。
          </h1>

          <p className="heroDescription">
            授業、サークル、就活、生活情報まで、
            <br />
            筑波大生に必要な情報をまとめて見つけよう。
          </p>

          <div className="heroSearch">
            <input
              className="heroSearchInput"
              type="text"
              placeholder="気になる情報を検索してみよう！"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="heroSearchBtn">検索</button>
          </div>
        </div>

        {/* Right: hero-illustration.svg — replace when asset arrives */}
        <div className="heroIllust">
          <img
            src="/src/assets/hero-illustration.svg"
            alt=""
            className="heroIllustImg"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
