import { Link } from "react-router-dom";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import ClassTopHero from "../components/class/ClassTopHero";
import ClassTopFeatureCards from "../components/class/ClassTopFeatureCards";
import ClassTopBookmarks, {
  type BookmarkedCourse,
} from "../components/class/ClassTopBookmarks";
import ClassTopNews from "../components/class/ClassTopNews";
import ClassTopLinks from "../components/class/ClassTopLinks";
import "../styles/class/Class.css";
import "../styles/class/ClassTop.css";

// ブックマーク機構が未実装のため、当面はダミー配列を渡す。
// 実データ接続時はこの配列を Supabase からの取得結果に差し替えるだけでよい。
const dummyBookmarks: BookmarkedCourse[] = [
  {
    code: "GB10601",
    category: "専門基礎科目",
    categoryClass: "isBlue",
    title: "情報メディア概論",
    department: "情報学群",
    schedule: "月2 3限",
    rating: 4.3,
    reviews: 48,
  },
  {
    code: "GB11504",
    category: "専門科目",
    categoryClass: "isPurple",
    title: "インタラクティブCG",
    department: "情報学群",
    schedule: "火3 4限",
    rating: 4.6,
    reviews: 35,
  },
  {
    code: "AB20301",
    category: "教養科目",
    categoryClass: "isGreen",
    title: "現代社会と倫理",
    department: "人文・文化学群",
    schedule: "木 4限",
    rating: 4.2,
    reviews: 27,
  },
  {
    code: "PE10122",
    category: "体育",
    categoryClass: "isTeal",
    title: "スポーツ・健康科学",
    department: "体育系",
    schedule: "金 2限",
    rating: 4.1,
    reviews: 19,
  },
  {
    code: "FA01231",
    category: "基礎科目",
    categoryClass: "isYellow",
    title: "微分積分学Ⅰ",
    department: "理工学群",
    schedule: "月1 2限",
    rating: 4.4,
    reviews: 62,
  },
];

function ClassTop() {
  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <p className="classBreadcrumb">
          <Link to="/" className="classBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt; 授業・履修
        </p>

        <ClassTopHero />
        <ClassTopFeatureCards />

        <div className="classTopColumns">
          <ClassTopBookmarks bookmarks={dummyBookmarks} />
          <ClassTopNews />
        </div>

        <ClassTopLinks />
      </main>
      <Footer />
    </div>
  );
}

export default ClassTop;
