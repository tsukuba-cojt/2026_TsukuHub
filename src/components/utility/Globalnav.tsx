import "../../styles/utility/Globalnav.css";
import { NavLink } from "react-router-dom"; 

const navItems = [
  { icon: "/src/assets/Globalnav/HomeMono.svg", label: "ホーム", path: "/" },
  { icon: "/src/assets/Globalnav/BagMono.svg", label: "就活・キャリア", path: "/career" },
  { icon: "/src/assets/Globalnav/BookMono.svg", label: "授業・履修", path: "/classes" },
  { icon: "/src/assets/Globalnav/PeopleMono.svg", label: "サークル・課外活動", path: "/circles" },
  { icon: "/src/assets/Globalnav/eatMono.svg", label: "生活・便利情報", path: "/lifestyle" },
  { icon: "/src/assets/Globalnav/NetworkMono.svg", label: "留学・国際交流", path: "/global" },
  { icon: "/src/assets/Globalnav/InformationMono.svg", label: "TsukuHubとは", path: "/about" },
  { icon: "/src/assets/Globalnav/MailMono.svg", label: "お問い合わせ", path: "/contact" },
];

function Globalnav() {
  return (
    <header className="globalHeader">
      <nav className="headerNav">
        {navItems.map((item) => (
          <NavLink 
            to={item.path} 
            key={item.label}
            className="navLinkItem"
          >
            {/* ★ アイコン部分（画像を使う場合は <img src="..." /> に変更してください） */}
            <img src={item.icon} alt="" className="navIcon" />
            <span className="navLabel">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Globalnav;

