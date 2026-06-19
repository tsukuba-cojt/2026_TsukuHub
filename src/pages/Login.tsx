import "../styles/Auth.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

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
      <header className="auth-header">
        <div className="brand">
          <div className="brand-logo">T</div>
          <span>TsukuHub</span>
        </div>
        <nav className="auth-nav">
          <a href="#">投稿を見る</a>
          <a href="#">サービス紹介</a>
          <a href="/signup">新規登録</a>
        </nav>
      </header>

      <main className="auth-main">
        <section className="auth-hero">
          <p className="label">University of Tsukuba Students Platform</p>
          <h1>
            筑波大生の情報を、
            <br />
            ひとつの場所に。
          </h1>
          <p>
            授業、サークル、飲食店、住まい、バイト、就活・インターンなど、
            筑波大生に必要な情報をまとめて探せるプラットフォームです。
          </p>
          <div className="hero-points">
            <span>履修情報</span>
            <span>サークル</span>
            <span>就活・インターン</span>
          </div>
        </section>

        <section className="auth-card">
          <div className="card-title">
            <h2>ログイン</h2>
            <p>筑波大学のメールアドレスとパスワードでログインしてください。</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              メールアドレス
              <input
                type="email"
                placeholder="sXXXXXXX@u.tsukuba.ac.jp"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              パスワード
              <input
                type="password"
                placeholder="パスワードを入力"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {authError && <p className="auth-error">{authError}</p>}

            <button className="primary-button" disabled={loading}>
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p className="switch-text">
            アカウントをお持ちでない方は <a href="/signup">新規登録</a>
          </p>
        </section>
      </main>
    </div>
  );
}