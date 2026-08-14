import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  clearActiveUniversitySlug,
  getActiveUniversitySlug,
} from "../../lib/tenantSession";
import { useUniversity } from "../university/universityContextValue";
import { useAuth } from "./authContextValue";

export default function RequireUniversityAccess() {
  const { user, loading: authLoading, universityId, isAdmin } = useAuth();
  const { university, loading: universityLoading, path } = useUniversity();
  const location = useLocation();
  const navigate = useNavigate();

  if (authLoading || universityLoading) {
    return <main className="careerState"><p>利用権限を確認しています...</p></main>;
  }
  if (!university) return <Navigate to="/404" replace />;
  if (university.status === "suspended") return <Navigate to={path()} replace />;
  if (!user) {
    return <Navigate to={path("/login")} replace state={{ from: location.pathname }} />;
  }

  const activeSlug = getActiveUniversitySlug();
  const profileCanAccess = isAdmin || universityId === university.id;
  if (activeSlug === university.slug && profileCanAccess) return <Outlet />;

  const loginAgain = async () => {
    await supabase.auth.signOut();
    clearActiveUniversitySlug();
    navigate(path("/login"), { replace: true, state: { from: location.pathname } });
  };

  return (
    <main className="careerState universityAccessMismatch">
      <h1>{university.name}アカウントでのログインが必要です</h1>
      <p>大学ごとにデータと権限を分けています。現在のセッションを終了し、ログインし直してください。</p>
      <button className="careerPrimaryButton" type="button" onClick={() => void loginAgain()}>
        {university.short_name}でログインし直す
      </button>
    </main>
  );
}
