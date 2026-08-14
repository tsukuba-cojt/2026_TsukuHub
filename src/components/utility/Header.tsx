import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  BriefcaseBusiness,
  Globe,
  House,
  Menu,
  ShieldCheck,
  UsersRound,
  Utensils,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/authContextValue";
import { useUniversity } from "../university/universityContextValue";
import { clearActiveUniversitySlug } from "../../lib/tenantSession";
import { COMING_SOON_NOTICE, isUniversityComingSoon } from "../../data/comingSoon";
import "../../styles/utility/Header.css";
import logoBlue from "../../assets/utility/header_footer/logo-blue.svg";
import sparkleIcon from "../../assets/utility/header_footer/icon-sparkle.svg";
import sparkleBlueIcon from "../../assets/utility/header_footer/icon-sparkle-blue.svg";

const mobileNavItems = [
  { icon: House, label: "ホーム", path: "/" },
  { icon: BriefcaseBusiness, label: "キャリア・インターン", path: "/career" },
  { icon: BookOpen, label: "講義・履修", path: "/class/top" },
  { icon: UsersRound, label: "サークル・課外活動", path: "/circles" },
  { icon: Utensils, label: "生活・便利情報", path: "/lifestyle" },
  { icon: Globe, label: "留学・国際交流", path: "/global" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { university, path, isFeatureEnabled } = useUniversity();

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  // 検索は未実装。Enter キーでの送信も含め、何も起こらないようにする
  // （検索ボックス非表示に伴い一時コメントアウト）
  // const handleSearchSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  // };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearActiveUniversitySlug();
    setMenuOpen(false);
    navigate(path());
  };

  return (
    <header className="main-header">
      {/* 検索ボックス非表示に伴いコメントアウト（参照元は .search-icon-image のみ）。
          --color-primary-gradient と同じ色停止（#1578FD → #075FDF, 90deg）を
          検索アイコンの stroke 用に定義（userSpaceOnUse・lucide の viewBox 24x24 基準）

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
      */}
      <div className="header-container">
        <div className="header-left">
          <Link to={path()} className="logo-link">
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
              <span className="tagline">{university?.tagline ?? "大学生のためのキャンパス情報ポータル"}</span>
            </div>
          </Link>
        </div>

        <div className="header-right">
          {/* ===== 検索ボックス：今回のリリースでは非表示 =====
              将来復活させる可能性があるため、削除せずコメントアウトで残す。
              前回実装した「準備中」ツールチップ（.search-notice）も含めてそのまま保持。
              スタイル（.search-form / .search-box-wrapper / .search-input /
              .search-button / .search-notice）は Header.css に残してある。

              復活させる手順:
                1. このコメントの開き（上）と閉じ（下）を外す
                2. 「// ホバー時の吹き出し…」の行を JSX コメント形式に戻す（任意）
                   ※ ネストした JSX コメントは外側のコメントを閉じてしまうため、
                     一時的に行コメント形式にしてある
                3. ファイル冒頭の import と SEARCH_NOTICE / handleSearchSubmit、
                   および headerSearchGradient の svg/defs のコメントアウトも外す

          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-box-wrapper">
              <input
                type="text"
                placeholder="キーワードで検索"
                className="search-input"
                readOnly
                aria-disabled="true"
                title={SEARCH_NOTICE}
              />
              <button
                type="button"
                className="search-button"
                aria-disabled="true"
                aria-label={`検索（${SEARCH_NOTICE}）`}
                title={SEARCH_NOTICE}
                onClick={(e) => e.preventDefault()}
              >
                <Search className="search-icon-image" aria-hidden="true" />
                // ホバー時の吹き出し。読み上げは title / aria-label に任せる
                <span className="search-notice" aria-hidden="true">
                  {SEARCH_NOTICE}
                </span>
              </button>
            </div>
          </form>
          */}

          {user ? (
            <div className="user-area">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="admin-page-button"
                  aria-label="管理者画面へ移動"
                >
                  <ShieldCheck className="admin-page-icon" aria-hidden="true" />
                  <span className="admin-page-label">管理者画面</span>
                </Link>
              )}

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
                      to={path("/mypage")}
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      ユーザー情報
                    </Link>
                    <Link
                      to={path("/mypage/applications")}
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      応募状況
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
              <Link to={path("/login")} className="btn btn-login">
                ログイン
              </Link>
              <Link to={path("/signup")} className="btn btn-register">
                新規登録
              </Link>
            </div>
          )}

          <div className="mobile-nav-menu" ref={mobileMenuRef}>
            <button
              type="button"
              className="mobile-nav-toggle"
              aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>

            {mobileMenuOpen && (
              <div className="mobile-nav-panel">
                {mobileNavItems.map((item) => {
                  const ItemIcon = item.icon;
                  const comingSoon = isUniversityComingSoon(item.path, isFeatureEnabled);
                  return comingSoon ? (
                    <button
                      type="button"
                      className="mobile-nav-panel-item isComingSoon"
                      key={item.label}
                      title={COMING_SOON_NOTICE}
                      aria-disabled="true"
                      onClick={(e) => e.preventDefault()}
                    >
                      <ItemIcon aria-hidden="true" />
                      <span>{item.label}</span>
                      <small>準備中</small>
                    </button>
                  ) : (
                    <Link
                      className="mobile-nav-panel-item"
                      to={path(item.path)}
                      key={item.label}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ItemIcon aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
