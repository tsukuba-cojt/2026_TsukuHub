import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useUniversity } from "../university/universityContextValue";
import Globalnav from "../utility/Globalnav";
import Footer from "../utility/Footer";
import { circleCategoryClass, type Circle } from "./mockCircles";
import "../../styles/class/Class.css";
import "../../styles/class/ClassDetail.css";
import "../../styles/career/CareerPlatform.css";
import "../../styles/circle/CircleCard.css";
import "../../styles/circle/CircleDetail.css";
import "../../styles/circle/CircleSubPage.css";

type CircleSubPageProps = {
  circle: Circle | undefined;
  circleId: string | undefined;
  label: string;
  children: ReactNode;
};

// サークル詳細配下の一覧ページ（お知らせ一覧・口コミ一覧）の共通レイアウト
export default function CircleSubPage({ circle, circleId, label, children }: CircleSubPageProps) {
  const { path } = useUniversity();

  if (!circle) {
    return (
      <div className="classPage">
        <Globalnav />
        <main className="classPageLayout">
          <div className="classDetailNotFound">
            <p className="classStatus">該当するサークルが見つかりませんでした（ID：{circleId}）。</p>
            <Link to={path("/circles/search")} className="classDetailBackLink">
              サークル検索へ戻る
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const detailPath = path(`/circles/${circle.id}`);

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <p className="classBreadcrumb">
          <Link to={path()} className="classBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt; サークル・課外活動 &gt;{" "}
          <Link to={path("/circles/search")} className="classBreadcrumbLink">
            サークル検索
          </Link>{" "}
          &gt;{" "}
          <Link to={detailPath} className="classBreadcrumbLink">
            {circle.name}
          </Link>{" "}
          &gt; {label}
        </p>

        <div className="classDetailPanel">
          <section className="sidebarCard circleSubPageHeader">
            <div className="circleSubPageCircle">
              <div className="circleSubPageImage">{circle.image && <img src={circle.image} alt="" />}</div>
              <div>
                <span className={`circleCategoryBadge ${circleCategoryClass[circle.category]}`}>{circle.category}</span>
                <p className="circleSubPageName">{circle.name}</p>
              </div>
            </div>
            <Link to={detailPath} className="circleDetailMore">
              <ChevronLeft aria-hidden="true" />
              サークル詳細へ戻る
            </Link>
          </section>

          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
