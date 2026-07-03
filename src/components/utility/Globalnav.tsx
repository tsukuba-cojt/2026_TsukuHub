import "../../styles/utility/Globalnav.css";
import { NavLink } from "react-router-dom";
import homeMonoIcon from "../../assets/utility/Globalnav/HomeMono.svg";
import bagMonoIcon from "../../assets/utility/Globalnav/BagMono.svg";
import bookMonoIcon from "../../assets/utility/Globalnav/BookMono.svg";
import peopleMonoIcon from "../../assets/utility/Globalnav/PeopleMono.svg";
import eatMonoIcon from "../../assets/utility/Globalnav/EatMono.svg";
import netWorkMonoIcon from "../../assets/utility/Globalnav/NetWorkMono.svg";
import informationMonoIcon from "../../assets/utility/Globalnav/InformationMono.svg";
import mailMonoIcon from "../../assets/utility/Globalnav/MailMono.svg";

const navItems = [
  { icon: homeMonoIcon, label: "ホーム", path: "/" },
  { icon: bagMonoIcon, label: "就活・キャリア", path: "/career" },
  { icon: bookMonoIcon, label: "授業・履修", path: "/class" },
  { icon: peopleMonoIcon, label: "サークル・課外活動", path: "/circles" },
  { icon: eatMonoIcon, label: "生活・便利情報", path: "/lifestyle" },
  { icon: netWorkMonoIcon, label: "留学・国際交流", path: "/global" },
  { icon: informationMonoIcon, label: "TsukuHubとは", path: "/about" },
  { icon: mailMonoIcon, label: "お問い合わせ", path: "/contact" },
];

function Globalnav() {
  return (
    <header className="globalHeader">
      <nav className="headerNav">
        {navItems.map((item) => (
          <NavLink to={item.path} key={item.label} className="navLinkItem">
            <img src={item.icon} alt="" className="navIcon" />
            <span className="navLabel">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Globalnav;
