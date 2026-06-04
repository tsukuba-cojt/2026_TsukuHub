import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="headerTop">
        <div className="logoArea">
         <Link to="/" className="homeLink">
          <div className="logoMark">✿</div>
          <div>
            <div className="logoText">TsukuHub</div>
            <div className="logoSub">筑波大生のためのキャンパス情報ポータル</div>
          </div>
        </Link>
        </div>

        <div className="searchArea">
          <input
            className="searchInput"
            type="text"
            placeholder="キーワードで検索（授業・サークル・就活など）"
          />
          <button className="searchIconButton">🔍</button>
        </div>

        <div className="authButtons">
          <Link to="/login">
            <button className="loginButton">ログイン</button>
          </Link>
          <Link to="/register">
            <button className="registerButton">新規登録</button>
          </Link>
        </div>
      </div>

      <nav className="globalNav">
        <a href="#">ホーム</a>
        <a href="#">就活・キャリア</a>
        <Link to="/class">
          <button className="navButton">授業・履修</button>
        </Link>
        <a href="#">サークル・課外活動</a>
        <a href="#">生活・便利情報</a>
        <a href="#">イベント・お知らせ</a>
        <a href="#">留学・国際交流</a>
        <a href="#">TsukuHubとは</a>
      </nav>
    </header>
  );
}

export default Header;