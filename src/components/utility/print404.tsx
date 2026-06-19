import { Link } from 'react-router-dom';
import "../../styles/utility/print404.css";

export default function Notfound404() {
  return (
    <div className="not-found-wrapper">
      <div className="not-found-container">
        
        {/* エラーのビジュアルエリア */}
        <div className="not-found-visual">
          {/* 404用のイラストや画像があればここに配置（なければテキストだけでも成立します） */}
          <img 
            src="/images/404-illustration.svg" 
            alt="404 Not Found" 
            className="not-found-image" 
            onError={(e) => {
              // 画像がない場合のフォールバック（非表示にする、またはプレースホルダーにする）
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="not-found-code">404</h1>
        </div>

        {/* テキストエリア */}
        <div className="not-found-content">
          <h2 className="not-found-title">ページが見つかりません</h2>
          <p className="not-found-message">
            お探しのページは削除されたか、URLが変更された可能性があります。<br />
            または、現在絶賛開発中のエリアかもしれません！
          </p>
        </div>

        {/* アクションエリア */}
        <div className="not-found-actions">
          <Link to="/" className="btn-home-back">
            トップページへ戻る
          </Link>
        </div>

      </div>
    </div>
  );
}