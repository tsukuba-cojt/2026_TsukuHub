import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/authContextValue";
import { createApplication, getProfileDefaults, hasApplied } from "../../services/careerService";
import ApplicationFormFields from "./ApplicationFormFields";
import { useUniversity } from "../university/universityContextValue";
import {
  defaultsFromAccount,
  emptyApplicationForm,
  facultyChoices,
  normalizeHttpUrl,
  validateApplicationForm,
  type ApplicationFormState,
} from "./applicationFormState";

type Props = { internshipId: string; onSuccess: () => void };

export default function ApplicationForm({ internshipId, onSuccess }: Props) {
  const { user } = useAuth();
  const { university, path } = useUniversity();
  const [form, setForm] = useState(emptyApplicationForm);
  const [facultyOptions, setFacultyOptions] = useState<{ value: string; label: string }[]>([]);
  const [checking, setChecking] = useState(Boolean(user));
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let remaining = 2;
    const done = () => {
      remaining -= 1;
      if (remaining === 0) setChecking(false);
    };
    void getProfileDefaults(user.id)
      .then((profile) => {
        const { category, ...identity } = defaultsFromAccount(profile, user);
        setForm((current) => ({ ...current, ...identity }));
        setFacultyOptions(facultyChoices(university?.slug ?? "", category, identity.faculty));
      })
      .catch(() => undefined)
      .finally(done);
    void hasApplied(internshipId, user.id)
      .then(setAlreadyApplied)
      .catch(() => setError("応募状況の確認に失敗しました。時間をおいて再度お試しください。"))
      .finally(done);
  }, [internshipId, university?.slug, user]);

  if (!user) {
    return (
      <div className="applicationGate">
        <h2>応募にはログインが必要です</h2>
        <p>ログイン後、この求人に戻って応募できます。</p>
        <Link
          to={path("/login")}
          state={{ from: path(`/career/internships/${internshipId}`) }}
        >
          ログインして応募する
        </Link>
      </div>
    );
  }
  if (checking) {
    return <p className="careerInlineState">応募状況を確認しています...</p>;
  }
  if (alreadyApplied) {
    return (
      <div className="applicationSuccess">
        <h2>この求人には応募済みです</h2>
        <Link to={path("/mypage/applications")}>応募状況を確認する</Link>
      </div>
    );
  }

  const update = (key: keyof ApplicationFormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const validationError = validateApplicationForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      await createApplication({
        internship_id: internshipId,
        user_id: user.id,
        university_id: university?.id ?? "",
        applicant_name: form.applicant_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        faculty: form.faculty.trim(),
        graduation_year: Number(form.graduation_year),
        motivation: form.motivation.trim(),
        skills: form.skills.trim(),
        portfolio_url: normalizeHttpUrl(form.portfolio_url) || null,
        additional_notes: form.additional_notes.trim() || null,
      });
      setAlreadyApplied(true);
      onSuccess();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(message.includes("duplicate") || message.includes("unique") ? "この求人にはすでに応募済みです。" : "応募を送信できませんでした。入力内容と募集状況を確認してください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="careerForm applicationForm" onSubmit={submit}>
      <h2>応募フォーム</h2>
      <p className="formNote">
        氏名・メール・所属・卒業予定年は登録情報から自動入力しています。電話番号は企業への連絡に使います。
        <span>*</span> は必須項目です。
      </p>
      <ApplicationFormFields form={form} facultyOptions={facultyOptions} onChange={update} />
      {error && (
        <p className="formError" role="alert">
          {error}
        </p>
      )}
      <button
        className="careerPrimaryButton"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "送信しています..." : "応募を送信する"}
      </button>
    </form>
  );
}
