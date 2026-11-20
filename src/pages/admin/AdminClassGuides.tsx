import { useEffect, useRef, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ArticleMarkdown from "../../components/career/ArticleMarkdown";
import { useAuth } from "../../components/auth/authContextValue";
import { classGuideCategories, type ClassGuideCategory } from "../../data/classGuideCategories";
import { deleteClassGuide, listAdminClassGuides, saveClassGuide } from "../../services/classGuideService";
import { listUniversities } from "../../services/universityService";
import { uploadArticleImage } from "../../services/contentService";
import { insertAtCursor } from "../../lib/articleMarkdown";
import type { ClassGuideArticleInput, ClassGuideArticleRecord } from "../../types/classGuide";
import type { University } from "../../types/university";

const freshInput = (): ClassGuideArticleInput => ({
  category: "registration_strategy", title: "", description: "", badge_label: null,
  cover_theme: "strategy", cover_image_url: null, content: "", read_minutes: 5,
  sort_order: 0, published_at: new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date()), status: "draft",
});

export default function AdminClassGuides() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClassGuideArticleRecord[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState(freshInput);
  const [targets, setTargets] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    void Promise.all([listAdminClassGuides(), listUniversities()]).then(([articles, schools]) => {
      setItems(articles); setUniversities(schools);
      setTargets(schools.filter((school) => school.slug === "tsukuba").map((school) => school.id));
    }).catch(() => setError("記事を取得できませんでした。画面を再読み込みしてください。"))
      .finally(() => setLoading(false));
  }, []);
  const update = <K extends keyof ClassGuideArticleInput>(key: K, value: ClassGuideArticleInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setEditingId(null); setForm(freshInput()); setPreview(false); setTargets(universities.filter((school) => school.slug === "tsukuba").map((school) => school.id)); };
  const edit = (item: ClassGuideArticleRecord) => {
    const { id, created_at, updated_at, university_ids, ...input } = item;
    void created_at; void updated_at;
    setEditingId(id); setForm(input); setTargets(university_ids ?? []); setPreview(false); setError(""); setMessage("");
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError(""); setMessage("");
    if (!targets.length) return setError("掲載対象大学を選択してください。");
    if (!form.title.trim() || !form.content.trim()) return setError("タイトルと本文を入力してください。");
    setBusy(true);
    let saved = false;
    try {
      const id = await saveClassGuide(editingId, { ...form, title: form.title.trim() }, targets);
      saved = true; setEditingId(id); setMessage("保存しました。");
      setItems(await listAdminClassGuides());
    } catch (cause) { setError(saved ? "保存しましたが、一覧を再取得できませんでした。画面を再読み込みしてください。" : `保存できませんでした。${(cause as Error).message ?? "もう一度お試しください。"}`); }
    finally { setBusy(false); }
  };
  const remove = async (item: ClassGuideArticleRecord) => {
    if (busy || !window.confirm(`「${item.title}」を削除しますか？`)) return;
    setBusy(true); setError(""); setMessage("");
    try { await deleteClassGuide(item.id); setItems((current) => current.filter((article) => article.id !== item.id)); if (editingId === item.id) reset(); setMessage("削除しました。"); }
    catch { setError("削除できませんでした。"); }
    finally { setBusy(false); }
  };
  const upload = async (file: File, cover: boolean) => {
    if (!user || busy) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return setError("2MB以下の画像を選択してください。");
    const textarea = contentRef.current;
    const start = textarea?.selectionStart ?? form.content.length;
    const end = textarea?.selectionEnd ?? start;
    setBusy(true); setError("");
    try {
      const url = await uploadArticleImage(file, user.id);
      if (cover) update("cover_image_url", url);
      else update("content", insertAtCursor(form.content, start, end, `\n![画像の説明](${url})\n`).value);
    } catch { setError("画像をアップロードできませんでした。"); }
    finally { setBusy(false); }
  };
  const visible = items.filter((item) => (filter === "all" || item.category === filter) && item.title.includes(search));

  return <AdminLayout title="履修戦略・授業選びの記事管理">
    <p>記事を作成し、対象大学を選んで公開できます。公開した記事は履修ページに表示され、「注目トピック」でも掲載を選べます。</p>
    {error && <p className="formError" role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {loading ? <div className="careerState">読み込み中…</div> : <div className="adminContentManager">
      <form className="careerForm adminCompactForm" onSubmit={(event) => void submit(event)}>
        <div className="adminPanelHeader"><h2>{editingId ? "記事を編集" : "新しい記事を書く"}</h2><button type="button" disabled={busy} className="adminTextButton" onClick={reset}>新規作成</button></div>
        <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <div className="formGrid">
            <label>記事の種類<select value={form.category} onChange={(event) => { const category = event.target.value as ClassGuideCategory; setForm((current) => ({ ...current, category, cover_theme: category === "registration_strategy" ? "strategy" : "selection" })); }}>{Object.entries(classGuideCategories).map(([key, category]) => <option key={key} value={key}>{category.label}</option>)}</select></label>
            <label>公開状態<select value={form.status} onChange={(event) => update("status", event.target.value === "published" ? "published" : "draft")}><option value="draft">下書き</option><option value="published">公開</option></select></label>
            <label>掲載日<input type="date" required value={form.published_at} onChange={(event) => update("published_at", event.target.value)} /></label>
            <label>読む時間（分）<input type="number" required min={1} max={120} value={form.read_minutes} onChange={(event) => update("read_minutes", Number(event.target.value))} /></label>
            <label>表示順（小さい順）<input type="number" required step={1} value={form.sort_order} onChange={(event) => update("sort_order", Number(event.target.value))} /></label>
            <label>バッジ<input value={form.badge_label ?? ""} onChange={(event) => update("badge_label", event.target.value || null)} placeholder="例：新入生向け" /></label>
          </div>
          <label>タイトル<input required value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
          <label>記事の概要<textarea rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
          <label>カバー画像（2MB以下）<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, true); event.target.value = ""; }} /></label>
          {form.cover_image_url && <div className="logoPreview bannerPreview"><img src={form.cover_image_url} alt="記事のカバー" /><button type="button" onClick={() => update("cover_image_url", null)}>画像を外す</button></div>}
          <label>本文（Markdown対応）<textarea ref={contentRef} rows={16} required value={form.content} onChange={(event) => update("content", event.target.value)} placeholder="## 見出し を使って記事を書けます" /></label>
          <label>本文に画像を追加（2MB以下）<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, false); event.target.value = ""; }} /></label>
          <button type="button" className="adminTextButton" onClick={() => setPreview((current) => !current)}>{preview ? "プレビューを閉じる" : "本文をプレビュー"}</button>
          {preview && <section className="adminPanel"><h3>{form.title}</h3><ArticleMarkdown source={form.content} /></section>}
          <fieldset className="adminUniversityTargets"><legend>掲載対象大学（必須）</legend>{universities.map((school) => <label key={school.id} className="checkboxLabel"><input type="checkbox" checked={targets.includes(school.id)} onChange={(event) => setTargets((current) => event.target.checked ? [...current, school.id] : current.filter((id) => id !== school.id))} />{school.name}</label>)}</fieldset>
          <button className="careerPrimaryButton">{busy ? "処理中…" : "保存"}</button>
        </fieldset>
      </form>
      <section><div className="adminFilters"><select aria-label="記事の種類で絞り込み" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">すべての記事</option>{Object.entries(classGuideCategories).map(([key, category]) => <option key={key} value={key}>{category.label}</option>)}</select><input aria-label="記事タイトルを検索" placeholder="タイトルで検索" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>記事</th><th>掲載先</th><th>状態</th><th>操作</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><span>{classGuideCategories[item.category].label}・{item.published_at}</span></td><td>{universities.filter((school) => item.university_ids?.includes(school.id)).map((school) => school.short_name).join("、")}</td><td>{item.status === "published" ? "公開中" : "下書き"}</td><td><div className="tableActions"><button disabled={busy} onClick={() => edit(item)}>編集</button><button disabled={busy} onClick={() => void remove(item)}>削除</button></div></td></tr>)}{visible.length === 0 && <tr><td colSpan={4}>該当する記事はありません。</td></tr>}</tbody></table></div>
      </section>
    </div>}
  </AdminLayout>;
}
