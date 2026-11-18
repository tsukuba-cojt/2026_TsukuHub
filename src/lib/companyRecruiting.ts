import type { CompanyActivity, CompanyApplication } from "../services/companyService";
import { applicationStatusLabels } from "../types/career";

export const tokyoToday = (now = new Date()) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(now);
export const isActiveApplication = (item: CompanyApplication) => !["accepted", "rejected", "withdrawn"].includes(item.status);
export const isActionDue = (item: CompanyApplication, today: string) =>
  isActiveApplication(item) && !!item.review?.next_action_date && item.review.next_action_date <= today;

export function toTokyoDateTimeInput(value: string | null | undefined) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export type CompanyFilters = {
  search: string; job: string; status: string; graduationYear: string;
  priority: "all" | "shortlisted" | "due" | "interview";
  sort: "newest" | "oldest" | "action" | "interview";
};
export const emptyCompanyFilters: CompanyFilters = { search: "", job: "", status: "", graduationYear: "", priority: "all", sort: "newest" };

export function filterCompanyApplications(items: CompanyApplication[], filters: CompanyFilters, today: string) {
  const terms = filters.search.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(item => {
    const searchable = `${item.applicant_name} ${item.email} ${item.faculty} ${item.skills} ${item.motivation} ${item.internship?.title ?? ""}`.toLocaleLowerCase();
    return (!filters.job || item.internship_id === filters.job)
      && (!filters.status || item.status === filters.status)
      && (!filters.graduationYear || String(item.graduation_year) === filters.graduationYear)
      && terms.every(term => searchable.includes(term))
      && (filters.priority !== "shortlisted" || item.review?.shortlisted)
      && (filters.priority !== "due" || isActionDue(item, today))
      && (filters.priority !== "interview" || (isActiveApplication(item) && !!item.review?.interview_at && toTokyoDateTimeInput(item.review.interview_at).slice(0, 10) >= today));
  }).sort((a, b) => {
    if (filters.sort === "action" || filters.sort === "interview") {
      const get = (item: CompanyApplication) => filters.sort === "action" ? item.review?.next_action_date : item.review?.interview_at;
      const delta = (get(a) ? new Date(get(a)!).getTime() : Infinity) - (get(b) ? new Date(get(b)!).getTime() : Infinity);
      if (delta && !Number.isNaN(delta)) return delta;
    }
    const delta = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return (filters.sort === "oldest" ? -delta : delta) || a.id.localeCompare(b.id);
  });
}

export function describeCompanyActivity(event: CompanyActivity) {
  if (event.event_type === "status_changed") {
    return `選考状況を「${event.details.from ? applicationStatusLabels[event.details.from] : ""}」から「${event.details.to ? applicationStatusLabels[event.details.to] : ""}」に変更`;
  }
  const labels: Record<string, string> = { notes: "選考メモ", shortlisted: "お気に入り", next_action: "次の対応", interview: "面接予定" };
  return `${(event.details.changed_fields ?? []).map(key => labels[key] ?? key).join("・")}を更新`;
}

// Quoting alone does not prevent spreadsheet formula execution.
const csvCell = (value: unknown) => {
  let text = String(value ?? "");
  if (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
export function companyApplicationsCsv(items: CompanyApplication[]) {
  const rows: unknown[][] = [["氏名", "メールアドレス", "所属", "卒業予定年", "企業名", "求人名", "選考状況", "お気に入り", "応募日時（日本時間）", "次の対応", "対応期限", "面接予定（日本時間）"]];
  for (const item of items) rows.push([
    item.applicant_name, item.email, item.faculty, item.graduation_year,
    item.internship?.company_name, item.internship?.title, applicationStatusLabels[item.status],
    item.review?.shortlisted ? "あり" : "", toTokyoDateTimeInput(item.created_at).replace("T", " "),
    item.review?.next_action, item.review?.next_action_date, toTokyoDateTimeInput(item.review?.interview_at).replace("T", " "),
  ]);
  return "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n");
}
