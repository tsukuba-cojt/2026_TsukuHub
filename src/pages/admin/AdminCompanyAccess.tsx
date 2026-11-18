import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";
import { listAdminInternships } from "../../services/careerService";
import type { Internship } from "../../types/career";

type Access = { internship_id: string; email: string };
export default function AdminCompanyAccess() {
  const [jobs, setJobs] = useState<Internship[]>([]);
  const [access, setAccess] = useState<Access[]>([]);
  const [job, setJob] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    void Promise.all([listAdminInternships(), supabase.from("company_recruiter_access").select("internship_id, email").order("created_at", { ascending: false })]).then(([items, result]) => {
      if (result.error) throw result.error;
      setJobs(items); setAccess(result.data ?? []);
    }).catch(() => setError("担当者情報を取得できませんでした。")) .finally(() => setLoading(false));
  }, []);
  const add = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const entry = { internship_id: job, email: email.trim().toLowerCase() };
    try {
      const { error } = await supabase.from("company_recruiter_access").insert(entry);
      if (error) throw error;
      setAccess(current => [entry, ...current]); setEmail("");
      setMessage("担当者を登録しました。担当者には /company/login からアカウント登録・ログインするようご案内ください。");
    } catch { setError("登録できませんでした。すでに登録されていないか確認してください。"); }
    finally { setBusy(false); }
  };
  const remove = async (entry: Access) => {
    if (!window.confirm(`${entry.email} のこの求人への閲覧・選考管理権限を解除しますか？`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const { error } = await supabase.from("company_recruiter_access").delete().eq("internship_id", entry.internship_id).eq("email", entry.email);
      if (error) throw error;
      setAccess(current => current.filter(a => a.internship_id !== entry.internship_id || a.email !== entry.email));
      setMessage("担当者の権限を解除しました。");
    } catch { setError("権限を解除できませんでした。"); }
    finally { setBusy(false); }
  };
  return <AdminLayout title="企業担当者管理"><p>求人ごとに、応募情報を閲覧できる担当者を登録します。メール通知先とは別の設定です。</p><p>企業向けログインURL：<a href="/company/login">/company/login</a></p>
    {error && <p className="formError" role="alert">{error}</p>}{message && <p className="formSuccess" role="status">{message}</p>}
    {loading ? <div className="careerState">読み込んでいます...</div> : <><form className="adminPanel careerForm" onSubmit={add}><h2>担当者を追加</h2><label>対象求人<select required value={job} onChange={e => setJob(e.target.value)}><option value="">求人を選択</option>{jobs.map(j => <option key={j.id} value={j.id}>{j.company_name} / {j.title}</option>)}</select></label><label>担当者のメールアドレス<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><p>登録した担当者は、この求人へのすべての応募を閲覧し、選考状況を更新できます。登録通知メールは自動送信されません。</p><button className="careerPrimaryButton" disabled={busy || !jobs.length}>担当者を登録</button></form>
    <section className="adminPanel"><h2>登録済みの担当者</h2>{!access.length ? <p>担当者は登録されていません。</p> : <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>企業・求人</th><th>担当者メール</th><th>操作</th></tr></thead><tbody>{access.map(a => { const j = jobs.find(j => j.id === a.internship_id); return <tr key={`${a.internship_id}-${a.email}`}><td>{j?.company_name}<br />{j?.title ?? "求人情報なし"}</td><td>{a.email}</td><td><button type="button" disabled={busy} onClick={() => void remove(a)}>権限を解除</button></td></tr>; })}</tbody></table></div>}</section></>}
  </AdminLayout>;
}
