import { type User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

type Props = {
  user: User | null;
  onLogout: () => void;
};

function Header({ user, onLogout }: Props) {
  return (
    <header className="header">
      <div className="headerTop">
        <div className="logoArea">
          <div className="logoMark">✿</div>
          <div>
            <div className="logoText">TsukuHub</div>
            <div className="logoSub">筑波大生のためのキャンパス情報ポータル</div>
          </div>
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
          {user ? (
            <div className="userArea">
              <span className="userEmail">{user.email}</span>
              <Link to="/mypage" className="mypageButton">マイページ</Link>
              <button className="logoutButton" onClick={onLogout}>ログアウト</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="loginButton">ログイン</Link>
              <Link to="/signup" className="registerButton">新規登録</Link>
            </>
          )}
        </div>
      </div>

      <nav className="globalNav">
        <a href="#">ホーム</a>
        <a href="#">就活・キャリア</a>
        <a href="#">授業・履修</a>
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