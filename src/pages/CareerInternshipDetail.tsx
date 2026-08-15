import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ApplicationForm from "../components/career/ApplicationForm";
import ArticleToc from "../components/career/ArticleToc";
import InternshipDetailContent, {
  internshipHeadings,
} from "../components/career/InternshipDetailContent";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { getInternship, listPublishedInternships } from "../services/careerService";
import type { Internship } from "../types/career";
import { useUniversity } from "../components/university/universityContextValue";
import "../styles/career/CareerPlatform.css";
import "../styles/career/CareerInternshipDetail.css";

export default function CareerInternshipDetail() {
  const { university, path } = useUniversity();
  const { internshipId = "" } = useParams();
  const [item, setItem] = useState<Internship | null>(null);
  const [related, setRelated] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!university) return;
    void Promise.all([
      getInternship(internshipId, university.id),
      listPublishedInternships(university.id),
    ])
      .then(([internship, internships]) => {
        setItem(internship);
        setRelated(internships.filter((entry) => entry.id !== internshipId).slice(0, 3));
      })
      .catch(() => setError("求人情報を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, [internshipId, university]);

  useEffect(() => {
    if (!showForm) return;
    document.getElementById("application")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showForm]);

  if (loading) {
    return (
      <div className="careerPlatform">
        <Globalnav />
        <main className="careerState">求人を読み込んでいます...</main>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="careerPlatform">
        <Globalnav />
        <main className="careerState isError">
          <h1>求人が見つかりません</h1>
          <p>{error || "公開が終了した可能性があります。"}</p>
          <Link to={path("/career/internships")}>求人一覧へ戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const closed =
    item.status !== "published" ||
    new Date(item.deadline).getTime() < currentTime;

  const handleApplicationSuccess = () => {
    setSuccess(true);
    setShowForm(false);
  };

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell internPostPage">
        <nav className="careerBreadcrumb" aria-label="パンくずリスト">
          <Link to={path("/career")}>キャリア・インターン</Link>
          <ChevronRight aria-hidden="true" />
          <Link to={path("/career/internships")}>長期インターン</Link>
          <ChevronRight aria-hidden="true" />
          <span>{item.title}</span>
        </nav>

        <div className="internPostLayout">
          <div>
            <InternshipDetailContent
              internship={item}
              closed={closed}
              onApply={() => setShowForm(true)}
            />
            {success && (
              <div className="applicationSuccess" role="status">
                <h2>応募を受け付けました</h2>
                <p>マイページから現在のステータスを確認できます。</p>
                <Link to={path("/mypage/applications")}>応募状況を見る</Link>
              </div>
            )}
            {showForm && !closed && !success && (
              <section id="application">
                <ApplicationForm
                  internshipId={item.id}
                  onSuccess={handleApplicationSuccess}
                />
              </section>
            )}
          </div>

          <aside className="internPostSidebar">
            <div className="internPostSideCard">
              <div className="internPostCompany">
                <div className="internPostLogo">
                  {item.company_logo_url ? (
                    <img src={item.company_logo_url} alt="" />
                  ) : (
                    <span>{item.company_name.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <strong>{item.company_name}</strong>
                  <span>{item.job_category}</span>
                </div>
              </div>
              <p>
                {closed
                  ? "この求人の募集は終了しました。"
                  : "条件を確認したら、このページから応募できます。"}
              </p>
              <button
                type="button"
                className="careerPrimaryButton"
                disabled={closed}
                onClick={() => setShowForm(true)}
              >
                {closed ? "募集終了" : "この募集に応募する"}
              </button>
              <Link className="internPostSideLink" to={path("/career/internships")}>
                募集一覧へ戻る
              </Link>
            </div>
            <ArticleToc headings={internshipHeadings(item)} />
            {related.length > 0 && (
              <section className="alumniRelated">
                <h2>ほかの長期インターン</h2>
                <ul>
                  {related.map((entry) => (
                    <li key={entry.id}>
                      <Link to={path(`/career/internships/${entry.id}`)}>
                        <span>{entry.job_category}</span>
                        <strong>{entry.title}</strong>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
