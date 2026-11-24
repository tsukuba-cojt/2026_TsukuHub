import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { listCompanyJobs } from "../../services/companyService";
import "../../styles/Auth.css";

export default function CompanyLogin() {
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (signup) {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password,
          options: { emailRedirectTo: `${window.location.origin}/company/login` },
        });
        if (error) throw error;
        if (!data.session) { setMessage("確認メールを送信しました。メールアドレスを確認してからログインしてください。届かない場合は運営に担当者登録をご確認ください。"); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
      const jobs = await listCompanyJobs();
      if (!jobs.length) { setError("閲覧できる求人がありません。運営に担当者登録をご確認ください。"); return; }
      navigate("/company", { replace: true });
    } catch { setError(signup ? "登録できませんでした。運営に登録されたメールアドレスとパスワードの条件をご確認ください。" : "ログインできませんでした。メールアドレス・パスワードとメール認証をご確認ください。"); }
    finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-card login-card"><h1 className="login-title">TsukuHub 企業向け{signup ? "アカウント登録" : "ログイン"}</h1><p>運営が登録した担当者のメールアドレスで、自社への応募を確認できます。</p><form className="auth-form" onSubmit={submit}>
    <label><span className="label-text">メールアドレス</span><input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label><span className="label-text">パスワード</span><input type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} required value={password} onChange={e => setPassword(e.target.value)} /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <button className="primary-button login-gradient-button" disabled={busy}>{busy ? "処理中..." : signup ? "登録する" : "ログイン"}</button>
    <button type="button" disabled={busy} onClick={() => { setSignup(!signup); setError(""); setMessage(""); }}>{signup ? "ログインに戻る" : "初めての方：アカウントを登録"}</button>
  </form>
    {!signup && <p className="forgot-password-text"><Link to="/company/auth/forgot-password" state={{ email }}>パスワードをお忘れの方</Link></p>}
    <Link to="/" className="back-link">TsukuHubトップへ</Link></section></main>;
}
