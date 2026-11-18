import "../styles/Auth.css";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { MailIcon, LockIcon } from "../components/auth/AuthIcons";
import { useUniversity } from "../components/university/universityContextValue";
import { supabase } from "../lib/supabase";
import { canAccessUniversitySite } from "../lib/universityAccess";
import {
  clearActiveUniversitySlug,
  getActiveUniversitySlug,
  setActiveUniversitySlug,
} from "../lib/tenantSession";
import { useAuth } from "../components/auth/authContextValue";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { university, loading: universityLoading, path } = useUniversity();
  const { user, isAdmin, universityId, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (universityLoading || authLoading) return <main className="careerState">読み込んでいます...</main>;
  if (!university) return <main className="careerState"><h1>大学が見つかりません</h1></main>;

  const activeUniversitySlug = getActiveUniversitySlug();
  const allowed = canAccessUniversitySite({
    isAdmin,
    profileUniversityId: universityId,
    universityId: university.id,
  });
  const returnCandidate = (location.state as { from?: string } | null)?.from;
  const returnTo = returnCandidate?.startsWith(`/${university.slug}/`)
    ? returnCandidate
    : path();

  if (user && allowed) {
    return <Navigate to={returnTo} replace />;
  }

  if (user && activeUniversitySlug && activeUniversitySlug !== university.slug) {
    const switchUniversity = async () => {
      setLoading(true);
      await supabase.auth.signOut();
      clearActiveUniversitySlug();
      setLoading(false);
    };
    return (
      <main className="careerState universityAccessMismatch">
        <h1>{university.name}へ切り替えますか？</h1>
        <p>現在の大学のセッションを終了した後、{university.short_name}のアカウントで再ログインしてください。</p>
        <button className="careerPrimaryButton" type="button" disabled={loading} onClick={() => void switchUniversity()}>
          {loading ? "ログアウト中..." : "ログアウトして切り替える"}
        </button>
        <Link to={path()}>{university.short_name}の案内へ戻る</Link>
      </main>
    );
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setLoading(true);

    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error || !result.data.user) {
      setAuthError("メールアドレスまたはパスワードが正しくありません。");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("university_id, role")
      .eq("id", result.data.user.id)
      .maybeSingle();
    const allowedAfterLogin = canAccessUniversitySite({
      isAdmin: profile?.role === "global_admin",
      profileUniversityId: profile?.university_id,
      universityId: university.id,
    });
    if (!allowedAfterLogin) {
      await supabase.auth.signOut();
      setAuthError(`このアカウントは${university.name}に所属していません。`);
      setLoading(false);
      return;
    }

    setActiveUniversitySlug(university.slug);
    navigate(returnTo, { replace: true });
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <main className="login-main">
        <h1 className="login-title">ログイン</h1>
        <p className="login-subtitle">{university.name}のあらゆる情報がここに。<br />大学アカウントでログイン</p>
        <section className="auth-card login-card">
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              <span className="label-text">メールアドレス<span className="required-mark">*</span></span>
              <div className="input-wrapper"><span className="input-icon"><MailIcon /></span><input type="email" placeholder={university.emailDomains[0] ? `student@${university.emailDomains[0].domain}` : "大学メールアドレス"} value={email} required onChange={(event) => setEmail(event.target.value)} className="input-with-icon" /></div>
            </label>
            <label>
              <span className="label-text">パスワード<span className="required-mark">*</span></span>
              <div className="input-wrapper"><span className="input-icon"><LockIcon /></span><input type={showPassword ? "text" : "password"} placeholder="パスワードを入力" value={password} required onChange={(event) => setPassword(event.target.value)} className="input-with-icon input-with-icon-right" /><button type="button" className="input-icon-right" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </label>
            {authError && <p className="auth-error">{authError}</p>}
            <button className="primary-button login-gradient-button" disabled={loading}>{loading ? "ログイン中..." : "ログイン"}</button>
          </form>
          {university.signup_enabled && <><div className="login-divider"><span>または</span></div><p className="switch-text">アカウントをお持ちでない方は <Link to={path("/signup")}>新規登録はこちら</Link></p></>}
        </section>
        <Link to={path()} className="back-link">← {university.short_name}ページに戻る</Link>
      </main>
    </div>
  );
}
