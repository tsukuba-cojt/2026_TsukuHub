import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { createNews, deleteNews, listAdminNews, updateNews } from "../../services/newsService";
import { listUniversities } from "../../services/universityService";
import { defaultAdminTargetUniversityIds } from "../../lib/adminUniversityTargets";
import type { NewsItemInput, NewsItemRecord } from "../../types/news";
import type { University } from "../../types/university";

const emptyInput: NewsItemInput = {
  kind: "news",
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

  const load = async () => {
    const [nextItems, nextUniversities] = await Promise.all([listAdminNews(), listUniversities()]);
    setItems(nextItems);
    setUniversities(nextUniversities);
    setTargetIds((current) => current.length ? current : defaultAdminTargetUniversityIds(nextUniversities));
  };
  useEffect(() => {
    void Promise.all([listAdminNews(), listUniversities()])
      .then(([nextItems, nextUniversities]) => {
        setItems(nextItems);
        setUniversities(nextUniversities);
        setTargetIds(defaultAdminTargetUniversityIds(nextUniversities));
      })
      .catch(() => setError("ニュースを取得できませんでした。"));
  }, []);

  const update = <K extends keyof NewsItemInput>(key: K, value: NewsItemInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setEditingId(null); setForm(emptyInput); setTargetIds(defaultAdminTargetUniversityIds(universities)); };
  const edit = (item: NewsItemRecord) => {
    setEditingId(item.id);
    setForm({ kind: item.kind, category: item.category, title: item.title, description: item.description, published_at: item.published_at, status: item.status });
    setTargetIds(item.university_ids ?? []);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!targetIds.length) return setError("掲載対象大学を選択してください。");
    try { if (editingId) await updateNews(editingId, form, targetIds); else await createNews(form, targetIds); await load(); reset(); }
    catch { setError("ニュースを保存できませんでした。"); }
  };
  const visibleItems = items.filter((item) =>
    universityFilter === "all" || item.university_ids?.includes(universityFilter),
  );

  return <AdminLayout title="ニュース・トピック管理"><div className="adminContentManager">
    <form className="careerForm adminCompactForm" onSubmit={(event) => void submit(event)}><div className="adminPanelHeader"><h2>{editingId ? "編集" : "新規登録"}</h2>{editingId && <button type="button" className="adminTextButton" onClick={reset}>キャンセル</button>}</div>
      <div className="formGrid"><label>種別<select value={form.kind} onChange={(event) => update("kind", event.target.value === "topic" ? "topic" : "news")}><option value="news">ニュース</option><option value="topic">トピック</option></select></label><label>カテゴリー<input required value={form.category} onChange={(event) => update("category", event.target.value)} /></label><label>掲載日<input type="date" required value={form.published_at} onChange={(event) => update("published_at", event.target.value)} /></label><label>公開状態<select value={form.status} onChange={(event) => update("status", event.target.value === "published" ? "published" : "draft")}><option value="draft">下書き</option><option value="published">公開</option></select></label></div>
      <label>タイトル<input required value={form.title} onChange={(event) => update("title", event.target.value)} /></label><label>説明<textarea rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
      <fieldset className="adminUniversityTargets"><legend>掲載対象大学</legend>{universities.map((university) => <label className="checkboxLabel" key={university.id}><input type="checkbox" checked={targetIds.includes(university.id)} onChange={(event) => setTargetIds((current) => event.target.checked ? [...current, university.id] : current.filter((id) => id !== university.id))} />{university.name}</label>)}</fieldset>
      {error && <p className="formError">{error}</p>}<button className="careerPrimaryButton">保存</button></form>
    <div><div className="adminFilters"><select aria-label="大学で絞り込む" value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)}><option value="all">すべての大学</option>{universities.map((university) => <option value={university.id} key={university.id}>{university.name}</option>)}</select></div><div className="adminTableWrap"><table className="adminTable"><thead><tr><th>種別</th><th>タイトル</th><th>掲載先</th><th>操作</th></tr></thead><tbody>{visibleItems.map((item) => <tr key={item.id}><td>{item.kind === "news" ? "ニュース" : "トピック"}</td><td><strong>{item.title}</strong><span>{item.category}</span></td><td>{universities.filter((university) => item.university_ids?.includes(university.id)).map((university) => university.short_name).join("、")}</td><td><div className="tableActions"><button onClick={() => edit(item)}>編集</button><button onClick={() => void deleteNews(item.id).then(load)}>削除</button></div></td></tr>)}</tbody></table></div></div>
  </div></AdminLayout>;
}
