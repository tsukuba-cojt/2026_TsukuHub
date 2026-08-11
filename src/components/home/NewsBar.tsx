import { Link } from "react-router-dom";
import "../../styles/home/NewsBar.css";

function NewsBar() {
  return (
    <div className="newsBarWrap">
      <div className="newsBar">
        <span className="newsLabel">お知らせ</span>
        <span className="newsText">
          5/20 【新機能リリース】気になる情報を保存できる「マイリスト」機能が追加されました！
        </span>
        <Link className="newsLink" to="/news">
          お知らせ一覧へ
        </Link>
      </div>
    </div>
  );
}

export default NewsBar;
