import "../styles/Auth.css";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SignupStepper from "../components/auth/SignupStepper";
import { MailIcon, LockIcon } from "../components/auth/AuthIcons";
import agreementSource from "../components/doc/agreement.html?raw";
import privacyPolicySource from "../components/doc/priverice.html?raw";
import { buildPrivacyPolicyDocument } from "../components/doc/privacyPolicyDocument";
import { useUniversity } from "../components/university/universityContextValue";
import { universityAcademicOptions, type AcademicCategory } from "../data/universityAcademicOptions";
import { supabase } from "../lib/supabase";

type LegalDocumentType = "agreement" | "privacy";

const legalDocuments = {
  agreement: {
    title: "利用規約",
    source: agreementSource,
  },
  privacy: {
    title: "プライバシーポリシー",
    source: privacyPolicySource,
  },
} as const;

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

export default function Signup() {
  const { university, loading: universityLoading, path } = useUniversity();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activeLegalDocument, setActiveLegalDocument] = useState<LegalDocumentType | null>(null);

  // Step 2
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [category, setCategory] = useState<AcademicCategory | "">("");

  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate(path());
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) navigate(path());
    });

    return () => subscription.unsubscribe();
  }, [navigate, path]);

  useEffect(() => {
    if (!activeLegalDocument) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveLegalDocument(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLegalDocument]);

  if (universityLoading) return <main className="careerState">読み込んでいます...</main>;
  if (!university) return <main className="careerState">大学が見つかりません。</main>;

  // 課程（学群生／修士／博士）ごとに上位区分と下位区分の選択肢が変わる
  const academicLevel = category ? universityAcademicOptions[university.slug]?.[category] : undefined;
  const groupOptions = academicLevel?.options ?? [];
  const childOptions = groupOptions.find((option) => option.value === school)?.children ?? [];
  // 下位区分を持たない大学（学部のみ）では上位セレクトだけを出す
  const showChildSelect = Boolean(academicLevel?.childLabel);
  const resolvedMajor = showChildSelect ? major : school;

  const handleStep1Next = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);

    const allowedDomains = university.emailDomains.map((item) => item.domain.toLowerCase());
    const lowerEmail = email.toLowerCase();
    if (allowedDomains.length > 0 && !allowedDomains.some((domain) => lowerEmail.endsWith(`@${domain}`))) {
      setAuthError(`${university.name}の許可されたメールアドレスを入力してください。`);
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
    if (!agreedToTerms) {
      setAuthError("利用規約とプライバシーポリシーに同意してください。");
      return;
    }
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);

    if (!name.trim()) {
      setAuthError("氏名を入力してください。");
      return;
    }
    if (!category) {
      setAuthError("大学／大学院を選択してください。");
      return;
    }
    if (!grade) {
      setAuthError("学年を選択してください。");
      return;
    }
    if (!school) {
      setAuthError(`${academicLevel?.groupLabel ?? "所属"}を選択してください。`);
      return;
    }
    if (showChildSelect && !major) {
      setAuthError(`${academicLevel?.childLabel}を選択してください。`);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${path("/auth/confirm")}`,
        data: { name, grade, school, major: resolvedMajor, category, university_slug: university.slug },
      },
    });

    if (error) {
      const messages: Record<string, string> = {
        university_signup_disabled: "この大学の新規登録は現在停止中です。",
        email_domain_not_allowed: `${university.name}の許可されたメールアドレスを入力してください。`,
      };
      setAuthError(messages[error.message] ?? error.message);
    } else {
      setStep(3);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <main className="login-main">
        <h1 className="login-title">{step === 3 ? "ようこそ！" : "新規登録"}</h1>
        {step !== 3 && (
          <p className="login-subtitle">
            {university.name}のあらゆる情報がここに。<br />
            無料でアカウント登録
          </p>
        )}

        <section className="auth-card signup-card">
          <SignupStepper currentStep={step} />

          {/* ステップ1：メールアドレスの入力 */}
          {step === 1 && (
            <form className="auth-form" onSubmit={handleStep1Next}>
              <label>
                <span className="label-text">メールアドレス（大学メールアドレス）<span className="required-mark">*</span></span>
                <div className="input-wrapper">
                  <span className="input-icon"><MailIcon /></span>
                  <input
                    type="email"
                    placeholder={
                      university.emailDomains[0]
                        ? `student@${university.emailDomains[0].domain}`
                        : "許可されたメールアドレス"
                    }
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-with-icon"
                  />
                </div>
                <span className="helper-text">{university.name}のメールアドレスが必要です</span>
              </label>

              <label>
                <span className="label-text">パスワード<span className="required-mark">*</span></span>
                <div className="input-wrapper">
                  <span className="input-icon"><LockIcon /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="8文字以上の英数字"
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

              <label>
                <span className="label-text">パスワード（確認用）<span className="required-mark">*</span></span>
                <div className="input-wrapper">
                  <span className="input-icon"><LockIcon /></span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="8文字以上の英数字"
                    value={confirmPassword}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-with-icon input-with-icon-right"
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </label>

              <div className="terms-check">
                <input
                  id="signup-legal-agreement"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span>
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => setActiveLegalDocument("agreement")}
                  >
                    利用規約
                  </button>{" "}
                  および{" "}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => setActiveLegalDocument("privacy")}
                  >
                    プライバシーポリシー
                  </button>{" "}
                  に同意します
                </span>
              </div>

              {authError && <p className="auth-error">{authError}</p>}

              <button className="primary-button login-gradient-button" type="submit">
                次へ
              </button>

              <div className="login-divider"><span>または</span></div>

              <p className="switch-text">
                すでにアカウントをお持ちの方は <Link to={path("/login")}>ログインはこちら</Link>
              </p>
            </form>
          )}

          {/* ステップ2：アカウント情報の入力 */}
          {step === 2 && (
            <form className="auth-form" onSubmit={handleSignup}>
              <label>
                <span className="label-text">氏名<span className="required-mark">*</span></span>
                <input
                  type="text"
                  placeholder="筑波 太郎"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                <span className="label-text">大学／大学院<span className="required-mark">*</span></span>
                <select
                  value={category}
                  required
                  onChange={(e) => {
                    setCategory(e.target.value as AcademicCategory | "");
                    setSchool("");
                    setMajor("");
                  }}
                >
                  <option value="">－－選択する－－</option>
                  <option value="undergraduate">学群生</option>
                  <option value="master">大学院生（修士）</option>
                  <option value="doctor">大学院生（博士）</option>
                </select>
              </label>

              <label>
                <span className="label-text">学年<span className="required-mark">*</span></span>
                <select
                  value={grade}
                  required
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="">－－選択する－－</option>
                  <option value="1">1年</option>
                  <option value="2">2年</option>
                  <option value="3">3年</option>
                  <option value="4">4年</option>
                  <option value="5">5年</option>
                  <option value="6">6年</option>
                </select>
              </label>

              <label>
                <span className="label-text">
                  {academicLevel?.groupLabel ?? "所属"}<span className="required-mark">*</span>
                </span>
                <select
                  value={school}
                  required
                  disabled={!academicLevel}
                  onChange={(e) => {
                    setSchool(e.target.value);
                    setMajor("");
                  }}
                >
                  <option value="">－－選択する－－</option>
                  {groupOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {!academicLevel && (
                  <span className="helper-text">先に大学／大学院を選択してください</span>
                )}
              </label>

              {showChildSelect && (
                <label>
                  <span className="label-text">
                    {academicLevel?.childLabel}<span className="required-mark">*</span>
                  </span>
                  <select
                    value={major}
                    required
                    disabled={!school}
                    onChange={(e) => setMajor(e.target.value)}
                  >
                    <option value="">－－選択する－－</option>
                    {childOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {!school && (
                    <span className="helper-text">
                      先に{academicLevel?.groupLabel}を選択してください
                    </span>
                  )}
                </label>
              )}

              {authError && <p className="auth-error">{authError}</p>}

              <button className="primary-button login-gradient-button" type="submit" disabled={loading}>
                {loading ? "登録中..." : "新規登録"}
              </button>

              <button
                type="button"
                className="outline-button"
                onClick={() => { setAuthError(null); setStep(1); }}
              >
                戻る
              </button>

              <div className="login-divider"><span>または</span></div>

              <p className="switch-text">
                すでにアカウントをお持ちの方は <Link to={path("/login")}>ログインはこちら</Link>
              </p>
            </form>
          )}

          {/* ステップ3：完了 */}
          {step === 3 && (
            <div className="step3-content">
              <h2 className="step3-heading">ご登録ありがとうございます！</h2>
              <div className="step3-mail-icon">
                <MailIcon width={56} height={44} color="#1e57e6" />
              </div>
              <p className="step3-body">
                入力いただいたメールアドレスに確認メールをお送りしました<br />
                メール内のリンクをクリックして、登録を完了してください。
              </p>
              <p className="step3-note">
                メールが届かない場合は、迷惑メールフォルダをご確認ください。
              </p>
              <button
                className="primary-button login-gradient-button"
                onClick={() => navigate(path())}
              >
                TsukuHubを使用する
              </button>
            </div>
          )}
        </section>

        <Link to={path()} className="back-link">
          <ChevronLeftIcon /> {university.short_name}ページに戻る
        </Link>
      </main>

      {activeLegalDocument && (() => {
        const document = legalDocuments[activeLegalDocument];
        return (
        <div
          className="privacy-policy-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveLegalDocument(null);
          }}
        >
          <section
            className="privacy-policy-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-document-title"
          >
            <div className="privacy-policy-header">
              <h2 id="legal-document-title">{document.title}</h2>
              <button
                type="button"
                className="privacy-policy-close"
                onClick={() => setActiveLegalDocument(null)}
                aria-label={`${document.title}を閉じる`}
              >
                ×
              </button>
            </div>
            {document.source.trim() ? (
              <iframe
                className="privacy-policy-frame"
                srcDoc={buildPrivacyPolicyDocument(document.source)}
                title={`TsukuHub ${document.title}`}
                sandbox=""
              />
            ) : (
              <p className="privacy-policy-empty">
                {document.title}は現在準備中です。
              </p>
            )}
          </section>
        </div>
        );
      })()}
    </div>
  );
}
