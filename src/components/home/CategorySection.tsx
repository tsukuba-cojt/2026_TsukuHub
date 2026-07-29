import { Link } from "react-router-dom";
import "../../styles/home/CategoryCard.css";
import bagIcon from "../../assets/home/CategoryCard/Bag.svg";
import bookIcon from "../../assets/home/CategoryCard/Book.svg";
import peopleIcon from "../../assets/home/CategoryCard/People.svg";
import eatIcon from "../../assets/home/CategoryCard/Eat.svg";
import calendarIcon from "../../assets/home/CategoryCard/Calendar.svg";
import networkIcon from "../../assets/home/CategoryCard/Network.svg";

const categories = [
  {
    imageSrc: bagIcon,
    title: "就活・キャリア",
    text: "インターン・就職活動や\nキャリア支援をまとめて確認",
    path: "/career",
    textClass: "catTextJob",
  },
  {
    imageSrc: bookIcon,
    title: "授業・履修",
    text: "授業の口コミや\n履修登録情報はこちら",
    path: "/class/top",
    textClass: "catTextClass",
  },
  {
    imageSrc: peopleIcon,
    title: "サークル・課外活動",
    text: "サークルや団体別の情報を\nジャンル別に検索",
    path: "/circles",
    textClass: "catTextClub",
  },
  {
    imageSrc: eatIcon,
    title: "生活・便利情報",
    text: "学食・住まい・交通など\nキャンパスライフに役立つ情報",
    path: "/lifestyle",
    textClass: "catTextLife",
  },
  {
    imageSrc: calendarIcon,
    title: "イベント・お知らせ",
    text: "学内イベントや学校からの\n最新情報をチェック",
    path: "/events",
    textClass: "catTextEvent",
  },
  {
    imageSrc: networkIcon,
    title: "留学・国際交流",
    text: "留学プログラムや\n国際交流の情報を掲載",
    path: "/global",
    textClass: "catTextGlobal",
  },
];

function CategorySection() {
  return (
    <div className="categorySection">
      <div className="categorySectionInner">
        {categories.map((cat) => (
          <Link to={cat.path} className="categoryCard" key={cat.title}>
            <img src={cat.imageSrc} alt="" className="categoryIcon" />
            <h3 className={cat.textClass}>{cat.title}</h3>
            <p>{cat.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategorySection;
