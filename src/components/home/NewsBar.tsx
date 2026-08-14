import { Link } from "react-router-dom";
import { useUniversity } from "../university/universityContextValue";
import "../../styles/home/NewsBar.css";

function NewsBar({ title }: { title?: string }) {
  const { path } = useUniversity();
  return (
    <div className="newsBarWrap">
      <div className="newsBar">
        <span className="newsLabel">お知らせ</span>
        <span className="newsText">
          {title ?? "現在、新しいお知らせはありません。"}
        </span>
        <Link className="newsLink" to={path("/news")}>
          お知らせ一覧へ
        </Link>
      </div>
    </div>
  );
}

export default NewsBar;
