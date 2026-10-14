import { Link } from "react-router-dom";
import { useUniversity } from "../components/university/universityContextValue";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import CircleSearchPanel from "../components/circle/CircleSearchPanel";
import CircleCard from "../components/circle/CircleCard";
import ClassPagination from "../components/class/ClassPagination";
import { mockCircles } from "../components/circle/mockCircles";
import "../styles/class/Class.css";
import "../styles/class/ClassSortBar.css";
import "../styles/circle/Circle.css";

function Circle() {
  const { path } = useUniversity();

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <p className="classBreadcrumb">
          <Link to={path()} className="classBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt; サークル・課外活動 &gt; サークル検索
        </p>

        <CircleSearchPanel />

        <div className="classSortBar circleSortBar">
          <p>
            <span className="circleNumber">{mockCircles.length}</span>件/
            <span className="circleNumber">{mockCircles.length}</span>件中
          </p>
          <label>
            <span>並び替え</span>
            <select defaultValue="name">
              <option value="name">名前順</option>
              <option value="members">人数順</option>
            </select>
          </label>
        </div>

        <div className="circleCardList">
          {mockCircles.map((circle) => (
            <CircleCard circle={circle} key={circle.id} />
          ))}
        </div>

        <ClassPagination currentPage={1} totalPages={12} onChangePage={() => {}} />
      </main>
      <Footer />
    </div>
  );
}

export default Circle;
