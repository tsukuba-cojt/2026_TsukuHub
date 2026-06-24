import "../styles/Auth.css";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

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
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
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
