import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  addUniversityEmailDomain,
  createUniversity,
  disableUniversityEmailDomain,
  listUniversitiesWithSettings,
  setUniversityFeature,
  updateUniversity,
} from "../../services/universityService";
import {
  universityFeatureKeys,
  universityFeatureLabels,
  type UniversityWithSettings,
} from "../../types/university";

export default function AdminUniversities() {
  const [items, setItems] = useState<UniversityWithSettings[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [domain, setDomain] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const next = await listUniversitiesWithSettings();
    setItems(next);
    setSelectedId((current) => current || next[0]?.id || "");
  };

  useEffect(() => {
    void listUniversitiesWithSettings()
      .then((next) => {
        setItems(next);
        setSelectedId(next[0]?.id || "");
      })
      .catch(() => setError("大学設定を取得できませんでした。"));
  }, []);

  const selected = items.find((item) => item.id === selectedId) ?? null;

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    await updateUniversity(selected.id, {
      name: String(form.get("name") ?? ""),
      short_name: String(form.get("short_name") ?? ""),
      tagline: String(form.get("tagline") ?? ""),
      description: String(form.get("description") ?? ""),
      status: form.get("status") === "suspended" ? "suspended" : "active",
      signup_enabled: form.get("signup_enabled") === "on",
    });
    setMessage("大学設定を保存しました。");
    await load();
  };

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const created = await createUniversity({
      slug: String(form.get("slug") ?? "").trim().toLowerCase(),
      name: String(form.get("name") ?? ""),
      short_name: String(form.get("short_name") ?? ""),
      tagline: String(form.get("tagline") ?? ""),
      description: String(form.get("description") ?? ""),
    });
    setCreating(false);
    await load();
    setSelectedId(created.id);
  };

  return (
    <AdminLayout title="大学管理">
      {message && <p className="adminNotice">{message}</p>}
      {error && <p className="careerState isError">{error}</p>}
      <div className="adminUniversityLayout">
        <aside className="adminPanel">
          <div className="adminPanelHeader"><h2>大学</h2><button className="adminTextButton" onClick={() => setCreating(true)}>+追加</button></div>
          {items.map((item) => <button className={`adminUniversityItem${item.id === selectedId ? " isActive" : ""}`} key={item.id} onClick={() => { setCreating(false); setSelectedId(item.id); }}><strong>{item.name}</strong><span>/{item.slug} · {item.status === "active" ? "公開中" : "停止中"}</span></button>)}
        </aside>

        {creating ? (
          <form className="adminPanel adminCompactForm" onSubmit={(event) => void create(event)}>
            <h2>大学を追加</h2>
            <label>URLスラッグ<input name="slug" pattern="[a-z][a-z0-9-]*" required placeholder="waseda" /></label>
            <label>正式名<input name="name" required /></label>
            <label>短縮名<input name="short_name" required /></label>
            <label>キャッチコピー<input name="tagline" required /></label>
            <label>説明<textarea name="description" required rows={4} /></label>
            <button className="careerPrimaryButton">追加する</button>
          </form>
        ) : selected ? (
          <div className="adminContentManager">
            <form className="adminPanel adminCompactForm" key={selected.id} onSubmit={(event) => void save(event)}>
              <h2>{selected.name}</h2>
              <label>URLスラッグ<input value={selected.slug} disabled /><small>作成後は変更できません</small></label>
              <label>正式名<input name="name" defaultValue={selected.name} required /></label>
              <label>短縮名<input name="short_name" defaultValue={selected.short_name} required /></label>
              <label>キャッチコピー<input name="tagline" defaultValue={selected.tagline} required /></label>
              <label>説明<textarea name="description" defaultValue={selected.description} rows={4} required /></label>
              <label>公開状態<select name="status" defaultValue={selected.status}><option value="active">公開中</option><option value="suspended">停止中</option></select></label>
              <label className="adminCheckLabel"><input type="checkbox" name="signup_enabled" defaultChecked={selected.signup_enabled} />一般の新規登録を受け付ける</label>
              <button className="careerPrimaryButton">設定を保存</button>
            </form>

            <section className="adminPanel">
              <h2>機能の公開状態</h2>
              <div className="adminFeatureList">
                {universityFeatureKeys.map((key) => <label key={key}><span>{universityFeatureLabels[key]}</span><select value={selected.features[key]} onChange={(event) => void setUniversityFeature(selected.id, key, event.target.value === "enabled" ? "enabled" : "coming_soon").then(load)}><option value="enabled">公開</option><option value="coming_soon">準備中</option></select></label>)}
              </div>
            </section>

            <section className="adminPanel">
              <h2>許可メールドメイン</h2>
              <div className="adminDomainList">{selected.emailDomains.map((item) => <div key={item.id}><code>@{item.domain}</code><button onClick={() => void disableUniversityEmailDomain(item.id).then(load)}>無効化</button></div>)}</div>
              <form className="adminInlineForm" onSubmit={(event) => { event.preventDefault(); void addUniversityEmailDomain(selected.id, domain).then(() => { setDomain(""); return load(); }); }}><input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="example.ac.jp" required /><button className="careerPrimaryButton">追加</button></form>
            </section>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
