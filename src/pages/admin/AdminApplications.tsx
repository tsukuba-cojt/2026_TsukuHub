import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { listAdminApplications } from "../../services/careerService";
import { listUniversities } from "../../services/universityService";
import { applicationStatusLabels, type AdminApplication, type ApplicationStatus } from "../../types/career";
import type { University } from "../../types/university";

const filterOptions: Array<["all" | ApplicationStatus, string]> = [
  ["all", "すべて"], ["submitted", "応募済み"], ["reviewing", "確認中"],
  ["interview", "面接"], ["accepted", "合格"], ["rejected", "不合格"], ["withdrawn", "辞退"],
];

export default function AdminApplications() {
  const [items, setItems] = useState<AdminApplication[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([listAdminApplications(), listUniversities()])
      .then(([nextItems, nextUniversities]) => { setItems(nextItems); setUniversities(nextUniversities); })
      .catch(() => setError("応募情報を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, []);

  const universityItems = useMemo(
    () => items.filter((item) => universityFilter === "all" || item.university_id === universityFilter),
    [items, universityFilter],
  );
  const visible = useMemo(
    () => universityItems.filter((item) => filter === "all" || item.status === filter),
    [filter, universityItems],
  );
  const universityName = (id: string) => universities.find((item) => item.id === id)?.short_name ?? "-";

  return <AdminLayout title="応募者管理">
    <div className="adminToolbar"><p>応募内容の確認と選考ステータスの管理を行います。</p><select aria-label="大学で絞り込む" value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)}><option value="all">すべての大学</option>{universities.map((university) => <option value={university.id} key={university.id}>{university.name}</option>)}</select></div>
    <div className="adminFilters">{filterOptions.map(([value, label]) => <button className={filter === value ? "isActive" : ""} onClick={() => setFilter(value)} key={value}>{label}<span>{value === "all" ? universityItems.length : universityItems.filter((item) => item.status === value).length}</span></button>)}</div>
    {loading ? <div className="careerState">読み込んでいます...</div> : error ? <div className="careerState isError">{error}</div> : visible.length === 0 ? <div className="careerState">該当する応募はありません。</div> : <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>大学</th><th>応募者</th><th>応募先求人</th><th>企業名</th><th>応募日</th><th>卒業予定年</th><th>ステータス</th><th></th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td>{universityName(item.university_id)}</td><td><strong>{item.applicant_name}</strong></td><td>{item.internship?.title}</td><td>{item.internship?.company_name}</td><td>{new Intl.DateTimeFormat("ja-JP").format(new Date(item.created_at))}</td><td>{item.graduation_year}</td><td><span className={`statusBadge is-${item.status}`}>{applicationStatusLabels[item.status]}</span></td><td><Link to={`/admin/applications/${item.id}`}>詳細</Link></td></tr>)}</tbody></table></div>}
  </AdminLayout>;
}
