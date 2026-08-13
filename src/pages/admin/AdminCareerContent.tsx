import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  createAlumniStory,
  createCareerArticle,
  deleteAlumniStory,
  deleteCareerArticle,
  listAdminAlumniStories,
  listAdminCareerArticles,
  updateAlumniStory,
  updateCareerArticle,
  updateContentStatus,
} from "../../services/contentService";
import {
  publishStatusLabels,
  type AlumniStoryInput,
  type AlumniStoryRecord,
  type CareerArticleInput,
  type CareerArticleRecord,
  type PublishStatus,
} from "../../types/content";
import { listUniversities } from "../../services/universityService";
import type { University } from "../../types/university";

type Tab = "articles" | "alumni";

const emptyArticle: CareerArticleInput = {
  category: "就活準備",
  title: "",
  description: "",
  content: "",
  published_at: new Date().toISOString().slice(0, 10),
  read_minutes: 5,
  status: "draft",
};

const emptyAlumni: AlumniStoryInput = {
  university_id: "",
  graduation_year: new Date().getFullYear(),
  faculty: "",
  destination: "",
  job_role: "",
  title: "",
  summary: "",
  tags: [],
  started_at: "",
  target_industries: "",
  challenge: "",
  actions: "",
  advice: "",
  current_work: "",
  status: "draft",
};

export default function AdminCareerContent() {
  const [tab, setTab] = useState<Tab>("articles");
  const [articles, setArticles] = useState<CareerArticleRecord[]>([]);
  const [stories, setStories] = useState<AlumniStoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [universityFilter, setUniversityFilter] = useState("all");

  const reload = async () => {
    setError("");
    const [nextArticles, nextStories] = await Promise.all([listAdminCareerArticles(), listAdminAlumniStories()]);
    setArticles(nextArticles);
    setStories(nextStories);
  };

  useEffect(() => {
    void Promise.all([listAdminCareerArticles(), listAdminAlumniStories(), listUniversities()])
      .then(([nextArticles, nextStories, nextUniversities]) => { setArticles(nextArticles); setStories(nextStories); setUniversities(nextUniversities); })
      .catch(() => setError("就活コンテンツを取得できませんでした。DBマイグレーションを確認してください。"))
      .finally(() => setLoading(false));
  }, []);

  return <AdminLayout title="就活コンテンツ管理">
    <div className="adminToolbar"><p>就活記事と卒業生体験記を登録し、公開状態を管理します。</p></div>
    <div className="adminFilters" role="tablist">
      <button className={tab === "articles" ? "isActive" : ""} onClick={() => setTab("articles")}>役立つ就活情報 <span>{articles.length}</span></button>
      <button className={tab === "alumni" ? "isActive" : ""} onClick={() => setTab("alumni")}>卒業生体験記 <span>{stories.length}</span></button>
      <select aria-label="大学で絞り込む" value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)}><option value="all">すべての大学</option>{universities.map((university) => <option value={university.id} key={university.id}>{university.name}</option>)}</select>
    </div>
    {error && <p className="formError" role="alert">{error}</p>}
    {loading ? <div className="careerState">読み込んでいます...</div> : tab === "articles"
      ? <ArticleManager items={articles.filter((item) => universityFilter === "all" || item.university_ids?.includes(universityFilter))} universities={universities} onReload={reload} />
      : <AlumniManager items={stories.filter((item) => universityFilter === "all" || item.university_id === universityFilter)} universities={universities} onReload={reload} />}
  </AdminLayout>;
}

function ArticleManager({ items, universities, onReload }: { items: CareerArticleRecord[]; universities: University[]; onReload: () => Promise<void> }) {
  const [form, setForm] = useState<CareerArticleInput>(emptyArticle);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [targetUniversityIds, setTargetUniversityIds] = useState<string[]>(
    () => universities.filter((item) => item.slug === "tsukuba").map((item) => item.id),
  );
  const update = <K extends keyof CareerArticleInput>(key: K, value: CareerArticleInput[K]) => setForm((current) => ({ ...current, [key]: value }));

  const edit = (item: CareerArticleRecord) => {
    setEditingId(item.id);
    setTargetUniversityIds(item.university_ids ?? []);
    setForm({ category: item.category, title: item.title, description: item.description, content: item.content, published_at: item.published_at, read_minutes: item.read_minutes, status: item.status });
    setMessage(""); setError("");
  };

  const reset = () => { setEditingId(null); setForm(emptyArticle); setTargetUniversityIds(universities.filter((item) => item.slug === "tsukuba").map((item) => item.id)); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      if (!targetUniversityIds.length) throw new Error("target_required");
      if (editingId) await updateCareerArticle(editingId, form, targetUniversityIds); else await createCareerArticle(form, targetUniversityIds);
      await onReload(); reset(); setMessage(editingId ? "記事を更新しました。" : "記事を登録しました。");
    } catch { setError("記事を保存できませんでした。"); }
    finally { setSaving(false); }
  };

  const changeStatus = async (id: string, status: PublishStatus) => {
    try { await updateContentStatus("career_articles", id, status); await onReload(); setMessage("公開状態を変更しました。"); }
    catch { setError("公開状態を変更できませんでした。"); }
  };

  const remove = async (item: CareerArticleRecord) => {
    if (!window.confirm(`「${item.title}」を削除しますか？`)) return;
    try { await deleteCareerArticle(item.id); await onReload(); if (editingId === item.id) reset(); setMessage("記事を削除しました。"); }
    catch { setError("記事を削除できませんでした。"); }
  };

  return <div className="adminContentManager">
    <form className="careerForm adminCompactForm" onSubmit={submit}>
      <div className="adminPanelHeader"><h2>{editingId ? "記事を編集" : "記事を新規登録"}</h2>{editingId && <button className="adminTextButton" type="button" onClick={reset}>編集をキャンセル</button>}</div>
      <div className="formGrid">
        <label>カテゴリー <span>*</span><input required value={form.category} onChange={(event) => update("category", event.target.value)} /></label>
        <label>公開日 <span>*</span><input required type="date" value={form.published_at} onChange={(event) => update("published_at", event.target.value)} /></label>
        <label>読了時間（分） <span>*</span><input required min={1} max={120} type="number" value={form.read_minutes} onChange={(event) => update("read_minutes", Number(event.target.value))} /></label>
        <label>公開状態<select value={form.status} onChange={(event) => update("status", event.target.value as PublishStatus)}><option value="draft">下書き</option><option value="published">公開中</option></select></label>
      </div>
      <label>タイトル <span>*</span><input required maxLength={160} value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
      <label>一覧の説明 <span>*</span><textarea required rows={3} maxLength={500} value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
      <label>本文<textarea rows={5} value={form.content} onChange={(event) => update("content", event.target.value)} /></label>
      <fieldset className="adminUniversityTargets"><legend>掲載対象大学 <span>*</span></legend>{universities.map((university) => <label className="checkboxLabel" key={university.id}><input type="checkbox" checked={targetUniversityIds.includes(university.id)} onChange={(event) => setTargetUniversityIds((current) => event.target.checked ? [...current, university.id] : current.filter((id) => id !== university.id))} />{university.name}</label>)}</fieldset>
      {error && <p className="formError" role="alert">{error}</p>}{message && <p className="formSuccess" role="status">{message}</p>}
      <div className="formActions"><button className="careerPrimaryButton" disabled={saving}>{saving ? "保存中..." : editingId ? "変更を保存" : "記事を登録"}</button></div>
    </form>
    <ContentTable items={items} onEdit={edit} onRemove={remove} onStatus={changeStatus} />
  </div>;
}

function AlumniManager({ items, universities, onReload }: { items: AlumniStoryRecord[]; universities: University[]; onReload: () => Promise<void> }) {
  const [form, setForm] = useState<AlumniStoryInput>(emptyAlumni);
  const [tags, setTags] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const update = <K extends keyof AlumniStoryInput>(key: K, value: AlumniStoryInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const edit = (item: AlumniStoryRecord) => {
    const { id: _id, created_at: _created, updated_at: _updated, ...input } = item;
    void _id; void _created; void _updated;
    setEditingId(item.id); setForm(input); setTags(item.tags.join(", ")); setMessage(""); setError("");
  };
  const reset = () => { setEditingId(null); setForm(emptyAlumni); setTags(""); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    const input = { ...form, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
    try {
      if (editingId) await updateAlumniStory(editingId, input); else await createAlumniStory(input);
      await onReload(); reset(); setMessage(editingId ? "体験記を更新しました。" : "体験記を登録しました。");
    } catch { setError("体験記を保存できませんでした。"); }
    finally { setSaving(false); }
  };
  const changeStatus = async (id: string, status: PublishStatus) => {
    try { await updateContentStatus("alumni_stories", id, status); await onReload(); setMessage("公開状態を変更しました。"); }
    catch { setError("公開状態を変更できませんでした。"); }
  };
  const remove = async (item: AlumniStoryRecord) => {
    if (!window.confirm(`「${item.title}」を削除しますか？`)) return;
    try { await deleteAlumniStory(item.id); await onReload(); if (editingId === item.id) reset(); setMessage("体験記を削除しました。"); }
    catch { setError("体験記を削除できませんでした。"); }
  };

  return <div className="adminContentManager">
    <form className="careerForm adminCompactForm" onSubmit={submit}>
      <div className="adminPanelHeader"><h2>{editingId ? "体験記を編集" : "体験記を新規登録"}</h2>{editingId && <button className="adminTextButton" type="button" onClick={reset}>編集をキャンセル</button>}</div>
      <div className="formGrid">
        <label>大学 <span>*</span><select required value={form.university_id} onChange={(event) => update("university_id", event.target.value)}><option value="">選択する</option>{universities.map((university) => <option value={university.id} key={university.id}>{university.name}</option>)}</select></label>
        <label>卒業年度 <span>*</span><input required type="number" min={1950} max={2100} value={form.graduation_year} onChange={(event) => update("graduation_year", Number(event.target.value))} /></label>
        <label>学群・学類 <span>*</span><input required value={form.faculty} onChange={(event) => update("faculty", event.target.value)} /></label>
        <label>進路・業界 <span>*</span><input required value={form.destination} onChange={(event) => update("destination", event.target.value)} /></label>
        <label>職種 <span>*</span><input required value={form.job_role} onChange={(event) => update("job_role", event.target.value)} /></label>
        <label>就活開始時期 <span>*</span><input required value={form.started_at} onChange={(event) => update("started_at", event.target.value)} /></label>
        <label>志望業界 <span>*</span><input required value={form.target_industries} onChange={(event) => update("target_industries", event.target.value)} /></label>
        <label>タグ（カンマ区切り）<input value={tags} onChange={(event) => setTags(event.target.value)} /></label>
        <label>公開状態<select value={form.status} onChange={(event) => update("status", event.target.value as PublishStatus)}><option value="draft">下書き</option><option value="published">公開中</option></select></label>
      </div>
      <label>タイトル <span>*</span><input required value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
      <label>概要 <span>*</span><textarea required rows={3} value={form.summary} onChange={(event) => update("summary", event.target.value)} /></label>
      <label>苦労したこと <span>*</span><textarea required rows={3} value={form.challenge} onChange={(event) => update("challenge", event.target.value)} /></label>
      <label>実際に行った対策 <span>*</span><textarea required rows={3} value={form.actions} onChange={(event) => update("actions", event.target.value)} /></label>
      <label>後輩へのアドバイス <span>*</span><textarea required rows={3} value={form.advice} onChange={(event) => update("advice", event.target.value)} /></label>
      <label>現在の仕事 <span>*</span><textarea required rows={3} value={form.current_work} onChange={(event) => update("current_work", event.target.value)} /></label>
      {error && <p className="formError" role="alert">{error}</p>}{message && <p className="formSuccess" role="status">{message}</p>}
      <div className="formActions"><button className="careerPrimaryButton" disabled={saving}>{saving ? "保存中..." : editingId ? "変更を保存" : "体験記を登録"}</button></div>
    </form>
    <ContentTable items={items} onEdit={edit} onRemove={remove} onStatus={changeStatus} />
  </div>;
}

function ContentTable<T extends CareerArticleRecord | AlumniStoryRecord>({ items, onEdit, onRemove, onStatus }: { items: T[]; onEdit: (item: T) => void; onRemove: (item: T) => void; onStatus: (id: string, status: PublishStatus) => void }) {
  if (!items.length) return <div className="careerState">登録されたコンテンツはありません。</div>;
  return <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>タイトル</th><th>公開状態</th><th>更新日</th><th>操作</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}>
    <td><strong>{item.title}</strong><span>{"category" in item ? item.category : `${item.graduation_year}年度卒・${item.job_role}`}</span></td>
    <td><select aria-label={`${item.title}の公開状態`} value={item.status} onChange={(event) => onStatus(item.id, event.target.value as PublishStatus)}>{Object.entries(publishStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td>
    <td>{new Intl.DateTimeFormat("ja-JP").format(new Date(item.updated_at))}</td>
    <td><div className="tableActions"><button onClick={() => onEdit(item)}>編集</button><button onClick={() => onRemove(item)}>削除</button></div></td>
  </tr>)}</tbody></table></div>;
}
