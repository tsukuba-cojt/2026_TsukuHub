import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  createClassAnnouncement,
  deleteClassAnnouncement,
  listAdminClassAnnouncements,
  listAdminReviewReports,
  updateClassAnnouncement,
  updateContentStatus,
  updateReviewReport,
} from "../../services/contentService";
import {
  publishStatusLabels,
  reviewReportStatusLabels,
  type ClassAnnouncementInput,
  type ClassAnnouncementRecord,
  type PublishStatus,
  type ReviewReport,
  type ReviewReportStatus,
} from "../../types/content";

type Tab = "announcements" | "reports";

const emptyAnnouncement: ClassAnnouncementInput = {
  category: "お知らせ",
  title: "",
  content: "",
  published_at: new Date().toISOString().slice(0, 10),
  status: "draft",
};

export default function AdminClassManagement() {
  const [tab, setTab] = useState<Tab>("announcements");
  const [announcements, setAnnouncements] = useState<ClassAnnouncementRecord[]>([]);
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = async () => {
    setError("");
    const [nextAnnouncements, nextReports] = await Promise.all([listAdminClassAnnouncements(), listAdminReviewReports()]);
    setAnnouncements(nextAnnouncements); setReports(nextReports);
  };

  useEffect(() => {
    void Promise.all([listAdminClassAnnouncements(), listAdminReviewReports()])
      .then(([nextAnnouncements, nextReports]) => { setAnnouncements(nextAnnouncements); setReports(nextReports); })
      .catch(() => setError("履修管理データを取得できませんでした。DBマイグレーションを確認してください。"))
      .finally(() => setLoading(false));
  }, []);

  return <AdminLayout title="履修・通報管理">
    <div className="adminToolbar"><p>履修ページのお知らせと、口コミに届いた通報を管理します。</p></div>
    <div className="adminFilters" role="tablist">
      <button className={tab === "announcements" ? "isActive" : ""} onClick={() => setTab("announcements")}>お知らせ <span>{announcements.length}</span></button>
      <button className={tab === "reports" ? "isActive" : ""} onClick={() => setTab("reports")}>口コミ通報 <span>{reports.length}</span></button>
    </div>
    {error && <p className="formError" role="alert">{error}</p>}
    {loading ? <div className="careerState">読み込んでいます...</div> : tab === "announcements"
      ? <AnnouncementManager items={announcements} onReload={reload} />
      : <ReportManager items={reports} onReload={reload} />}
  </AdminLayout>;
}

function AnnouncementManager({ items, onReload }: { items: ClassAnnouncementRecord[]; onReload: () => Promise<void> }) {
  const [form, setForm] = useState<ClassAnnouncementInput>(emptyAnnouncement);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const update = <K extends keyof ClassAnnouncementInput>(key: K, value: ClassAnnouncementInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setEditingId(null); setForm(emptyAnnouncement); };
  const edit = (item: ClassAnnouncementRecord) => {
    setEditingId(item.id);
    setForm({ category: item.category, title: item.title, content: item.content, published_at: item.published_at, status: item.status });
    setMessage(""); setError("");
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      if (editingId) await updateClassAnnouncement(editingId, form); else await createClassAnnouncement(form);
      await onReload(); reset(); setMessage(editingId ? "お知らせを更新しました。" : "お知らせを登録しました。");
    } catch { setError("お知らせを保存できませんでした。"); }
    finally { setSaving(false); }
  };
  const changeStatus = async (id: string, status: PublishStatus) => {
    try { await updateContentStatus("class_announcements", id, status); await onReload(); setMessage("公開状態を変更しました。"); }
    catch { setError("公開状態を変更できませんでした。"); }
  };
  const remove = async (item: ClassAnnouncementRecord) => {
    if (!window.confirm(`「${item.title}」を削除しますか？`)) return;
    try { await deleteClassAnnouncement(item.id); await onReload(); if (editingId === item.id) reset(); setMessage("お知らせを削除しました。"); }
    catch { setError("お知らせを削除できませんでした。"); }
  };

  return <div className="adminContentManager">
    <form className="careerForm adminCompactForm" onSubmit={submit}>
      <div className="adminPanelHeader"><h2>{editingId ? "お知らせを編集" : "お知らせを新規登録"}</h2>{editingId && <button className="adminTextButton" type="button" onClick={reset}>編集をキャンセル</button>}</div>
      <div className="formGrid">
        <label>カテゴリー <span>*</span><input required value={form.category} onChange={(event) => update("category", event.target.value)} /></label>
        <label>掲載日 <span>*</span><input required type="date" value={form.published_at} onChange={(event) => update("published_at", event.target.value)} /></label>
        <label>公開状態<select value={form.status} onChange={(event) => update("status", event.target.value as PublishStatus)}><option value="draft">下書き</option><option value="published">公開中</option></select></label>
      </div>
      <label>タイトル <span>*</span><input required value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
      <label>本文<textarea rows={4} value={form.content} onChange={(event) => update("content", event.target.value)} /></label>
      {error && <p className="formError" role="alert">{error}</p>}{message && <p className="formSuccess" role="status">{message}</p>}
      <div className="formActions"><button className="careerPrimaryButton" disabled={saving}>{saving ? "保存中..." : editingId ? "変更を保存" : "お知らせを登録"}</button></div>
    </form>
    {!items.length ? <div className="careerState">登録されたお知らせはありません。</div> : <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>お知らせ</th><th>掲載日</th><th>公開状態</th><th>操作</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}>
      <td><strong>{item.title}</strong><span>{item.category}</span></td>
      <td>{new Intl.DateTimeFormat("ja-JP").format(new Date(item.published_at))}</td>
      <td><select aria-label={`${item.title}の公開状態`} value={item.status} onChange={(event) => void changeStatus(item.id, event.target.value as PublishStatus)}>{Object.entries(publishStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td>
      <td><div className="tableActions"><button onClick={() => edit(item)}>編集</button><button onClick={() => void remove(item)}>削除</button></div></td>
    </tr>)}</tbody></table></div>}
  </div>;
}

function ReportManager({ items, onReload }: { items: ReviewReport[]; onReload: () => Promise<void> }) {
  const [filter, setFilter] = useState<"all" | ReviewReportStatus>("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const visible = useMemo(() => items.filter((item) => filter === "all" || item.status === filter), [filter, items]);
  const filters: ["all" | ReviewReportStatus, string][] = [["all", "すべて"], ...Object.entries(reviewReportStatusLabels) as [ReviewReportStatus, string][]];
  const save = async (id: string, status: ReviewReportStatus, notes: string) => {
    setError(""); setMessage("");
    try { await updateReviewReport(id, status, notes); await onReload(); setMessage("通報の対応状況を保存しました。"); }
    catch { setError("通報の対応状況を保存できませんでした。"); }
  };
  return <div>
    <section className="adminStats adminReportStats">{Object.entries(reviewReportStatusLabels).map(([status, label]) => <article key={status}><span>{label}</span><strong>{items.filter((item) => item.status === status).length}</strong><small>件</small></article>)}</section>
    <div className="adminFilters adminReportFilters">{filters.map(([value, label]) => <button className={filter === value ? "isActive" : ""} onClick={() => setFilter(value)} key={value}>{label}<span>{value === "all" ? items.length : items.filter((item) => item.status === value).length}</span></button>)}</div>
    {error && <p className="formError" role="alert">{error}</p>}{message && <p className="formSuccess" role="status">{message}</p>}
    {!visible.length ? <div className="careerState">該当する通報はありません。</div> : <div className="adminReportList">{visible.map((report) => <ReportCard report={report} onSave={save} key={report.id} />)}</div>}
  </div>;
}

function ReportCard({ report, onSave }: { report: ReviewReport; onSave: (id: string, status: ReviewReportStatus, notes: string) => Promise<void> }) {
  const [status, setStatus] = useState(report.status);
  const [notes, setNotes] = useState(report.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await onSave(report.id, status, notes); } finally { setSaving(false); } };
  return <article className="adminPanel adminReportCard">
    <header><div><span>{report.course_code}／口コミID: {report.review_id}</span><h2>{report.reason}</h2></div><time>{new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.created_at))}</time></header>
    <blockquote>{report.review_snapshot}</blockquote>
    <div className="adminReportControls">
      <label>対応状況<select value={status} onChange={(event) => setStatus(event.target.value as ReviewReportStatus)}>{Object.entries(reviewReportStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label>管理メモ<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="確認内容や対応結果を記録" /></label>
      <button className="careerPrimaryButton" disabled={saving} onClick={() => void save()}>{saving ? "保存中..." : "対応状況を保存"}</button>
    </div>
  </article>;
}
