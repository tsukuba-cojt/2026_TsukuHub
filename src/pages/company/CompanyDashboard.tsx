import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CalendarDays, Download, Search, Star, Users, Clock3, ArrowUpRight } from "lucide-react";
import CompanyLayout from "../../components/company/CompanyLayout";
import { useAuth } from "../../components/auth/authContextValue";
import {
  companyApplicationsCsv, filterCompanyApplications, isActionDue,
  isActiveApplication, tokyoToday, type CompanyFilters,
} from "../../lib/companyRecruiting";
import { listCompanyApplications, listCompanyJobs, type CompanyApplication, type CompanyJob } from "../../services/companyService";
import { applicationStatusLabels, internshipStatusLabels } from "../../types/career";

const PAGE_SIZE = 20;
const dateFormat = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo" });
const meetingFormat = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });

export default function CompanyDashboard() {
  const { user } = useAuth();
  return <CompanyLayout title="採用ダッシュボード"><DashboardContent key={user?.id} userId={user?.id} /></CompanyLayout>;
}

function DashboardContent({ userId }: { userId?: string }) {
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const filters: CompanyFilters = {
    search: params.get("q") ?? "", job: params.get("job") ?? "", status: params.get("status") ?? "",
    graduationYear: params.get("year") ?? "",
    priority: (["all", "shortlisted", "due", "interview"].includes(params.get("priority") ?? "") ? params.get("priority") : "all") as CompanyFilters["priority"],
    sort: (["newest", "oldest", "action", "interview"].includes(params.get("sort") ?? "") ? params.get("sort") : "newest") as CompanyFilters["sort"],
  };
  const today = tokyoToday(new Date(currentTime));
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    void Promise.all([listCompanyJobs(), listCompanyApplications()]).then(([nextJobs, nextApplications]) => {
      if (active) { setJobs(nextJobs); setApplications(nextApplications); setError(""); }
    }).catch(() => { if (active) setError("応募情報を取得できませんでした。時間をおいて再読み込みしてください。"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, refresh]);
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    setParams(next, { replace: true });
  };
  const quickView = (values: Record<string, string>) => {
    const next = new URLSearchParams(values);
    if (filters.job) next.set("job", filters.job);
    setParams(next);
    document.getElementById("company-applicants")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const visible = filterCompanyApplications(applications, filters, today);
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const requestedPage = Number(params.get("page") ?? 1);
  const page = Number.isFinite(requestedPage) ? Math.min(pages, Math.max(1, Math.floor(requestedPage))) : 1;
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const years = [...new Set(applications.map(a => a.graduation_year))].sort();
  const jobApplications = applications.filter(a => !filters.job || a.internship_id === filters.job);
  const scheduled = jobApplications.filter(a => isActiveApplication(a) && a.review?.interview_at && new Date(a.review.interview_at).getTime() >= currentTime)
    .sort((a, b) => new Date(a.review!.interview_at!).getTime() - new Date(b.review!.interview_at!).getTime()).slice(0, 4);
  const due = jobApplications.filter(a => isActionDue(a, today));
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([companyApplicationsCsv(visible)], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url; link.download = `応募者一覧_${today}.csv`;
    document.body.appendChild(link); link.click(); link.remove();
    // Allow the browser to consume the object URL before releasing it.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const detailLink = (item: CompanyApplication) => <Link className="companyDetailLink" to={`/company/applications/${item.id}`} state={{ from: location.pathname + location.search }} aria-label={`${item.applicant_name}さんの応募詳細`}>詳細を見る<ArrowUpRight size={14} aria-hidden="true" /></Link>;

  return <>
    <div className="companyIntro"><p>応募の確認から、次のアクションまで。</p><button type="button" disabled={loading} onClick={() => { setLoading(true); setRefresh(n => n + 1); }}>最新情報を読み込む</button></div>
    {loading ? <div className="careerState">読み込んでいます...</div> : error ? <p className="formError" role="alert">{error}</p> : !jobs.length ? <section className="adminPanel"><h2>担当する求人がまだありません</h2><p>運営に担当者のメールアドレスと対象求人の登録をご依頼ください。</p></section> : <>
      <div className="companyStats companyInteractiveStats">
        <button type="button" onClick={() => quickView({})}><Users aria-hidden="true" /><span>応募総数</span><strong>{jobApplications.length}<small>件</small></strong></button>
        <button type="button" onClick={() => quickView({ status: "submitted" })}><Search aria-hidden="true" /><span>未確認の応募</span><strong>{jobApplications.filter(a => a.status === "submitted").length}<small>件</small></strong></button>
        <button type="button" className={due.length ? "companyStatAttention" : ""} onClick={() => quickView({ priority: "due", sort: "action" })}><Clock3 aria-hidden="true" /><span>本日までの対応</span><strong>{due.length}<small>件</small></strong></button>
        <button type="button" onClick={() => quickView({ priority: "shortlisted" })}><Star aria-hidden="true" /><span>お気に入り</span><strong>{jobApplications.filter(a => a.review?.shortlisted).length}<small>件</small></strong></button>
      </div>

      <div className="companyOverviewGrid">
        <section className="adminPanel"><div className="companyPanelHeading"><h2>選考状況</h2><span className="companyHelp">{filters.job ? "選択中の求人" : "全担当求人"}</span></div><div className="companyPipeline">{Object.entries(applicationStatusLabels).map(([value, label]) => {
          const count = jobApplications.filter(a => a.status === value).length;
          return <button key={value} type="button" onClick={() => quickView({ status: value })}><span className={`statusBadge is-${value}`}>{label}</span><strong>{count}</strong><span className="companyPipelineTrack"><span style={{ width: `${jobApplications.length ? count / jobApplications.length * 100 : 0}%` }} /></span></button>;
        })}</div></section>
        <section className="adminPanel"><div className="companyPanelHeading"><h2><CalendarDays size={18} aria-hidden="true" />これからの面接</h2><button type="button" onClick={() => quickView({ priority: "interview", sort: "interview" })}>一覧</button></div>
          {!scheduled.length ? <p className="companyEmptyNote">予定はありません。応募詳細から面接日時を登録できます。</p> : <ul className="companySchedule">{scheduled.map(a => <li key={a.id}><time dateTime={a.review!.interview_at!}>{meetingFormat.format(new Date(a.review!.interview_at!))}</time><div><strong>{a.applicant_name}さん</strong><span>{a.internship?.title}</span></div>{detailLink(a)}</li>)}</ul>}
        </section>
      </div>

      <section className="adminPanel" id="company-applicants"><div className="companyPanelHeading"><div><span className="companyEyebrow">CANDIDATES</span><h2>応募者一覧</h2></div><button type="button" disabled={!visible.length} onClick={exportCsv}><Download size={16} aria-hidden="true" />CSVを出力</button></div>
        <div className="companyFilterTabs" aria-label="応募者の表示条件">{[["all", "すべて"], ["shortlisted", "お気に入り"], ["due", "本日までの対応"], ["interview", "本日以降の面接"]].map(([value, label]) => <button key={value} type="button" aria-pressed={filters.priority === value} onClick={() => setFilter("priority", value === "all" ? "" : value)}>{label}</button>)}</div>
        <div className="companyFilters">
          <label>キーワード<input type="search" placeholder="氏名・所属・スキルなど（複数語可）" value={filters.search} onChange={e => setFilter("q", e.target.value)} /></label>
          <label>求人<select value={filters.job} onChange={e => setFilter("job", e.target.value)}><option value="">すべての求人</option>{jobs.map(j => <option key={j.id} value={j.id}>{j.company_name} / {j.title}</option>)}</select></label>
          <label>選考状況<select value={filters.status} onChange={e => setFilter("status", e.target.value)}><option value="">すべての状況</option>{Object.entries(applicationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>卒業予定年<select value={filters.graduationYear} onChange={e => setFilter("year", e.target.value)}><option value="">すべての卒業年</option>{years.map(year => <option key={year} value={year}>{year}年</option>)}</select></label>
          <label>並び順<select value={filters.sort} onChange={e => setFilter("sort", e.target.value)}><option value="newest">応募が新しい順</option><option value="oldest">応募が古い順</option><option value="action">対応期限が近い順</option><option value="interview">面接日時が近い順</option></select></label>
          <div className="companyFilterReset"><button type="button" onClick={() => setParams({})}>条件をリセット</button></div>
        </div>
        <div className="companyPanelHeading"><p aria-live="polite">{visible.length}件{visible.length > PAGE_SIZE && `中 ${(page - 1) * PAGE_SIZE + 1}〜${Math.min(page * PAGE_SIZE, visible.length)}件を表示`}</p><span className="companyHelp">CSVは絞り込み後の全件を出力します</span></div>
        {!visible.length ? <div className="careerState">{applications.length ? "条件に一致する応募はありません。条件を変えてお試しください。" : "まだ応募はありません。応募が届くとここに表示されます。"}</div> : <div className="adminTableWrap"><table className="adminTable companyApplicantTable"><thead><tr><th>応募者</th><th>所属・卒業予定</th><th>応募先</th><th>選考状況</th><th>次の対応・面接</th><th>応募日</th><th>詳細</th></tr></thead><tbody>{pageItems.map(a => <tr key={a.id}>
          <td><strong>{a.review?.shortlisted && <Star size={13} className="companyStar" aria-label="お気に入り" />}{a.applicant_name}</strong><small className="companySecondary">{a.email}</small></td>
          <td>{a.faculty}<small className="companySecondary">{a.graduation_year}年卒業予定</small></td><td>{a.internship?.title}<small className="companySecondary">{a.internship?.company_name}</small></td>
          <td><span className={`statusBadge is-${a.status}`}>{applicationStatusLabels[a.status]}</span></td>
          <td><span>{a.review?.next_action || "未設定"}</span>{a.review?.next_action_date && <small className={isActionDue(a, today) ? "companyDue" : "companySecondary"}>期限：{a.review.next_action_date}{isActionDue(a, today) ? "（要対応）" : ""}</small>}{a.review?.interview_at && <small className="companySecondary">面接：{meetingFormat.format(new Date(a.review.interview_at))}</small>}</td>
          <td>{dateFormat.format(new Date(a.created_at))}</td><td>{detailLink(a)}</td>
        </tr>)}</tbody></table></div>}
        {pages > 1 && <nav className="companyPagination" aria-label="応募一覧のページ切り替え"><button type="button" disabled={page <= 1} onClick={() => { const next = new URLSearchParams(params); next.set("page", String(page - 1)); setParams(next); }}>前へ</button><span>{page} / {pages}ページ</span><button type="button" disabled={page >= pages} onClick={() => { const next = new URLSearchParams(params); next.set("page", String(page + 1)); setParams(next); }}>次へ</button></nav>}
      </section>

      <section className="adminPanel"><div className="companyPanelHeading"><h2>求人別の応募状況</h2><span className="companyHelp">担当求人 {jobs.length}件</span></div><div className="companyJobs">{jobs.map(j => {
        const items = applications.filter(a => a.internship_id === j.id);
        return <article key={j.id}><span className="companySecondary">{j.company_name} · {internshipStatusLabels[j.status]}</span><h3>{j.title}</h3><div className="companyJobCounts"><span>応募<strong>{items.length}</strong></span><span>未確認<strong>{items.filter(a => a.status === "submitted").length}</strong></span><span>選考中<strong>{items.filter(a => ["reviewing", "interview"].includes(a.status)).length}</strong></span><span>合格<strong>{items.filter(a => a.status === "accepted").length}</strong></span></div><button type="button" onClick={() => { setParams({ job: j.id }); document.getElementById("company-applicants")?.scrollIntoView({ behavior: "smooth" }); }}>この求人の応募を確認</button></article>;
      })}</div></section>
    </>}
  </>;
}
