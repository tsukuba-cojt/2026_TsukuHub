import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/authContextValue";
import { createApplication, getProfileDefaults, hasApplied } from "../../services/careerService";

type Props = { internshipId: string; onSuccess: () => void };
type FormState = { applicant_name: string; email: string; faculty: string; graduation_year: string; motivation: string; skills: string; portfolio_url: string; additional_notes: string };
const emptyForm: FormState = { applicant_name: "", email: "", faculty: "", graduation_year: "", motivation: "", skills: "", portfolio_url: "", additional_notes: "" };
const textValue = (value: unknown) => typeof value === "string" ? value : "";

export default function ApplicationForm({ internshipId, onSuccess }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [checking, setChecking] = useState(Boolean(user));
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    void Promise.all([getProfileDefaults(user.id), hasApplied(internshipId, user.id)]).then(([profile, applied]) => {
      setAlreadyApplied(applied);
      setForm((current) => ({ ...current, applicant_name: textValue(profile?.name) || textValue(user.user_metadata.name), email: textValue(user.email), faculty: textValue(profile?.major), graduation_year: textValue(profile?.graduation_year) }));
    }).catch(() => setError("応募状況の確認に失敗しました。時間をおいて再度お試しください。"))
      .finally(() => setChecking(false));
  }, [internshipId, user]);

  if (!user) return <div className="applicationGate"><h2>応募にはログインが必要です</h2><p>ログイン後、この求人に戻って応募できます。</p><Link to="/login" state={{ from: `/career/internships/${internshipId}` }}>ログインして応募する</Link></div>;
  if (checking) return <p className="careerInlineState">応募状況を確認しています...</p>;
  if (alreadyApplied) return <div className="applicationSuccess"><h2>この求人には応募済みです</h2><Link to="/mypage/applications">応募状況を確認する</Link></div>;

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!form.applicant_name.trim() || !form.email.trim() || !form.faculty.trim() || !form.graduation_year || !form.motivation.trim() || !form.skills.trim()) return setError("必須項目を入力してください。");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("メールアドレスの形式を確認してください。");
    if (form.portfolio_url) { try { new URL(form.portfolio_url); } catch { return setError("ポートフォリオURLの形式を確認してください。"); } }
    if (form.motivation.length > 2000 || form.skills.length > 2000 || form.additional_notes.length > 1000) return setError("入力できる文字数を超えています。");
    setSubmitting(true);
    try {
      await createApplication({ internship_id: internshipId, user_id: user.id, applicant_name: form.applicant_name.trim(), email: form.email.trim(), faculty: form.faculty.trim(), graduation_year: Number(form.graduation_year), motivation: form.motivation.trim(), skills: form.skills.trim(), portfolio_url: form.portfolio_url.trim() || null, additional_notes: form.additional_notes.trim() || null });
      setAlreadyApplied(true); onSuccess();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(message.includes("duplicate") || message.includes("unique") ? "この求人にはすでに応募済みです。" : "応募を送信できませんでした。入力内容と募集状況を確認してください。");
    } finally { setSubmitting(false); }
  };

  return <form className="careerForm applicationForm" onSubmit={submit}><h2>応募フォーム</h2><p className="formNote"><span>*</span> は必須項目です。</p><div className="formGrid">
    <label>氏名 <span>*</span><input value={form.applicant_name} maxLength={100} onChange={(e) => update("applicant_name", e.target.value)} /></label>
    <label>メールアドレス <span>*</span><input type="email" value={form.email} maxLength={254} onChange={(e) => update("email", e.target.value)} /></label>
    <label>所属学群・学類 <span>*</span><input value={form.faculty} maxLength={100} onChange={(e) => update("faculty", e.target.value)} /></label>
    <label>卒業予定年 <span>*</span><input type="number" min="2026" max="2100" value={form.graduation_year} onChange={(e) => update("graduation_year", e.target.value)} /></label>
  </div><label>志望理由 <span>*</span><textarea value={form.motivation} maxLength={2000} rows={6} onChange={(e) => update("motivation", e.target.value)} /></label><label>経験・スキル <span>*</span><textarea value={form.skills} maxLength={2000} rows={5} onChange={(e) => update("skills", e.target.value)} /></label><label>ポートフォリオURL<input type="url" value={form.portfolio_url} maxLength={500} onChange={(e) => update("portfolio_url", e.target.value)} /></label><label>補足事項<textarea value={form.additional_notes} maxLength={1000} rows={4} onChange={(e) => update("additional_notes", e.target.value)} /></label>{error && <p className="formError" role="alert">{error}</p>}<button className="careerPrimaryButton" disabled={submitting} type="submit">{submitting ? "送信しています..." : "応募を送信する"}</button></form>;
}
