import "../../styles/utility/Globalnav.css";
import { NavLink } from "react-router-dom";
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
  return (
    <header className="globalHeader">
      {/* --color-main-gradient と同じ色停止（#1578FD → #5E2CFC, 90deg）を SVG stroke 用に定義 */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute" }}
      >
        <defs>
          <linearGradient id="navIconGradient" x1="0" y1="0" x2="1" y2="0">
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
