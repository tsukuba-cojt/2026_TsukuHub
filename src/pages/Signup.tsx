import "../styles/Auth.css";
import React, { useEffect, useState } from "react";
import { createClient, type User } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
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

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    if (!email.endsWith("@u.tsukuba.ac.jp")) {
      setAuthError("筑波大学のメールアドレス（@u.tsukuba.ac.jp）を入力してください。");
      return;
    }

    if (password.length < 8) {
      setAuthError("パスワードは8文字以上で入力してください。");
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("パスワードが一致しません。");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setSignupSuccess(true);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 登録完了（メール確認待ち）
  if (signupSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-status-card">
          <div className="brand-logo large success">✓</div>
          <h1>確認メールを送信しました</h1>
          <p>
            <strong>{email}</strong> に確認メールを送信しました。
            <br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <a href="/login" className="primary-button" style={{ display: "inline-block", textAlign: "center" }}>
            ログイン画面へ
          </a>
        </div>
      </div>
    );
  }

  // すでにログイン済み
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
          <a href="/login">ログイン</a>
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
            <h2>新規登録</h2>
            <p>筑波大学のメールアドレスで登録できます。</p>
          </div>

          <form className="auth-form" onSubmit={handleSignup}>
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
                placeholder="8文字以上で入力"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <label>
              パスワード（確認）
              <input
                type="password"
                placeholder="もう一度入力してください"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>

            {authError && <p className="auth-error">{authError}</p>}

            <button className="primary-button" disabled={loading}>
              {loading ? "登録中..." : "アカウントを作成"}
            </button>
          </form>

          <p className="switch-text">
            すでにアカウントをお持ちの方は <a href="/login">ログイン</a>
          </p>
        </section>
      </main>
    </div>
  );
}
