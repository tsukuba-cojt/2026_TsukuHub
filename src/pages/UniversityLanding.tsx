import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../components/auth/authContextValue";
import { useUniversity } from "../components/university/universityContextValue";
import { getActiveUniversitySlug } from "../lib/tenantSession";
import { canAccessUniversitySite } from "../lib/universityAccess";
import Home from "./Home";
import { resolveUniversityLanding } from "../components/university/resolveUniversityLanding";
import "../styles/university/UniversityPortal.css";

export default function UniversityLanding() {
  const { user, universityId, isAdmin, loading: authLoading } = useAuth();
  const { university, loading, error, path } = useUniversity();
  const location = useLocation();

  if (loading || authLoading) return <main className="careerState">読み込んでいます...</main>;
  if (error) return <main className="careerState isError">{error}</main>;
  if (!university) return <main className="careerState"><h1>大学が見つかりません</h1><Link to="/">大学を選び直す</Link></main>;

  const active = getActiveUniversitySlug() === university.slug;
  const canAccess = canAccessUniversitySite({
    isAdmin,
    profileUniversityId: universityId,
    universityId: university.id,
  });
  const destination = resolveUniversityLanding({
    universityStatus: university.status,
    isAuthenticated: Boolean(user),
    isActiveUniversity: active,
    canAccessUniversity: canAccess,
    isAdmin,
  });
  if (destination === "home") return <Home />;

  if (destination === "login") {
    return <Navigate to={path("/login")} replace state={{ from: location.pathname }} />;
  }

  return (
    <main className="universityIntro">
      <section className="universityIntroHero">
        <Link to="/" className="universityIntroBack">大学選択に戻る</Link>
        <p>TSUKUHUB FOR {university.slug.toUpperCase()}</p>
        <h1>{university.name}</h1>
        <h2>現在サービスを停止しています</h2>
        <p>{university.description}</p>
        <div className="universitySuspended">再開までしばらくお待ちください。</div>
      </section>
    </main>
  );
}
