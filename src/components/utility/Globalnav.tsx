import "../../styles/utility/Globalnav.css";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { icon: "/src/assets/utility/Globalnav/HomeMono.svg", label: "ホーム", path: "/" },
  { icon: "/src/assets/utility/Globalnav/BagMono.svg", label: "就活・キャリア", path: "/career" },
  { icon: "/src/assets/utility/Globalnav/BookMono.svg", label: "授業・履修", path: "/class" },
  { icon: "/src/assets/utility/Globalnav/PeopleMono.svg", label: "サークル・課外活動", path: "/circles" },
  { icon: "/src/assets/utility/Globalnav/eatMono.svg", label: "生活・便利情報", path: "/lifestyle" },
  { icon: "/src/assets/utility/Globalnav/NetworkMono.svg", label: "留学・国際交流", path: "/global" },
  { icon: "/src/assets/utility/Globalnav/InformationMono.svg", label: "TsukuHubとは", path: "/about" },
  { icon: "/src/assets/utility/Globalnav/MailMono.svg", label: "お問い合わせ", path: "/contact" },
];

function Globalnav() {
  const { pathname } = useLocation();

  return (
    <header className="globalHeader">
      <nav className="headerNav">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <NavLink
              to={item.path}
              key={item.label}
              className={() => `navLinkItem${isActive ? " active" : ""}`}
            >
              <img src={item.icon} alt="" className="navIcon" />
              <span className="navLabel">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}

export default Globalnav;

