import "../styles/Auth.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import SignupStepper from "../components/auth/SignupStepper";
import { MailIcon, LockIcon } from "../components/auth/AuthIcons";
import { useUniversity } from "../components/university/universityContextValue";
import { universityAcademicOptions } from "../data/universityAcademicOptions";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const { university, loading: universityLoading, path } = useUniversity();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [major, setMajor] = useState("");
  const [category, setCategory] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  if (universityLoading) return <main className="careerState">読み込んでいます...</main>;
  if (!university) return <main className="careerState">大学が見つかりません。</main>;

  const academicOptions = universityAcademicOptions[university.slug] ?? [];

  const next = (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    if (password.length < 8) return setAuthError("パスワードは8文字以上で入力してください。");
    if (password !== confirmPassword) return setAuthError("パスワードが一致しません。");
    if (!agreedToTerms) return setAuthError("利用規約とプライバシーポリシーに同意してください。");
    setStep(2);
  };

  const signup = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    if (!name.trim() || !grade || !major || !category) return setAuthError("すべての必須項目を入力してください。");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${path("/auth/confirm")}`,
        data: { name, grade, major, category, university_slug: university.slug },
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
    <div className="auth-page"><main className="login-main">
      <h1 className="login-title">{step === 3 ? "ようこそ！" : "新規登録"}</h1>
      {step !== 3 && <p className="login-subtitle">{university.name}のあらゆる情報がここに。<br />無料でアカウント登録</p>}
      <section className="auth-card signup-card">
        <SignupStepper currentStep={step} />
        {step === 1 && <form className="auth-form" onSubmit={next}>
          <label><span className="label-text">大学メールアドレス<span className="required-mark">*</span></span><div className="input-wrapper"><span className="input-icon"><MailIcon /></span><input className="input-with-icon" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={university.emailDomains[0] ? `student@${university.emailDomains[0].domain}` : "許可されたメールアドレス"} /></div></label>
          <label><span className="label-text">パスワード<span className="required-mark">*</span></span><div className="input-wrapper"><span className="input-icon"><LockIcon /></span><input className="input-with-icon input-with-icon-right" type={showPassword ? "text" : "password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="input-icon-right" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          <label><span className="label-text">パスワード（確認）<span className="required-mark">*</span></span><input type="password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
          <label className="terms-check"><input type="checkbox" checked={agreedToTerms} onChange={(event) => setAgreedToTerms(event.target.checked)} /><span>利用規約およびプライバシーポリシーに同意します</span></label>
          {authError && <p className="auth-error">{authError}</p>}<button className="primary-button login-gradient-button">次へ</button>
        </form>}
        {step === 2 && <form className="auth-form" onSubmit={(event) => void signup(event)}>
          <label><span className="label-text">氏名<span className="required-mark">*</span></span><input required value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label><span className="label-text">大学／大学院<span className="required-mark">*</span></span><select required value={category} onChange={(event) => setCategory(event.target.value)}><option value="">選択する</option><option value="undergraduate">学部生</option><option value="master">大学院生（修士）</option><option value="doctor">大学院生（博士）</option></select></label>
          <label><span className="label-text">学年<span className="required-mark">*</span></span><select required value={grade} onChange={(event) => setGrade(event.target.value)}><option value="">選択する</option>{[1,2,3,4,5,6].map((value) => <option value={value} key={value}>{value}年</option>)}</select></label>
          <label><span className="label-text">所属<span className="required-mark">*</span></span><select required value={major} onChange={(event) => setMajor(event.target.value)}><option value="">選択する</option>{academicOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
          {authError && <p className="auth-error">{authError}</p>}<button className="primary-button login-gradient-button" disabled={loading}>{loading ? "登録中..." : "新規登録"}</button><button className="outline-button" type="button" onClick={() => setStep(1)}>戻る</button>
        </form>}
        {step === 3 && <div className="step3-content"><h2 className="step3-heading">ご登録ありがとうございます！</h2><div className="step3-mail-icon"><MailIcon width={56} height={44} color="#1e57e6" /></div><p className="step3-body">確認メール内のリンクをクリックして登録を完了してください。</p><Link className="primary-button login-gradient-button" to={path("/login")}>ログイン画面へ</Link></div>}
      </section>
      <Link to={path()} className="back-link">← {university.short_name}ページに戻る</Link>
    </main></div>
  );
}
