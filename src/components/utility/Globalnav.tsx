import "../../styles/utility/Globalnav.css";
import "../../styles/utility/ComingSoon.css";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  House,
  BriefcaseBusiness,
  BookOpen,
  UsersRound,
  Utensils,
  Globe,
  Info,
  Mail,
  ChevronRight,
} from "lucide-react";
import { classMenuItems } from "./classMenuItems";
import { careerMenuItems } from "./careerMenuItems";
import { COMING_SOON_NOTICE, isComingSoon } from "../../data/comingSoon";

const navItems = [
  { icon: House, label: "ホーム", path: "/" },
  { icon: BriefcaseBusiness, label: "キャリア・インターン", path: "/career" },
  { icon: BookOpen, label: "講義・履修", path: "/class/top" },
  { icon: UsersRound, label: "サークル・課外活動", path: "/circles" },
  { icon: Utensils, label: "生活・便利情報", path: "/lifestyle" },
  { icon: Globe, label: "留学・国際交流", path: "/global" },
  { icon: Info, label: "TsukuHubとは", path: "/about" },
  { icon: Mail, label: "お問い合わせ", path: "/contact" },
];

const dropdownMenus = {
  "/career": {
    title: "キャリア・インターン",
    description:
      "就活の基礎から長期インターン、卒業生の体験記まで。筑波大生のキャリア選択をサポートします。",
    imageLabel: "キャリア・インターンのイメージ画像（準備中）",
    items: careerMenuItems,
  },
  "/class/top": {
    title: "講義・履修",
    description:
      "授業の検索や履修計画、卒業要件の確認まで。筑波大生の学びをサポートする機能がそろっています。",
    imageLabel: "講義・履修のイメージ画像（準備中）",
    items: classMenuItems,
  },
} as const;

type DropdownPath = keyof typeof dropdownMenus;

function Globalnav() {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<DropdownPath | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // メニュー外クリックで閉じる（Header のマイページメニューと同じパターン）
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ESC キーでも閉じる
  useEffect(() => {
    if (!openMenu) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openMenu]);

  // ホーム（トップページ）の一番上にいる間だけ背景を透明にする
  const isTransparent = pathname === "/" && !isScrolled;

  return (
    <header
      className={`globalHeader${isTransparent ? " isTransparent" : ""}`}
    >
      {/* --color-main-gradient と同じ色停止（#1578FD → #5E2CFC, 90deg）を SVG stroke 用に定義 */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute" }}
      >
        <defs>
          {/* objectBoundingBox（デフォルト）だと幅・高さ0の直線パーツで
              グラデーションが描画されず線が消えるため、userSpaceOnUse で
              アイコンの viewBox（24x24）基準に固定する */}
          <linearGradient
            id="navIconGradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="24"
            y2="0"
          >
            <stop offset="0%" stopColor="#1578FD" />
            <stop offset="100%" stopColor="#5E2CFC" />
          </linearGradient>
        </defs>
      </svg>
      <nav className="headerNav" ref={navRef}>
        {navItems.map((item) => {
          const dropdown =
            item.path in dropdownMenus
              ? dropdownMenus[item.path as DropdownPath]
              : null;

          return dropdown ? (
            <div
              className={`navDropdownWrap${
                item.path === "/career" ? " isCareerDropdown" : ""
              }`}
              key={item.label}
              onMouseEnter={() => setOpenMenu(item.path as DropdownPath)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <NavLink
                to={item.path}
                className="navLinkItem"
                aria-haspopup="menu"
                aria-expanded={openMenu === item.path}
                onClick={() => setOpenMenu(null)}
              >
                <item.icon className="navIcon" aria-hidden="true" />
                <span className="navLabel">{item.label}</span>
              </NavLink>

              {openMenu === item.path && (
                <div className="navDropdown" role="menu">
                  <span className="navDropdownTail" aria-hidden="true" />
                  <div className="navDropdownIntro">
                    <p className="navDropdownTitle">{dropdown.title}</p>
                    <p className="navDropdownDesc">
                      {dropdown.description}
                    </p>
                    <div
                      className="navDropdownImage"
                      role="img"
                      aria-label={dropdown.imageLabel}
                    />
                  </div>
                  <ul className="navDropdownColumns">
                    {dropdown.items.map((menu) => (
                      <li key={menu.label}>
                        <Link
                          to={menu.path}
                          className="navDropdownCard"
                          role="menuitem"
                          onClick={() => setOpenMenu(null)}
                        >
                          <span
                            className={`navDropdownIconCircle ${menu.colorClass}`}
                          >
                            <menu.icon aria-hidden="true" />
                          </span>
                          <span
                            className={`navDropdownCardLabel ${menu.colorClass}`}
                          >
                            {menu.label}
                          </span>
                          <span
                            className="navDropdownCardDivider"
                            aria-hidden="true"
                          />
                          <span className="navDropdownCardLink">
                            {menu.linkLabel}
                            <ChevronRight aria-hidden="true" />
                          </span>
                          <ChevronRight
                            className="navDropdownRowChevron"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : isComingSoon(item.path) ? (
            /* 未実装ページ（src/data/comingSoon.ts で管理）は遷移させず、
               ホバー・フォーカス時に「準備中」ポップアップを出す。
               NavLink ではなく span にすることで、中クリックや
               「新しいタブで開く」からも遷移できないようにしている。 */
            <span
              key={item.label}
              className="navLinkItem isComingSoon"
              role="link"
              aria-disabled="true"
              tabIndex={0}
              title={COMING_SOON_NOTICE}
            >
              <item.icon className="navIcon" aria-hidden="true" />
              <span className="navLabel">{item.label}</span>
              <span className="comingSoonTip" aria-hidden="true">
                {COMING_SOON_NOTICE}
              </span>
            </span>
          ) : (
            <NavLink to={item.path} key={item.label} className="navLinkItem">
              <item.icon className="navIcon" aria-hidden="true" />
              <span className="navLabel">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}

export default Globalnav;
