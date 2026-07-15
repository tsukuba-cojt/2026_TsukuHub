import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { Bell, Search } from "lucide-react";
import "../../styles/utility/Header.css";
import logoBlue from "../../assets/utility/header_footer/logo-blue.svg";
import sparkleIcon from "../../assets/utility/header_footer/icon-sparkle.svg";
import sparkleBlueIcon from "../../assets/utility/header_footer/icon-sparkle-blue.svg";

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
      {/* --color-primary-gradient と同じ色停止（#1578FD → #075FDF, 90deg）を
          検索アイコンの stroke 用に定義（userSpaceOnUse・lucide の viewBox 24x24 基準） */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute" }}
      >
        <defs>
          <linearGradient
            id="headerSearchGradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="24"
            y2="0"
          >
            <stop offset="0%" stopColor="#1578FD" />
            <stop offset="100%" stopColor="#075FDF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo-link">
            {/* Sparkle blue — アイコン左下 */}
            <img
              src={sparkleBlueIcon}
              alt=""
              className="logo-sparkle-blue"
              aria-hidden="true"
            />
            <img
              src={logoBlue}
              alt="TsukuHub Logo"
              className="logo-image"
            />
            <div className="logo-text-group">
              <span className="logo-text">
                TsukuHub
                {/* Sparkle yellow — ロゴタイプ右上 */}
                <img
                  src={sparkleIcon}
                  alt=""
                  className="logo-sparkle-yellow"
                  aria-hidden="true"
                />
              </span>
              <span className="tagline">筑波大生のためのキャンパス情報ポータル</span>
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
                <Search className="search-icon-image" aria-hidden="true" />
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
                <Bell className="notification-icon" aria-hidden="true" />
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
                    <img
                      src="/src/assets/utility/header_footer/People.svg"
                      alt=""
                      aria-hidden="true"
                    />
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