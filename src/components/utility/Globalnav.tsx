import "../../styles/utility/Globalnav.css";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  House,
  BriefcaseBusiness,
  BookOpen,
  UsersRound,
  Utensils,
  Globe,
  Info,
  Mail,
} from "lucide-react";

const navItems = [
  { icon: House, label: "ホーム", path: "/" },
  { icon: BriefcaseBusiness, label: "就活・キャリア", path: "/career" },
  { icon: BookOpen, label: "授業・履修", path: "/class" },
  { icon: UsersRound, label: "サークル・課外活動", path: "/circles" },
  { icon: Utensils, label: "生活・便利情報", path: "/lifestyle" },
  { icon: Globe, label: "留学・国際交流", path: "/global" },
  { icon: Info, label: "TsukuHubとは", path: "/about" },
  { icon: Mail, label: "お問い合わせ", path: "/contact" },
];

function Globalnav() {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <nav className="headerNav">
        {navItems.map((item) => (
          <NavLink to={item.path} key={item.label} className="navLinkItem">
            <item.icon className="navIcon" aria-hidden="true" />
            <span className="navLabel">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Globalnav;
