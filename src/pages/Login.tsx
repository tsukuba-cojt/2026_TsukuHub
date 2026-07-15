import "../styles/Auth.css";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Eye, EyeOff } from "lucide-react";
import { MailIcon, LockIcon } from "../components/auth/AuthIcons";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    if (!email.endsWith("@u.tsukuba.ac.jp")) {
      setAuthError("筑波大学のメールアドレス（@u.tsukuba.ac.jp）を入力してください。");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError("メールアドレスまたはパスワードが正しくありません。");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <main className="login-main">
        <h1 className="login-title">ログイン</h1>
        <p className="login-subtitle">
          筑波大学のあらゆる情報がここに。<br />
          手軽にログイン
        </p>

        <section className="auth-card login-card">
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              <span className="label-text">メールアドレス（大学メールアドレス）<span className="required-mark">*</span></span>
              <div className="input-wrapper">
                <span className="input-icon"><MailIcon /></span>
                <input
                  type="email"
                  placeholder="sXXXXXXX@u.tsukuba.ac.jp"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-with-icon"
                />
              </div>
              <span className="helper-text">筑波大学メールアドレスが必要です</span>
            </label>

            <label>
              <span className="label-text">パスワード<span className="required-mark">*</span></span>
              <div className="input-wrapper">
                <span className="input-icon"><LockIcon /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="パスワードを入力"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-with-icon input-with-icon-right"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPassword ? (
                    <Eye size={18} aria-hidden="true" />
                  ) : (
                    <EyeOff size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              <span className="helper-text">8文字以上で入力して下さい</span>
              <span className="helper-text">記号は使用できません</span>
            </label>

            {authError && <p className="auth-error">{authError}</p>}

            <button className="primary-button login-gradient-button" disabled={loading}>
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p className="forgot-password-text">
            パスワードを忘れた方は <a href="#">こちら</a>
          </p>

          <div className="login-divider">
            <span>または</span>
          </div>

          <p className="switch-text">
            アカウントをお持ちでない方は <a href="/signup">新規登録はこちら</a>
          </p>
        </section>

        <Link to="/" className="back-link">
          <ChevronLeftIcon /> トップページに戻る
        </Link>
      </main>
    </div>
  );
}
