import { Link } from "react-router-dom";
import "../../styles/home/CategoryCard.css";

const categories = [
  {
    imageSrc: "/src/assets/CategoryCard/Bag.svg",
    title: "就活・キャリア",
    text: "インターン・就職活動や\nキャリア支援をまとめて確認",
    path: "/career",
    textClass: "catTextJob",
  },
  {
    imageSrc: "/src/assets/CategoryCard/Book.svg",
    title: "授業・履修",
    text: "授業の口コミや\n履修登録情報はこちら",
    path: "/Class",
    textClass: "catTextClass",
  },
  {
    imageSrc: "/src/assets/CategoryCard/People.svg",
    title: "サークル・課外活動",
    text: "サークルや団体別の情報を\nジャンル別に検索",
    path: "/club",
    textClass: "catTextClub",
  },
  {
    imageSrc: "/src/assets/CategoryCard/Eat.svg",
    title: "生活・便利情報",
    text: "学食・住まい・交通など\nキャンパスライフに役立つ情報",
    path: "/lifestyle",
    textClass: "catTextLife",
  },
  {
    imageSrc: "/src/assets/CategoryCard/Calendar.svg",
    title: "イベント・お知らせ",
    text: "学内イベントや学校からの\n最新情報をチェック",
    path: "/events",
    textClass: "catTextEvent",
  },
  {
    imageSrc: "/src/assets/CategoryCard/Network.svg",
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
