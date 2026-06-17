import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/utility/Header.css';

// export default function を使うことで、別ファイルから { } なしで簡単にインポートできるようにします
export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // 確定時に検索結果ページへ遷移する処理
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        
        {/* 左側：ロゴ・ブランドエリア */}
        <div className="header-left">
          <Link to="/" className="logo-link">
            <img 
              src="src/assets/header/Property 1=Blue.svg" 
              alt="TsukuHub Logo" 
              className="logo-image" 
            />
            <span className="logo-text">TsukuHub</span>
          </Link>
          <span className="tagline">筑波大生のためのキャンパス情報ポータル</span>
        </div>

        {/* 右側：検索 ＆ アクションエリア */}
        <div className="header-right">
          {/* 検索ボックス */}
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-box-wrapper">
              <input
                type="text"
                placeholder="キーワードで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button" aria-label="検索">
                <img 
                  src="src/assets/header/Search.svg" 
                  alt="" 
                  className="search-icon-image" 
                />
              </button>
            </div>
          </form>

          {/* ボタン類 */}
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-login">ログイン</Link>
            <Link to="/register" className="btn btn-register">新規登録</Link>
          </div>
        </div>

      </div>
    </header>
  );
}