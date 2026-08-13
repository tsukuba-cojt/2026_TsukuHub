import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { useAuth } from "../components/auth/authContextValue";
import { listMyApplications } from "../services/careerService";
import { applicationStatusLabels, type Application } from "../types/career";
import { useUniversity } from "../components/university/universityContextValue";
import "../styles/career/CareerPlatform.css";

export default function MyApplications() {
  const { user } = useAuth();
  const { path } = useUniversity();
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    void listMyApplications(user.id)
      .then(setItems)
      .catch(() => setError("応募状況を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell">
        <header className="careerPageHeader">
          <span>MY APPLICATIONS</span><h1>応募状況</h1>
          <p>応募した長期インターンの現在の状況を確認できます。</p>
        </header>
        {loading ? <div className="careerState">読み込んでいます...</div>
          : error ? <div className="careerState isError">{error}</div>
            : items.length === 0 ? <div className="careerState"><h2>応募した求人はまだありません</h2><Link to={path("/career/internships")}>求人を探す</Link></div>
              : <div className="applicationList">{items.map((item) => (
                <article key={item.id}>
                  <div><span className={`statusBadge is-${item.status}`}>{applicationStatusLabels[item.status]}</span><time>{new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(new Date(item.created_at))} 応募</time></div>
                  <h2>{item.internship?.title ?? "求人"}</h2><p>{item.internship?.company_name}</p>
                  <Link to={path(`/career/internships/${item.internship_id}`)}>求人を確認する</Link>
                </article>
              ))}</div>}
      </main>
      <Footer />
    </div>
  );
}
