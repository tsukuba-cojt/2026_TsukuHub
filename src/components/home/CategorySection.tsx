import "../../styles/home/CategoryCard.css";
// もし React Router を使って画面遷移させる場合は、通常の <a> タグの代わりに <Link> を使うのがおすすめなのでインポートしておきます
import { Link } from "react-router-dom"; 

const categories = [
  {
    imageSrc: "/src/assets/CategoryCard/Bag.svg",
    title: "就活・キャリア",
    text: "インターン・就職活動やキャリア支援をまとめて確認",
    path: "/career",
    color: "#7134FF",
  },
  {
    imageSrc: "/src/assets/CategoryCard/Book.svg",
    title: "授業・履修",
    text: "授業の口コミや履修登録に役立つ情報",
    path: "/Class",
    color: "#0F4FF1",
  },
  {
    imageSrc: "/src/assets/CategoryCard/People.svg",
    title: "サークル・課外活動",
    text: "サークル・団体の情報や新歓情報",
    path: "/club",
    color: "#17C88E",
  },
  {
    imageSrc: "/src/assets/CategoryCard/eat.svg",
    title: "生活・便利情報",
    text: "学食・住まい・交通などキャンパスライフに役立つ情報",
    path: "/lifestyle",
    color: "#FDC93C",
  },
  {
    imageSrc: "/src/assets/CategoryCard/Calendar.svg",
    title: "イベント・お知らせ",
    text: "学内イベントや重要なお知らせを確認",
    path: "/events",
    color: "#FF5689",
  },
  {
    imageSrc: "/src/assets/CategoryCard/Network.svg",
    title: "留学・国際交流",
    text: "留学プログラムや国際交流情報",
    path: "/global",
    color: "#12EDFD",
  },
];

function CategorySection() {
  return (
    <section className="categorySection">
      {categories.map((category) => (
        <Link 
          to={category.path} 
          className="categoryCard" 
          key={category.title}
          style={{ "--card-color": category.color } as React.CSSProperties}
        >
          <img src={category.imageSrc} alt="" className="categoryIcon" />
          <h3>{category.title}</h3>
          <p>{category.text}</p>
          <span className="arrow">›</span>
        </Link>
      ))}
    </section>
  );
}

export default CategorySection;