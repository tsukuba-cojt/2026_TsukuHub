import "../styles/Auth.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [major, setMajor] = useState("");
  const [category, setCategory] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

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

    if (!name.trim()) {
      setAuthError("氏名を入力してください。");
      return;
    }

    if (!grade) {
      setAuthError("学年を選択してください。");
      return;
    }

    if (!category) {
      setAuthError("所属区分を選択してください。");
      return;
    }

    if (!major) {
      setAuthError(category === "undergraduate" ? "学類を選択してください。" : "学術院を選択してください。");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name,
          grade,
          major,
          category,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setSignupSuccess(true);
    }

    setLoading(false);
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

            <label>
              氏名
              <input
                type="text"
                placeholder="筑波太郎"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label>
              所属区分
              <select
                value={category}
                required
                onChange={(e) => {
                  setCategory(e.target.value);
                  setMajor("");
                }}
              >
                <option value="">選択してください</option>
                <option value="undergraduate">学群生</option>
                <option value="master">大学院生（修士）</option>
                <option value="doctor">大学院生（博士）</option>
              </select>
            </label>

            <label>
              学年
              <select
                value={grade}
                required
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="1">1年</option>
                <option value="2">2年</option>
                <option value="3">3年</option>
                <option value="4">4年</option>
                <option value="5">5年</option>
                <option value="6">6年</option>
              </select>
            </label>

            <label>
              {category === "undergraduate" ? "学類" : category ? "学術院" : "学類・学術院"}
              <select
                value={major}
                required
                onChange={(e) => setMajor(e.target.value)}
              >
                <option value="">選択してください</option>

                {category === "undergraduate" && (
                  <>
                    <option value="人文学類">人文学類</option>
                    <option value="比較文化学類">比較文化学類</option>
                    <option value="日本語・日本文化学類">日本語・日本文化学類</option>
                    <option value="社会学類">社会学類</option>
                    <option value="国際総合学類">国際総合学類</option>
                    <option value="教育学類">教育学類</option>
                    <option value="心理学類">心理学類</option>
                    <option value="障害科学類">障害科学類</option>
                    <option value="生物学類">生物学類</option>
                    <option value="生物資源学類">生物資源学類</option>
                    <option value="地球学類">地球学類</option>
                    <option value="数学類">数学類</option>
                    <option value="物理学類">物理学類</option>
                    <option value="化学類">化学類</option>
                    <option value="応用理工学類">応用理工学類</option>
                    <option value="工学システム学類">工学システム学類</option>
                    <option value="社会工学類">社会工学類</option>
                    <option value="総合理工学類プログラム">総合理工学類プログラム</option>
                    <option value="情報科学類">情報科学類</option>
                    <option value="情報メディア創成学類">情報メディア創成学類</option>
                    <option value="知識情報・図書館学類">知識情報・図書館学類</option>
                    <option value="医学類">医学類</option>
                    <option value="看護学類">看護学類</option>
                    <option value="医療科学類">医療科学類</option>
                    <option value="体育専門学群">体育専門学群</option>
                    <option value="芸術専門学群">芸術専門学群</option>
                  </>
                )}

                {(category === "master" || category === "doctor") && (
                  <>
                    <option value="人文社会ビジネス科学学術院">人文社会ビジネス科学学術院</option>
                    <option value="理工情報生命学術院">理工情報生命学術院</option>
                    <option value="人間総合科学学術院">人間総合科学学術院</option>
                    <option value="グローバル教育院">グローバル教育院</option>
                  </>
                )}
              </select>
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
