import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/authContextValue";
import { createApplication, getProfileDefaults, hasApplied } from "../../services/careerService";
import ApplicationFormFields from "./ApplicationFormFields";
import {
  emptyApplicationForm,
  textValue,
  validateApplicationForm,
  type ApplicationFormState,
} from "./applicationFormState";

type Props = { internshipId: string; onSuccess: () => void };

export default function ApplicationForm({ internshipId, onSuccess }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyApplicationForm);
  const [checking, setChecking] = useState(Boolean(user));
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    void Promise.all([
      getProfileDefaults(user.id),
      hasApplied(internshipId, user.id),
    ]).then(([profile, applied]) => {
      setAlreadyApplied(applied);
      setForm((current) => ({
        ...current,
        applicant_name: textValue(profile?.name) || textValue(user.user_metadata.name),
        email: textValue(user.email),
        faculty: textValue(profile?.major),
        graduation_year: textValue(profile?.graduation_year),
      }));
    }).catch(() => setError("応募状況の確認に失敗しました。時間をおいて再度お試しください。"))
      .finally(() => setChecking(false));
  }, [internshipId, user]);

  if (!user) {
    return (
      <div className="applicationGate">
        <h2>応募にはログインが必要です</h2>
        <p>ログイン後、この求人に戻って応募できます。</p>
        <Link
          to="/login"
          state={{ from: `/career/internships/${internshipId}` }}
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
        <Link to="/mypage/applications">応募状況を確認する</Link>
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
        applicant_name: form.applicant_name.trim(),
        email: form.email.trim(),
        faculty: form.faculty.trim(),
        graduation_year: Number(form.graduation_year),
        motivation: form.motivation.trim(),
        skills: form.skills.trim(),
        portfolio_url: form.portfolio_url.trim() || null,
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
        <span>*</span> は必須項目です。
      </p>
      <ApplicationFormFields form={form} onChange={update} />
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
