import { Link } from "react-router-dom";
import "../../styles/home/CategoryCard.css";
import "../../styles/utility/ComingSoon.css";
import { COMING_SOON_NOTICE, isUniversityComingSoon } from "../../data/comingSoon";
import bagIcon from "../../assets/home/CategoryCard/Bag.svg";
import bookIcon from "../../assets/home/CategoryCard/Book.svg";
import peopleIcon from "../../assets/home/CategoryCard/People.svg";
import eatIcon from "../../assets/home/CategoryCard/Eat.svg";
import networkIcon from "../../assets/home/CategoryCard/Network.svg";
import { useUniversity } from "../university/universityContextValue";

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
    imageSrc: networkIcon,
    title: "留学・国際交流",
    text: "留学プログラムや\n国際交流の情報を掲載",
    path: "/global",
    textClass: "catTextGlobal",
  },
];

function CategorySection() {
  const { path, isFeatureEnabled } = useUniversity();
  return (
    <div className="categorySection">
      <div className="categorySectionInner">
        {categories.map((cat) => {
          const cardInner = (
            <>
              <img src={cat.imageSrc} alt="" className="categoryIcon" />
              <h3 className={cat.textClass}>{cat.title}</h3>
              <p>{cat.text}</p>
            </>
          );

          /* 未実装ページ（src/data/comingSoon.ts で管理）は遷移させず、
             ホバー・フォーカス時に「準備中」ポップアップを出す。
             Link ではなく span にすることで、中クリックや
             「新しいタブで開く」からも遷移できないようにしている。 */
          return isUniversityComingSoon(cat.path, isFeatureEnabled) ? (
            <span
              key={cat.title}
              className="categoryCard isComingSoon"
              role="link"
              aria-disabled="true"
              tabIndex={0}
            >
              {cardInner}
              <span className="comingSoonTip" role="tooltip">
                {COMING_SOON_NOTICE}
              </span>
            </span>
          ) : (
            <Link to={path(cat.path)} className="categoryCard" key={cat.title}>
              {cardInner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySection;
