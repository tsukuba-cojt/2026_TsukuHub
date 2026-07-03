import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import "../../styles/utility/Header.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <img
              src="/src/assets/utility/header_footer/Property 1=Blue.svg"
              alt="TsukuHub Logo"
              className="logo-image"
            />
            <div className="logo-text-group">
              <span className="logo-text">
                TsukuHub
                {/* Sparkle yellow — icon-sparkle.svg arrives later */}
                <img
                  src="/src/assets/utility/header_footer/icon-sparkle.svg"
                  alt=""
                  className="logo-sparkle-yellow"
                  aria-hidden="true"
                />
              </span>
              <span className="tagline">筑波大生のためのキャンパス情報ポータル</span>
              {/* Sparkle blue */}
              <img
                src="/src/assets/utility/header_footer/icon-sparkle.svg"
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
                  src="/src/assets/utility/header_footer/Search.svg"
                  alt=""
                  className="search-icon-image"
                />
              </button>
            </div>
          </form>

          {session ? (
            <div className="user-area">
              {/* 通知ボタン */}
              <button
                type="button"
                className="notification-button"
                aria-label="通知"
                onClick={() => {
                  /* 通知の動作は今後実装 */
                }}
              >
                <svg
                  className="notification-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3a6 6 0 0 0-6 6v3.6l-1.4 2.8A1 1 0 0 0 5.5 17h13a1 1 0 0 0 .9-1.6L18 12.6V9a6 6 0 0 0-6-6Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 20a2 2 0 0 0 4 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="notification-dot" />
              </button>

              {/* マイページ プルダウン */}
              <div className="mypage-menu" ref={menuRef}>
                <button
                  type="button"
                  className="mypage-button"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <span className="mypage-avatar">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" fill="currentColor" />
                      <path
                        d="M4 20c0-4 3.6-6 8-6s8 2 8 6"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="mypage-label">マイページ</span>
                  <svg
                    className={`mypage-caret ${menuOpen ? "open" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="m6 9 6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="mypage-dropdown" role="menu">
                    <Link
                      to="/mypage"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      ユーザー情報
                    </Link>
                    <button
                      type="button"
                      className="dropdown-item dropdown-logout"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-login">
                ログイン
              </Link>
              <Link to="/signup" className="btn btn-register">
                新規登録
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}