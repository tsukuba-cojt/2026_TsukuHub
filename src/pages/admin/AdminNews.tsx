import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ArticleNewsPicker from "../../components/admin/ArticleNewsPicker";
import { createNews, deleteNews, listAdminNews, updateNews } from "../../services/newsService";
import { listUniversities } from "../../services/universityService";
import type { NewsItemInput, NewsItemRecord } from "../../types/news";
import type { University } from "../../types/university";

const emptyInput: NewsItemInput = {
  kind: "topic",
  category: "お知らせ",
  title: "",
  description: "",
  published_at: new Date().toISOString().slice(0, 10),
  status: "draft",
};

export default function AdminNews() {
  const [items, setItems] = useState<NewsItemRecord[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState<NewsItemInput>(emptyInput);
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [universityFilter, setUniversityFilter] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [nextItems, nextUniversities] = await Promise.all([listAdminNews(), listUniversities()]);
    setItems(nextItems);
    setUniversities(nextUniversities);
    setTargetIds((current) => current.length ? current : nextUniversities.filter((item) => item.slug === "tsukuba").map((item) => item.id));
  };
  useEffect(() => {
    void Promise.all([listAdminNews(), listUniversities()])
      .then(([nextItems, nextUniversities]) => {
        setItems(nextItems);
        setUniversities(nextUniversities);
        setTargetIds(nextUniversities.filter((item) => item.slug === "tsukuba").map((item) => item.id));
      })
      .catch(() => setError("ニュースを取得できませんでした。"));
  }, []);

  const update = <K extends keyof NewsItemInput>(key: K, value: NewsItemInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setEditingId(null); setForm(emptyInput); setTargetIds(universities.filter((item) => item.slug === "tsukuba").map((item) => item.id)); };
  const edit = (item: NewsItemRecord) => {
    setEditingId(item.id);
    setForm({ kind: item.kind, category: item.category, title: item.title, description: item.description, published_at: item.published_at, status: item.status, source_path: item.source_path });
    setTargetIds(item.university_ids ?? []);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    if (busy) return;
    if (!targetIds.length) return setError("掲載対象大学を選択してください。");
    if (!form.title.trim() || !form.category.trim()) return setError("タイトルとカテゴリーを入力してください。");
    setBusy(true);
    try { if (editingId) await updateNews(editingId, form, targetIds); else await createNews(form, targetIds); await load(); reset(); setMessage("保存しました。"); }
    catch { setError("ニュースを保存できませんでした。"); }
    finally { setBusy(false); }
  };
  const remove = async (item: NewsItemRecord) => {
    if (busy || !window.confirm(`「${item.title}」を削除しますか？`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await deleteNews(item.id);
      if (editingId === item.id) reset();
      await load();
      setMessage("削除しました。");
    } catch { setError("削除できませんでした。もう一度お試しください。"); }
    finally { setBusy(false); }
  };
  const visibleItems = items.filter((item) =>
    item.kind === "topic" && (universityFilter === "all" || item.university_ids?.includes(universityFilter)),
  );

  return <AdminLayout title="注目トピック管理"><p>注目トピックに掲載する記事を選択・編集できます。ホーム画面の「注目の長期インターン」は「求人管理」から編集してください。「公開」にして保存すると、選択した大学に掲載日の新しい順で表示されます。</p>{message && <p role="status">{message}</p>}<ArticleNewsPicker items={items} onReload={load} /><div className="adminContentManager">
    <form className="careerForm adminCompactForm" onSubmit={(event) => void submit(event)}><div className="adminPanelHeader"><h2>{editingId ? "編集" : "新規登録"}</h2>{editingId && <button type="button" className="adminTextButton" onClick={reset}>キャンセル</button>}</div>
      <div className="formGrid"><label>掲載先<input value="注目トピック" readOnly /></label><label>カテゴリー<input required value={form.category} onChange={(event) => update("category", event.target.value)} /></label><label>掲載日<input type="date" required value={form.published_at} onChange={(event) => update("published_at", event.target.value)} /></label><label>公開状態<select value={form.status} onChange={(event) => update("status", event.target.value === "published" ? "published" : "draft")}><option value="draft">下書き</option><option value="published">公開</option></select></label></div>
      <label>タイトル<input required value={form.title} onChange={(event) => update("title", event.target.value)} /></label><label>記事本文（Markdown対応）<textarea rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
      <fieldset className="adminUniversityTargets"><legend>掲載対象大学</legend>{universities.map((university) => <label className="checkboxLabel" key={university.id}><input type="checkbox" checked={targetIds.includes(university.id)} onChange={(event) => setTargetIds((current) => event.target.checked ? [...current, university.id] : current.filter((id) => id !== university.id))} />{university.name}</label>)}</fieldset>
      {error && <p role="alert" className="formError">{error}</p>}<button disabled={busy} className="careerPrimaryButton">{busy ? "保存中…" : "保存"}</button></form>
    <div><div className="adminFilters"><select aria-label="大学で絞り込む" value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)}><option value="all">すべての大学</option>{universities.map((university) => <option value={university.id} key={university.id}>{university.name}</option>)}</select></div><div className="adminTableWrap"><table className="adminTable"><thead><tr><th>表示先</th><th>タイトル</th><th>掲載先</th><th>掲載日・公開状態</th><th>操作</th></tr></thead><tbody>{visibleItems.map((item) => <tr key={item.id}><td>{"注目トピック"}</td><td><strong>{item.title}</strong><span>{item.category}</span></td><td>{universities.filter((university) => item.university_ids?.includes(university.id)).map((university) => university.short_name).join("、")}</td><td><time dateTime={item.published_at}>{item.published_at.replaceAll("-", "/")}</time><span>{item.status === "published" ? "公開中" : "下書き"}</span></td><td><div className="tableActions"><button disabled={busy} onClick={() => edit(item)}>編集</button><button disabled={busy} onClick={() => void remove(item)}>削除</button></div></td></tr>)}</tbody></table></div></div>
  </div></AdminLayout>;
}
