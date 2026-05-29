import "../styles/App.css";

function Home() {
  return (
    <div className="app">
      <header className="header">
        <div className="headerLogo">TsukuHub</div>

        <nav className="nav">
          <a href="#about">概要</a>
          <a href="#features">機能</a>
          <a href="#categories">カテゴリ</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="heroContent">
            <p className="heroLabel">University of Tsukuba Information Platform</p>

            <h1>
              筑波大生に必要な情報を、
              <br />
              ひとつに。
            </h1>

            <p className="heroDescription">
              TsukuHubは、履修・サークル・飲食店・住まい・バイト・就活など、
              筑波大学生の生活に必要な情報をまとめて探せるプラットフォームです。
            </p>

            <div className="heroButtons">
              <a className="primaryButton" href="#features">
                機能を見る
              </a>
              <a className="secondaryButton" href="#about">
                TsukuHubとは
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="sectionHeader">
            <p className="sectionLabel">About</p>
            <h2>情報探しに迷わない大学生活へ</h2>
          </div>

          <p className="sectionText">
            筑波大学生が必要とする情報は、SNS、LINE、大学公式サイト、口コミなど、
            さまざまな場所に分散しています。TsukuHubは、それらの情報を整理し、
            学生が必要な情報にすぐアクセスできる状態を目指します。
          </p>
        </section>

        <section id="features" className="section lightSection">
          <div className="sectionHeader">
            <p className="sectionLabel">Features</p>
            <h2>TsukuHubでできること</h2>
          </div>

          <div className="featureGrid">
            <div className="featureCard">
              <span className="cardIcon">📚</span>
              <h3>授業・履修情報</h3>
              <p>授業選びや履修登録に役立つ情報を探せます。</p>
            </div>

            <div className="featureCard">
              <span className="cardIcon">🏠</span>
              <h3>生活情報</h3>
              <p>住まい、飲食店、バイトなど大学生活に必要な情報をまとめます。</p>
            </div>

            <div className="featureCard">
              <span className="cardIcon">💼</span>
              <h3>キャリア情報</h3>
              <p>就活、長期インターン、留学など将来に関わる情報にアクセスできます。</p>
            </div>
          </div>
        </section>

        <section id="categories" className="section">
          <div className="sectionHeader">
            <p className="sectionLabel">Categories</p>
            <h2>扱う情報カテゴリ</h2>
          </div>

          <div className="categoryList">
            <span>履修</span>
            <span>サークル</span>
            <span>飲食店</span>
            <span>住まい</span>
            <span>バイト</span>
            <span>遊び</span>
            <span>留学</span>
            <span>就活</span>
            <span>長期インターン</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 TsukuHub</p>
      </footer>
    </div>
  );
}

export default Home;