import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ApplicationForm from "../components/career/ApplicationForm";
import InternshipDetailContent from "../components/career/InternshipDetailContent";
import InternshipDetailHero from "../components/career/InternshipDetailHero";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { getInternship } from "../services/careerService";
import type { Internship } from "../types/career";
import "../styles/career/CareerPlatform.css";

export default function CareerInternshipDetail() {
  const { internshipId = "" } = useParams();
  const [item, setItem] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentTime] = useState(() => Date.now());

  useEffect(() => {
    void getInternship(internshipId)
      .then(setItem)
      .catch(() => setError("求人情報を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, [internshipId]);

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
          <Link to="/career/internships">求人一覧へ戻る</Link>
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
      <main className="careerShell internshipDetail">
        <Link className="careerBack" to="/career/internships">
          <ArrowLeft aria-hidden="true" />求人一覧へ戻る
        </Link>
        <InternshipDetailHero internship={item} closed={closed} />
        <InternshipDetailContent
          internship={item}
          closed={closed}
          onApply={() => setShowForm(true)}
        />
        {success && (
          <div className="applicationSuccess" role="status">
            <h2>応募を受け付けました</h2>
            <p>マイページから現在のステータスを確認できます。</p>
            <Link to="/mypage/applications">応募状況を見る</Link>
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
      </main>
      <Footer />
    </div>
  );
}
