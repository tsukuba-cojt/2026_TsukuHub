import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { clearActiveUniversitySlug } from "../../lib/tenantSession";
import "../../styles/Auth.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error || !result.data.user) {
      setError("メールアドレスまたはパスワードが正しくありません。");
    } else {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", result.data.user.id).maybeSingle();
      if (profile?.role !== "global_admin") {
        await supabase.auth.signOut();
        setError("このアカウントには全体管理権限がありません。");
      } else {
        clearActiveUniversitySlug();
        navigate("/admin", { replace: true });
      }
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <section className="auth-card login-card">
        <h1 className="login-title">TsukuHub 管理者ログイン</h1>
        <form className="auth-form" onSubmit={submit}>
          <label><span className="label-text">メールアドレス</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label><span className="label-text">パスワード</span><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <p className="auth-error">{error}</p>}
          <button className="primary-button login-gradient-button" disabled={loading}>{loading ? "ログイン中..." : "ログイン"}</button>
        </form>
        <Link className="back-link" to="/">大学選択に戻る</Link>
      </section>
    </main>
  );
}
