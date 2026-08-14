import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { listAdminApplications, listAdminInternships } from "../../services/careerService";
import { listAdminReviewReports } from "../../services/contentService";
import { listUniversities } from "../../services/universityService";
import { applicationStatusLabels, type AdminApplication, type Internship } from "../../types/career";
import type { ReviewReport } from "../../types/content";
import type { University } from "../../types/university";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [universityFilter, setUniversityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([listAdminInternships(), listAdminApplications(), listAdminReviewReports(), listUniversities()])
      .then(([nextJobs, nextApplications, nextReports, nextUniversities]) => {
        setJobs(nextJobs); setApplications(nextApplications); setReports(nextReports); setUniversities(nextUniversities);
      })
      .catch(() => setError("管理データを取得できませんでした。"))
      .finally(() => setLoading(false));
  }, []);

  const visibleJobs = useMemo(() => jobs.filter((item) => universityFilter === "all" || item.university_ids?.includes(universityFilter)), [jobs, universityFilter]);
  const visibleApplications = useMemo(() => applications.filter((item) => universityFilter === "all" || item.university_id === universityFilter), [applications, universityFilter]);
  const visibleReports = useMemo(() => reports.filter((item) => universityFilter === "all" || item.university_id === universityFilter), [reports, universityFilter]);
  const stats = useMemo(() => [
    { label: "公開中の求人", value: visibleJobs.filter((item) => item.status === "published").length },
    { label: "下書き", value: visibleJobs.filter((item) => item.status === "draft").length },
    { label: "応募総数", value: visibleApplications.length },
    { label: "未確認の応募", value: visibleApplications.filter((item) => item.status === "submitted").length },
    { label: "面接中", value: visibleApplications.filter((item) => item.status === "interview").length },
    { label: "未対応の通報", value: visibleReports.filter((item) => item.status === "pending").length },
  ], [visibleApplications, visibleJobs, visibleReports]);

  return <AdminLayout title="ダッシュボード">
    <div className="adminToolbar"><p>大学別・全体の運用状況を確認できます。</p><select aria-label="大学で絞り込む" value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)}><option value="all">すべての大学</option>{universities.map((university) => <option value={university.id} key={university.id}>{university.name}</option>)}</select></div>
    {loading ? <div className="careerState">集計しています...</div> : error ? <div className="careerState isError">{error}</div> : <>
      <section className="adminStats">{stats.map((stat) => <article key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><small>件</small></article>)}</section>
      <div className="adminDashboardGrid">
        <section className="adminPanel"><div className="adminPanelHeader"><h2>最近の応募</h2><Link to="/admin/applications">すべて見る</Link></div>{visibleApplications.slice(0, 5).map((item) => <Link className="adminListRow" to={`/admin/applications/${item.id}`} key={item.id}><div><strong>{item.applicant_name}</strong><span>{item.internship?.title}</span></div><span className={`statusBadge is-${item.status}`}>{applicationStatusLabels[item.status]}</span></Link>)}</section>
        <section className="adminPanel"><div className="adminPanelHeader"><h2>締切が近い求人</h2><Link to="/admin/internships">求人管理</Link></div>{visibleJobs.filter((item) => item.status === "published").sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 5).map((item) => <Link className="adminListRow" to={`/admin/internships/${item.id}/edit`} key={item.id}><div><strong>{item.title}</strong><span>{item.company_name}</span></div><time>{new Intl.DateTimeFormat("ja-JP").format(new Date(item.deadline))}</time></Link>)}</section>
      </div>
    </>}
  </AdminLayout>;
}
