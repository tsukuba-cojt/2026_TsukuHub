import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  deleteInternship,
  listAdminApplications,
  listAdminInternships,
  updateInternshipStatus,
} from "../../services/careerService";
import {
  internshipStatusLabels,
  type AdminApplication,
  type Internship,
  type InternshipStatus,
} from "../../types/career";
import { listUniversities } from "../../services/universityService";
import type { University } from "../../types/university";

export default function AdminInternships() {
  const location = useLocation();
  const [items, setItems] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [universityFilter, setUniversityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(() => (location.state as { message?: string } | null)?.message ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([listAdminInternships(), listAdminApplications(), listUniversities()])
      .then(([jobs, nextApplications, nextUniversities]) => {
        setItems(jobs);
        setApplications(nextApplications);
        setUniversities(nextUniversities);
      })
      .catch(() => setError("求人を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id: string, status: InternshipStatus) => {
    setError("");
    try {
      await updateInternshipStatus(id, status);
      setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      setMessage("公開状態を更新しました。");
    } catch {
      setError("公開状態を更新できませんでした。");
    }
  };

  const remove = async (item: Internship) => {
    if (!window.confirm(`「${item.title}」を削除しますか？応募情報も削除され、元に戻せません。`)) return;
    try {
      await deleteInternship(item.id);
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      setApplications((current) => current.filter((application) => application.internship_id !== item.id));
      setMessage("求人を削除しました。");
    } catch {
      setError("求人を削除できませんでした。");
    }
  };

  const visibleItems = items.filter((item) =>
    universityFilter === "all" || item.university_ids?.includes(universityFilter),
  );
  const targetNames = (item: Internship) => universities
    .filter((university) => item.university_ids?.includes(university.id))
    .map((university) => university.short_name)
    .join("、");

  return <AdminLayout title="求人管理">
    <div className="adminToolbar"><p>求人の登録、編集、公開状態の変更を行います。</p><select aria-label="大学で絞り込む" value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)}><option value="all">すべての大学</option>{universities.map((university) => <option value={university.id} key={university.id}>{university.name}</option>)}</select><Link className="careerPrimaryButton" to="/admin/internships/new">新しい求人を登録</Link></div>
    {message && <p className="formSuccess" role="status">{message}</p>}
    {error && <p className="formError" role="alert">{error}</p>}
    {loading ? <div className="careerState">読み込んでいます...</div> : visibleItems.length === 0 ? <div className="careerState">登録された求人はありません。</div> :
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>求人</th><th>掲載先</th><th>職種</th><th>公開状態</th><th>応募件数</th><th>締切</th><th>作成日</th><th>操作</th></tr></thead><tbody>
        {visibleItems.map((item) => <tr key={item.id}>
          <td><strong>{item.title}</strong><span>{item.company_name}</span></td>
          <td>{targetNames(item)}</td>
          <td>{item.job_category}</td>
          <td><select aria-label={`${item.title}の公開状態`} value={item.status} onChange={(event) => void changeStatus(item.id, event.target.value as InternshipStatus)}>{Object.entries(internshipStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td>
          <td>{applications.filter((application) => application.internship_id === item.id).length}件</td>
          <td>{new Intl.DateTimeFormat("ja-JP").format(new Date(item.deadline))}</td>
          <td>{new Intl.DateTimeFormat("ja-JP").format(new Date(item.created_at))}</td>
          <td><div className="tableActions"><Link to={`/admin/internships/${item.id}/edit`}>編集</Link><button onClick={() => void remove(item)}>削除</button></div></td>
        </tr>)}
      </tbody></table></div>}
  </AdminLayout>;
}
