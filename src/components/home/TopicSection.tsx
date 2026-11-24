import { Link } from "react-router-dom";
import "../../styles/home/TopicSection.css";
import "../../styles/utility/Tags.css";
import type { InternshipSummary } from "../../types/career";
import { BriefcaseBusiness } from "lucide-react";
import crownIcon from "../../assets/home/TopicSection/icon-crown.svg";
import { useUniversity } from "../university/universityContextValue";

function TopicSection({ internships, loading, error }: { internships: InternshipSummary[]; loading: boolean; error: boolean }) {
  const { path } = useUniversity();
  return (
    <section className="panel topicPanel">
      <div className="panelTitle">
        {/* icon-crown.svg — replace when asset arrives */}
        <img src={crownIcon} alt="" />
        <h2>注目の長期インターン</h2>
      </div>

      <div className="topicList" aria-busy={loading}>
        {(loading || error || internships.length === 0) && (
          <p className="topicEmpty" role="status">{loading ? "求人を読み込み中…" : error ? "求人を取得できませんでした。時間をおいて再度お試しください。" : "現在掲載中の長期インターンはありません。"}</p>
        )}
        {internships.map((item) => {
          const image = item.cover_image_url || item.company_logo_url;
          return (
            <Link className="topicItem" key={item.id} to={path(`/career/internships/${item.id}`)}>
              <div className="topicThumb tagJob">
                {image ? <img className={item.cover_image_url ? "topicJobCover" : "topicJobLogo"} src={image} alt="" loading="lazy" /> : <BriefcaseBusiness aria-hidden="true" />}
              </div>
              <div className="topicMeta">
                <div className="topicJobTags"><span className="tag tagJob">{item.job_category || "長期インターン"}</span>{item.is_featured && <span className="tag tagJob">おすすめ</span>}</div>
                <h3>{item.title}</h3>
                <p>{item.company_name}</p>
                <p>{item.location || (item.is_remote ? "リモート勤務可" : "勤務地は詳細をご確認ください")}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link className="panelLink" to={path("/career/internships")}>
        長期インターン一覧へ
      </Link>
    </section>
  );
}

export default TopicSection;
