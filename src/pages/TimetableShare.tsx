import { Link } from "react-router-dom";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import TimetableShareWizard from "../components/timetableShare/TimetableShareWizard";
import "../styles/class/Class.css";
import "../styles/class/Timetable.css";
import "../styles/class/TimetableShare.css";

/**
 * 時間割登録ページ（/timetable/share）。
 *
 * ウィザード本体は TimetableShareWizard に切り出してあり、このページは
 * 「授業・履修から来た場合」の遷移先だけを渡す薄いラッパー。
 * マイページから同じフローを開くときは、別ページで同じウィザードに
 * 別の遷移先を渡せばよい。
 */
function TimetableShare() {
  return (
    <div className="classPage">
      <Globalnav />

      <main className="classPageLayout">
        <p className="classBreadcrumb">
          <Link to="/" className="classBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt;{" "}
          <Link to="/class/top" className="classBreadcrumbLink">
            授業・履修
          </Link>{" "}
          &gt;{" "}
          <Link to="/timetable" className="classBreadcrumbLink">
            みんなの時間割
          </Link>{" "}
          &gt; 時間割登録
        </p>

        <TimetableShareWizard
          cancelPath="/timetable"
          primaryDone={{ label: "マイページで確認する", path: "/mypage" }}
          secondaryDone={{ label: "履修トップページへ", path: "/class/top" }}
        />
      </main>

      <Footer />
    </div>
  );
}

export default TimetableShare;
