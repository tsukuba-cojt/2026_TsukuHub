import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/utility/Header.css";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <img
              src="/src/assets/header/Property 1=Blue.svg"
              alt="TsukuHub Logo"
              className="logo-image"
            />
            <div className="logo-text-group">
              <span className="logo-text">
                TsukuHub
                {/* Sparkle yellow — icon-sparkle.svg arrives later */}
                <img
                  src="/src/assets/icon-sparkle.svg"
                  alt=""
                  className="logo-sparkle-yellow"
                  aria-hidden="true"
                />
              </span>
              <span className="tagline">筑波大生のためのキャンパス情報ポータル</span>
              {/* Sparkle blue */}
              <img
                src="/src/assets/icon-sparkle.svg"
                alt=""
                className="logo-sparkle-blue"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>

        <div className="header-right">
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
                  src="/src/assets/header/Search.svg"
                  alt=""
                  className="search-icon-image"
                />
              </button>
            </div>
          </form>

          <div className="auth-buttons">
            <Link to="/login" className="btn btn-login">
              ログイン
            </Link>
            <Link to="/signup" className="btn btn-register">
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
