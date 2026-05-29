import "../styles/App.css";
import React, { useEffect, useState } from "react";
import { createClient, type EmailOtpType, type User } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const params = new URLSearchParams(window.location.search);
  const hasTokenHash = params.get("token_hash");

  const [verifying, setVerifying] = useState(!!hasTokenHash);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type") as EmailOtpType | null;

    if (token_hash) {
      supabase.auth
        .verifyOtp({
          token_hash,
          type: type ?? "email",
        })
        .then(({ error }) => {
          if (error) {
            setAuthError(error.message);
          } else {
            setAuthSuccess(true);
            window.history.replaceState({}, document.title, "/");
          }

          setVerifying(false);
        });
    } else {
      setVerifying(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.endsWith("@u.tsukuba.ac.jp")) {
      alert("筑波大学のメールアドレスを入力してください。");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("ログインリンクをメールに送信しました。メールを確認してください。");
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (verifying) {
    return (
      <div className="auth-page">
        <div className="auth-status-card">
          <div className="brand-logo large">T</div>
          <h1>認証中です</h1>
          <p>メールリンクを確認しています。</p>
          <div className="loading-dot">Loading...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="auth-page">
        <div className="auth-status-card">
          <div className="brand-logo large error">!</div>
          <h1>認証に失敗しました</h1>
          <p>{authError}</p>

          <button
            className="primary-button"
            onClick={() => {
              setAuthError(null);
              window.history.replaceState({}, document.title, "/");
            }}
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    );
  }

  if (authSuccess && !user) {
    return (
      <div className="auth-page">
        <div className="auth-status-card">
          <div className="brand-logo large success">✓</div>
          <h1>認証が完了しました</h1>
          <p>アカウント情報を読み込んでいます。</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-page">
        <header className="auth-header">
          <div className="brand">
            <div className="brand-logo">T</div>
            <span>TsukuHub</span>
          </div>

          <button className="nav-button" onClick={handleLogout}>
            ログアウト
          </button>
        </header>

        <main className="auth-main">
          <section className="auth-hero">
            <p className="label">Welcome to TsukuHub</p>
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
              <h2>ログイン中</h2>
              <p>現在、以下のアカウントでログインしています。</p>
            </div>

            <div className="user-box">
              <span className="user-label">メールアドレス</span>
              <strong>{user.email}</strong>
            </div>

            <button className="primary-button" onClick={handleLogout}>
              ログアウト
            </button>
          </section>
        </main>
      </div>
    );
  }

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
          <a href="#">新規登録</a>
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
            <h2>ログイン / 新規登録</h2>
            <p>
              筑波大学のメールアドレスを入力すると、ログインリンクを送信します。
            </p>
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

            <button className="primary-button" disabled={loading}>
              {loading ? "送信中..." : "ログインリンクを送信"}
            </button>
          </form>

          <p className="switch-text">
            初めての方も、メールリンク認証でそのまま登録できます。
          </p>
        </section>
      </main>
    </div>
  );
}