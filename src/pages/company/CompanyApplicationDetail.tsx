import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CalendarDays, Clock3, Mail, Star } from "lucide-react";
import CompanyLayout from "../../components/company/CompanyLayout";
import { useAuth } from "../../components/auth/authContextValue";
import { normalizeHttpUrl } from "../../components/career/applicationFormState";
import { describeCompanyActivity, toTokyoDateTimeInput } from "../../lib/companyRecruiting";
import {
  listCompanyActivity, listCompanyApplications, saveCompanyReview, updateCompanyApplication,
  type CompanyActivity, type CompanyApplication,
} from "../../services/companyService";
import { applicationStatusLabels, type ApplicationStatus } from "../../types/career";

const formatDateTime = (value: string) => new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tokyo",
}).format(new Date(value));
type ReviewForm = { notes: string; shortlisted: boolean; next_action: string; next_action_date: string; interview_at: string; interview_url: string };
const emptyReview: ReviewForm = { notes: "", shortlisted: false, next_action: "", next_action_date: "", interview_at: "", interview_url: "" };
const reviewForm = (item: CompanyApplication): ReviewForm => ({
  notes: item.review?.notes ?? "", shortlisted: item.review?.shortlisted ?? false,
  next_action: item.review?.next_action ?? "", next_action_date: item.review?.next_action_date ?? "",
  interview_at: toTokyoDateTimeInput(item.review?.interview_at), interview_url: item.review?.interview_url ?? "",
});

export default function CompanyApplicationDetail() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  return <CompanyLayout title="応募詳細"><ApplicationDetails key={`${user?.id}:${id}`} id={id} userId={user?.id} /></CompanyLayout>;
}

function ApplicationDetails({ id, userId }: { id: string; userId?: string }) {
  const location = useLocation();
  const from: unknown = location.state?.from;
  const backTo = typeof from === "string" && (from === "/company" || from.startsWith("/company?")) ? from : "/company";
  const [item, setItem] = useState<CompanyApplication | null>(null);
  const [status, setStatus] = useState<ApplicationStatus>("submitted");
  const [form, setForm] = useState<ReviewForm>(emptyReview);
  const [activity, setActivity] = useState<CompanyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const busy = saving || reviewSaving;
  const dirty = item ? JSON.stringify(form) !== JSON.stringify(reviewForm(item)) : false;
  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    void listCompanyApplications(id).then(([application]) => {
      if (active) {
        setItem(application ?? null);
        if (application) { setStatus(application.status); setForm(reviewForm(application)); }
      }
    }).catch(() => { if (active) setError("応募情報を取得できませんでした。"); })
      .finally(() => { if (active) setLoading(false); });
    void listCompanyActivity(id).then(data => { if (active) { setActivity(data); setHistoryError(""); } })
      .catch(() => { if (active) setHistoryError("変更履歴を取得できませんでした。"); });
    return () => { active = false; };
  }, [id, userId, refresh]);
  const refreshHistory = async () => {
    try { setActivity(await listCompanyActivity(id)); setHistoryError(""); }
    catch { setHistoryError("変更は保存されましたが、履歴の再取得に失敗しました。"); }
  };
  const saveStatus = async () => {
    setSaving(true); setError(""); setMessage("");
    try {
      await updateCompanyApplication(id, status);
      setItem(current => current ? { ...current, status } : current);
      setMessage("選考状況を更新しました。学生の応募状況にも反映されます。");
      await refreshHistory();
    } catch { setError("選考状況を更新できませんでした。権限や最新の応募状況を確認してください。"); }
    finally { setSaving(false); }
  };
  const saveReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!item) return;
    setError(""); setMessage("");
    const meetingUrl = normalizeHttpUrl(form.interview_url);
    if (form.interview_url.trim() && !meetingUrl) { setError("面接URLには有効なhttps://またはhttp://のURLを入力してください。"); return; }
    setReviewSaving(true);
    try {
      const review = await saveCompanyReview(id, {
        notes: form.notes, shortlisted: form.shortlisted, next_action: form.next_action,
        next_action_date: form.next_action_date || null,
        interview_at: form.interview_at ? new Date(`${form.interview_at}:00+09:00`).toISOString() : null,
        interview_url: meetingUrl,
      }, item.review?.updated_at ?? null);
      const updated = { ...item, review };
      setItem(updated); setForm(reviewForm(updated));
      setMessage("選考メモと予定を保存しました。");
      await refreshHistory();
    } catch (failure) {
      const code = typeof failure === "object" && failure !== null && "code" in failure ? failure.code : "";
      setError(code === "PT409"
        ? "別の担当者が情報を更新しました。入力内容は保持しています。必要なメモを控えたうえで再読み込みし、最新の情報を確認してください。"
        : "メモ・予定を保存できませんでした。入力内容と閲覧権限をご確認ください。");
    } finally { setReviewSaving(false); }
  };
  const reload = () => {
    if (dirty && !window.confirm("保存していないメモや予定があります。破棄して最新情報を読み込みますか？")) return;
    setLoading(true); setMessage(""); setError(""); setRefresh(n => n + 1);
  };
  const portfolio = normalizeHttpUrl(item?.portfolio_url ?? "");
  const savedMeetingUrl = normalizeHttpUrl(item?.review?.interview_url ?? "");
  const mailSubject = item ? `【${item.internship?.company_name ?? ""}】${item.internship?.title ?? ""}について` : "";
  const mailBody = item ? `${item.applicant_name}さん\n\nこのたびはご応募いただきありがとうございます。\n${item.review?.interview_at ? `\n面接日時：${formatDateTime(item.review.interview_at)}（日本時間）\n${savedMeetingUrl ? `面接URL：${savedMeetingUrl}\n` : ""}` : ""}\n` : "";
  return <>
    <div className="companyIntro"><Link className="careerBack" to={backTo} onClick={event => { if (dirty && !window.confirm("保存していないメモや予定を破棄して一覧に戻りますか？")) event.preventDefault(); }}>応募一覧に戻る</Link><button type="button" disabled={busy || loading} onClick={reload}>最新情報を読み込む</button></div>
    {error && <p role="alert" className="formError">{error}</p>}{message && <p role="status" className="formSuccess">{message}</p>}
    {loading ? <div className="careerState">読み込んでいます...</div> : !item ? <div className="careerState">応募が見つからないか、閲覧権限がありません。</div> : <div className="companyDetailGrid">
      <div>
        <section className="adminPanel companyApplicantHeader">
          <div className="companyPanelHeading"><div><span className="companyEyebrow">APPLICANT</span><h2>{item.applicant_name}さん</h2></div>{item.review?.shortlisted && <span className="companyFavorite"><Star size={15} aria-hidden="true" />お気に入り</span>}</div>
          <dl className="adminDetailList">{[["メールアドレス", item.email], ["所属", item.faculty], ["卒業予定年", `${item.graduation_year}年`], ["応募日時（日本時間）", formatDateTime(item.created_at)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{label === "メールアドレス" ? <a href={`mailto:${encodeURIComponent(value)}`}>{value}</a> : value}</dd></div>)}</dl>
          <a className="companyOutlineLink" href={`mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`}><Mail size={16} aria-hidden="true" />連絡メールを作成</a><p className="companyHelp">メールアプリで下書きを開きます。保存済みの面接予定がある場合は本文に挿入します。</p>
        </section>
        <section className="adminPanel"><h2>応募内容</h2><div className="applicationAnswers"><h3>志望理由</h3><p>{item.motivation}</p><h3>経験・スキル</h3><p>{item.skills}</p><h3>ポートフォリオ</h3><p>{portfolio ? <a href={portfolio} target="_blank" rel="noreferrer">{portfolio}</a> : "未入力"}</p><h3>補足事項</h3><p>{item.additional_notes || "未入力"}</p></div></section>
        <section className="adminPanel"><div className="companyPanelHeading"><h2><Clock3 size={18} aria-hidden="true" />変更履歴</h2><span className="companyHelp">企業担当者内で共有</span></div>
          {historyError ? <p role="alert" className="formError">{historyError}</p> : <ol className="companyTimeline">{activity.map(event => <li key={event.id}><strong>{describeCompanyActivity(event)}</strong><span>{event.actor_email}</span><time dateTime={event.created_at}>{formatDateTime(event.created_at)}</time></li>)}<li><strong>応募を受け付けました</strong><time dateTime={item.created_at}>{formatDateTime(item.created_at)}</time></li></ol>}
        </section>
      </div>
      <aside>
        <section className="adminPanel companyReviewPanel"><h2>選考管理</h2><p className="jobReference"><span>{item.internship?.company_name}</span><strong>{item.internship?.title}</strong></p><p>現在：<span className={`statusBadge is-${item.status}`}>{applicationStatusLabels[item.status]}</span></p>
          {item.status === "withdrawn" ? <p>辞退された応募の選考状況は変更できません。</p> : <><label>選考状況<select disabled={busy} value={status} onChange={e => { setStatus(e.target.value as ApplicationStatus); setMessage(""); }}>{Object.entries(applicationStatusLabels).filter(([value]) => value !== "withdrawn").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><p className="companyHelp">学生のマイページにも反映されます。</p><button className="careerPrimaryButton" disabled={busy || status === item.status} onClick={() => void saveStatus()}>{saving ? "更新中..." : "選考状況を更新"}</button></>}
        </section>
        <form className="adminPanel companyReviewPanel" onSubmit={saveReview}><h2>選考メモ・予定</h2><p className="companyHelp">この求人の担当者だけに表示されます。学生には表示されず、メールも自動送信されません。</p>
          <label className="companyCheck"><input type="checkbox" disabled={busy} checked={form.shortlisted} onChange={e => setForm(current => ({ ...current, shortlisted: e.target.checked }))} /><Star size={16} aria-hidden="true" />お気に入りに追加</label>
          <label>選考メモ<textarea rows={7} maxLength={5000} disabled={busy} placeholder="面談で確認したいこと、評価のポイントなど" value={form.notes} onChange={e => setForm(current => ({ ...current, notes: e.target.value }))} /><small>{form.notes.length} / 5,000文字</small></label>
          <label>次の対応<input maxLength={200} disabled={busy} placeholder="例：面接候補日を連絡する" value={form.next_action} onChange={e => setForm(current => ({ ...current, next_action: e.target.value }))} /></label>
          <label>対応期限<input type="date" disabled={busy} value={form.next_action_date} onChange={e => setForm(current => ({ ...current, next_action_date: e.target.value }))} /></label>
          <div className="companyFormDivider"><CalendarDays size={17} aria-hidden="true" />面接予定</div>
          <label>面接日時（日本時間）<input type="datetime-local" disabled={busy} value={form.interview_at} onChange={e => setForm(current => ({ ...current, interview_at: e.target.value }))} /></label>
          <label>面接URL<input type="url" maxLength={2000} disabled={busy} placeholder="https://..." value={form.interview_url} onChange={e => setForm(current => ({ ...current, interview_url: e.target.value }))} /></label>
          {savedMeetingUrl && <a href={savedMeetingUrl} target="_blank" rel="noreferrer">保存済みの面接URLを開く</a>}
          <button className="careerPrimaryButton" disabled={busy || !dirty}>{reviewSaving ? "保存中..." : "メモ・予定を保存"}</button>
          <span className="companyHelp" aria-live="polite">{dirty ? "保存していない変更があります" : item.review ? `最終保存：${formatDateTime(item.review.updated_at)}` : "まだメモは保存されていません"}</span>
        </form>
      </aside>
    </div>}
  </>;
}
