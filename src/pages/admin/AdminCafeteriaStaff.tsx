import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";
import { cafeteriaAccountEmail, cafeteriaAccountName } from "../../lib/cafeteriaAccount";
import type { CafeteriaLocation } from "../../services/cafeteriaMenuService";
type Assignment = { id: string; email: string; university_id: string; cafeteria_id: string };
export default function AdminCafeteriaStaff() {
  const [locations, setLocations] = useState<CafeteriaLocation[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    void Promise.all([
      supabase.from("cafeteria_locations").select("university_id, cafeteria_id, name").order("name"),
      supabase.from("cafeteria_staff_access").select("id, email, university_id, cafeteria_id"),
    ]).then(([cafeterias, staff]) => {
      if (cafeterias.error) throw cafeterias.error;
      if (staff.error) throw staff.error;
      setLocations(cafeterias.data ?? []); setAssignments(staff.data ?? []);
      if (cafeterias.data?.[0]) setSelected(`${cafeterias.data[0].university_id}/${cafeterias.data[0].cafeteria_id}`);
    }).catch(() => setError("担当者を取得できませんでした。DB更新と管理者権限をご確認ください。"))
      .finally(() => setLoading(false));
  }, []);
  const add = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    const location = locations.find((item) => `${item.university_id}/${item.cafeteria_id}` === selected);
    if (!location) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const { data, error } = await supabase.from("cafeteria_staff_access").insert({ university_id: location.university_id, cafeteria_id: location.cafeteria_id, email: cafeteriaAccountEmail(email) }).select("id, email, university_id, cafeteria_id").single();
      if (error) throw error;
      setAssignments((current) => [...current, data]); setEmail(""); setMessage("担当者を登録しました。スタッフ用URLを共有してください。");
    } catch { setError("担当者を登録できませんでした。重複やアカウント名をご確認ください。"); }
    finally { setBusy(false); }
  };
  const remove = async (assignment: Assignment) => {
    if (busy || !window.confirm(`${cafeteriaAccountName(assignment.email)} の更新権限を解除しますか？`)) return;
    setBusy(true); setError("");
    try {
      const { error } = await supabase.from("cafeteria_staff_access").delete().eq("id", assignment.id);
      if (error) throw error;
      setAssignments((current) => current.filter((item) => item.id !== assignment.id));
    } catch { setError("権限を解除できませんでした。"); }
    finally { setBusy(false); }
  };
  return <AdminLayout title="学食スタッフ管理"><p>担当者は事前作成したアカウント名とパスワードでログインします。この画面では担当学食の割り当て・解除を行います。</p><p>スタッフ用URL：<a href="/cafeteria-staff">{window.location.origin}/cafeteria-staff</a>（スマホで開いてください）</p>
    {error && <p className="formError" role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {loading ? <p>読み込み中…</p> : <><form className="careerForm adminCompactForm" onSubmit={(event) => void add(event)}><label>担当学食<select required disabled={busy} value={selected} onChange={(event) => setSelected(event.target.value)}>{locations.map((item) => <option key={`${item.university_id}/${item.cafeteria_id}`} value={`${item.university_id}/${item.cafeteria_id}`}>{item.name}</option>)}</select></label><label>事前作成済みのアカウント名<input type="text" autoCapitalize="none" required value={email} disabled={busy} onChange={(event) => setEmail(event.target.value)} /></label><button className="careerPrimaryButton" disabled={busy || !locations.length}>担当者を登録</button></form>
    <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>スタッフ</th><th>担当学食</th><th>操作</th></tr></thead><tbody>{assignments.map((assignment) => <tr key={assignment.id}><td>{cafeteriaAccountName(assignment.email)}</td><td>{locations.find((location) => location.university_id === assignment.university_id && location.cafeteria_id === assignment.cafeteria_id)?.name ?? assignment.cafeteria_id}</td><td><button disabled={busy} onClick={() => void remove(assignment)}>権限を解除</button></td></tr>)}</tbody></table></div></>}
  </AdminLayout>;
}
