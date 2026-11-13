import { Link } from "react-router-dom";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import TimetableShareWizard from "../components/timetableShare/TimetableShareWizard";
import { useUniversity } from "../components/university/universityContextValue";
import "../styles/class/Class.css";
import "../styles/class/Timetable.css";
import "../styles/class/TimetableShare.css";

function TimetableShare() {
  const { path } = useUniversity();

  return (
    <div className="classPage">
      <Globalnav />

      <main className="classPageLayout">
        <p className="classBreadcrumb">
          <Link to={path()} className="classBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt;{" "}
          <Link to={path("/class/top")} className="classBreadcrumbLink">
            授業・履修
          </Link>{" "}
          &gt;{" "}
          <Link to={path("/timetable")} className="classBreadcrumbLink">
            みんなの時間割
          </Link>{" "}
          &gt; 時間割登録
        </p>

        <TimetableShareWizard
          cancelPath={path("/timetable")}
          primaryDone={{ label: "マイページで確認する", path: path("/mypage") }}
          secondaryDone={{ label: "履修トップページへ", path: path("/class/top") }}
          mypagePath={path("/mypage")}
        />
      </main>

      <Footer />
    </div>
  );
}

export default TimetableShare;
