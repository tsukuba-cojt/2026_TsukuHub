import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../auth/authContextValue";
import { createApplication, getProfileDefaults, hasApplied, sendApplicationNotification } from "../../services/careerService";
import ApplicationFormFields from "./ApplicationFormFields";
import { useUniversity } from "../university/universityContextValue";
import {
  emptyApplicationForm,
  normalizeHttpUrl,
  textValue,
  validateApplicationForm,
  type ApplicationFormState,
} from "./applicationFormState";

type Props = {
  internshipId: string;
  title: string;
  companyName: string;
  onSuccess: (result?: { applicationId: string; notificationSent: boolean }) => void;
};

const reviewFields: [keyof ApplicationFormState, string][] = [
  ["applicant_name", "氏名"], ["email", "メールアドレス"],
  ["faculty", "所属学群・学類"], ["graduation_year", "卒業予定年"],
  ["motivation", "志望理由"], ["skills", "経験・スキル"],
  ["portfolio_url", "ポートフォリオURL"], ["additional_notes", "補足事項"],
];

export default function ApplicationForm(props: Props) {
  const { user, loading } = useAuth();
  if (loading) return <p className="careerInlineState" role="status">ログイン状況を確認しています...</p>;
  return <ApplicationFlow key={`${props.internshipId}:${user?.id ?? "guest"}`} {...props} />;
}

function ApplicationFlow({ internshipId, title, companyName, onSuccess }: Props) {
  const { user } = useAuth();
  const { university, path } = useUniversity();
  const [form, setForm] = useState(emptyApplicationForm);
  const [checkState, setCheckState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [step, setStep] = useState<"input" | "review" | "complete">("input");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [profileWarning, setProfileWarning] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [notificationSent, setNotificationSent] = useState<boolean | null>(null);
  const [resendingNotification, setResendingNotification] = useState(false);
  const sending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const userId = user?.id;
  const userEmail = textValue(user?.email);
  const userName = textValue(user?.user_metadata.name);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void Promise.allSettled([
      getProfileDefaults(userId),
      hasApplied(internshipId, userId),
    ]).then(([profileResult, appliedResult]) => {
      if (!active) return;
      if (appliedResult.status === "rejected") {
        setCheckState("error");
        return;
      }
      const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
      setProfileWarning(profileResult.status === "rejected");
      setAlreadyApplied(appliedResult.value);
      const profileFaculty = textValue(profile?.faculty);
      const profileMajor = textValue(profile?.major);
      const profileAffiliation = [profileFaculty, profileMajor].filter(Boolean).join(" / ");
      setForm((current) => ({
        ...current,
        applicant_name: current.applicant_name || textValue(profile?.name) || userName,
        email: current.email || userEmail,
        faculty: current.faculty || profileAffiliation,
        graduation_year: current.graduation_year || textValue(profile?.graduation_year),
      }));
      setCheckState("ready");
    });
    return () => { active = false; };
  }, [internshipId, userId, userEmail, userName, attempt]);

  useEffect(() => {
    if (checkState !== "ready") return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, checkState, alreadyApplied]);

  if (!user) {
    return (
      <div className="applicationGate">
        <h2>ログインして応募を進める</h2>
        <p>{companyName}「{title}」への応募です。</p>
        <p>ログイン後、応募フォームに戻ります。入力内容を確認してから送信できます。</p>
        <Link to={path("/login")} state={{ from: `${path(`/career/internships/${internshipId}`)}#application` }}>
          ログインして応募する
        </Link>
      </div>
    );
  }
  if (checkState === "loading") {
    return <p className="careerInlineState" role="status">応募状況を確認しています...</p>;
  }
  if (checkState === "error") {
    return (
      <div className="applicationGate">
        <h2>応募状況を確認できませんでした</h2>
        <p role="alert">通信状況を確認して、もう一度お試しください。</p>
        <button className="careerPrimaryButton" type="button" onClick={() => {
          setCheckState("loading");
          setAttempt((value) => value + 1);
        }}>再試行する</button>
      </div>
    );
  }

  const completed = step === "complete";
  const stepIndex = completed || alreadyApplied ? 2 : step === "review" ? 1 : 0;
  const update = (key: keyof ApplicationFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending.current || alreadyApplied || completed) return;
    setError("");
    const validationError = validateApplicationForm(form);
    if (validationError) {
      setError(validationError);
      setStep("input");
      return;
    }
    if (step === "input") {
      setStep("review");
      return;
    }
    if (!university) {
      setError("大学情報を取得できませんでした。時間をおいて再度お試しください。");
      return;
    }
    sending.current = true;
    setSubmitting(true);
    try {
      const result = await createApplication({
        internship_id: internshipId,
        user_id: user.id,
        university_id: university.id,
        applicant_name: form.applicant_name.trim(),
        email: form.email.trim(),
        faculty: form.faculty.trim(),
        graduation_year: Number(form.graduation_year),
        motivation: form.motivation.trim(),
        skills: form.skills.trim(),
        portfolio_url: normalizeHttpUrl(form.portfolio_url) || null,
        additional_notes: form.additional_notes.trim() || null,
      });
      setApplicationId(result.applicationId);
      setNotificationSent(result.notificationSent);
      setStep("complete");
      onSuccess(result);
    } catch (caught) {
      const duplicate = typeof caught === "object" && caught !== null && "code" in caught && caught.code === "23505";
      if (duplicate) {
        setAlreadyApplied(true);
        onSuccess();
      } else {
        setError("応募を送信できませんでした。入力内容は保持されています。通信状況や募集締切を確認して、再度お試しください。");
      }
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  };

  const retryNotification = async () => {
    if (!applicationId || resendingNotification) return;
    setResendingNotification(true);
    setError("");
    let sent: boolean;
    try {
      sent = await sendApplicationNotification(applicationId);
    } catch {
      sent = false;
    }
    setNotificationSent(sent);
    if (!sent) setError("企業への通知を再送できませんでした。管理者に応募IDをお知らせください。");
    setResendingNotification(false);
  };

  return (
    <div className="careerForm applicationForm">
      <ol className="applicationProgress" aria-label="応募の手順">
        {["入力", "内容確認", "完了"].map((label, index) => (
          <li key={label} className={index <= stepIndex ? "isActive" : ""} aria-current={index === stepIndex ? "step" : undefined}>
            <span>{index + 1}</span>{label}
          </li>
        ))}
      </ol>
      <div className="applicationTarget"><span>{companyName}</span><strong>{title}</strong></div>
      <h2 ref={heading} tabIndex={-1} className="applicationHeading">
        {completed ? "応募を受け付けました" : alreadyApplied ? "この求人には応募済みです" : step === "review" ? "応募内容の確認" : "応募情報の入力"}
      </h2>
      {completed || alreadyApplied ? (
        <div className="applicationCompletion" role="status">
          <CheckCircle2 size={44} aria-hidden="true" />
          <p>{completed ? "応募の送信が完了しました。" : "同じ求人への再応募は不要です。"}マイページから現在の選考状況を確認できます。</p>
          {completed && <p>連絡先：{form.email.trim()}</p>}
          {completed && notificationSent === false && <div className="applicationNotificationWarning" role="alert"><p>応募は保存されていますが、企業への通知メールを送信できませんでした。</p><button className="applicationEditButton" type="button" disabled={resendingNotification} onClick={() => void retryNotification()}>{resendingNotification ? "再送しています..." : "企業への通知を再送する"}</button></div>}
          <Link className="careerPrimaryButton" to={path("/mypage/applications")}>応募状況を確認する</Link>
          <Link className="applicationBackLink" to={path("/career/internships")}>ほかのインターンを探す</Link>
        </div>
      ) : (
        <form className="applicationStepForm" onSubmit={submit} aria-busy={submitting}>
          {step === "input" ? (
            <>
              <p className="formNote">登録済みの情報を入力しています。内容を確認・修正してください。<br /><span>*</span> は必須項目です。次の画面で送信前に確認できます。</p>
              {profileWarning && <p className="formNote" role="status">プロフィールを取得できなかったため、空欄の項目を入力してください。</p>}
              <ApplicationFormFields form={form} onChange={update} />
            </>
          ) : (
            <>
              <p className="formNote">まだ応募は送信されていません。応募先と入力内容を確認し、「この内容で応募する」を押してください。</p>
              <dl className="applicationReview">
                {reviewFields.map(([key, label]) => (
                  <div key={key}><dt>{label}</dt><dd>{form[key].trim() || "未入力"}{key === "graduation_year" ? "年" : ""}</dd></div>
                ))}
              </dl>
            </>
          )}
          {error && <p className="formError" role="alert">{error}</p>}
          <div className="applicationActions">
            {step === "review" && <button className="applicationEditButton" type="button" disabled={submitting} onClick={() => { setStep("input"); setError(""); }}>入力内容を修正する</button>}
            <button className="careerPrimaryButton" disabled={submitting} type="submit">
              {submitting ? "送信しています..." : step === "input" ? "応募内容を確認する" : "この内容で応募する"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
