import { describe, expect, it } from "vitest";
import Papa from "papaparse";
import {
  companyApplicationsCsv, emptyCompanyFilters, filterCompanyApplications, isActionDue, toTokyoDateTimeInput, tokyoToday,
} from "./companyRecruiting";
import type { CompanyApplication, CompanyReview } from "../services/companyService";

const review = (input: Partial<CompanyReview> = {}): CompanyReview => ({
  notes: "企業だけのメモ", shortlisted: false, next_action: "", next_action_date: null,
  interview_at: null, interview_url: "", updated_at: "2026-11-15T00:00:00Z", ...input,
});
const application = (id: string, input: Partial<CompanyApplication> = {}): CompanyApplication => ({
  id, internship_id: "job-a", applicant_name: "テスト学生", email: "student@example.com", faculty: "情報学群",
  graduation_year: 2028, motivation: "教育サービスに関心", skills: "React TypeScript", portfolio_url: null,
  additional_notes: null, status: "submitted", created_at: "2026-11-15T00:00:00Z", updated_at: "2026-11-15T00:00:00Z",
  internship: { id: "job-a", title: "エンジニア", company_name: "テスト企業" }, review: null, ...input,
});

describe("company application search and deadlines", () => {
  it("combines search terms across skills, affiliation and motivation with job and year filters", () => {
    const items = [application("match"), application("wrong-year", { graduation_year: 2029 }), application("wrong-job", { internship_id: "job-b" })];
    expect(filterCompanyApplications(items, { ...emptyCompanyFilters, search: "react 情報 教育", job: "job-a", graduationYear: "2028" }, "2026-11-15").map(a => a.id)).toEqual(["match"]);
  });
  it("includes overdue and today's actions, excluding terminal applications", () => {
    const items = [
      application("past", { review: review({ next_action_date: "2026-11-14" }) }),
      application("today", { review: review({ next_action_date: "2026-11-15" }) }),
      application("future", { review: review({ next_action_date: "2026-11-16" }) }),
      application("closed", { status: "accepted", review: review({ next_action_date: "2026-11-14" }) }),
    ];
    expect(filterCompanyApplications(items, { ...emptyCompanyFilters, priority: "due", sort: "action" }, "2026-11-15").map(a => a.id)).toEqual(["past", "today"]);
    expect(isActionDue(application("withdrawn", { status: "withdrawn", review: review({ next_action_date: "2026-11-01" }) }), "2026-11-15")).toBe(false);
  });
  it("keeps undated actions at the end and does not mutate the source array", () => {
    const items = [application("unset"), application("later", { review: review({ next_action_date: "2026-11-20" }) }), application("earlier", { review: review({ next_action_date: "2026-11-16" }) })];
    expect(filterCompanyApplications(items, { ...emptyCompanyFilters, sort: "action" }, "2026-11-15").map(a => a.id)).toEqual(["earlier", "later", "unset"]);
    expect(items[0].id).toBe("unset");
  });
  it("filters favourites and handles missing reviews", () => {
    expect(filterCompanyApplications([application("blank"), application("star", { review: review({ shortlisted: true }) })], { ...emptyCompanyFilters, priority: "shortlisted" }, "2026-11-15").map(a => a.id)).toEqual(["star"]);
  });
  it("uses Japan's date boundary for interview filtering", () => {
    const items = [application("tokyo-today", { review: review({ interview_at: "2026-11-14T15:30:00Z" }) }), application("yesterday", { review: review({ interview_at: "2026-11-14T14:30:00Z" }) })];
    expect(filterCompanyApplications(items, { ...emptyCompanyFilters, priority: "interview" }, "2026-11-15").map(a => a.id)).toEqual(["tokyo-today"]);
    expect(toTokyoDateTimeInput("2026-11-14T15:30:00Z")).toBe("2026-11-15T00:30");
    expect(tokyoToday(new Date("2026-11-14T15:30:00Z"))).toBe("2026-11-15");
  });
});

describe("company CSV export", () => {
  it("preserves Japanese, quoted text and newlines with a UTF-8 BOM", () => {
    const csv = companyApplicationsCsv([application("a", { applicant_name: '学生,"テスト"\n二行目' })]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    const rows = Papa.parse<string[]>(csv).data;
    expect(rows[1][0]).toBe('学生,"テスト"\n二行目');
    expect(rows[1][8]).toBe("2026-11-15 09:00");
    expect(csv).not.toContain("企業だけのメモ");
  });
  it("neutralizes formula injection in every exported text field", () => {
    const csv = companyApplicationsCsv([application("a", {
      applicant_name: '=HYPERLINK("https://example.com")', email: "+SUM(1,2)", faculty: "  @SUM(1)",
      review: review({ next_action: "\t=1+1" }),
    })]);
    const row = Papa.parse<string[]>(csv).data[1];
    for (const index of [0, 1, 2, 9]) expect(row[index].startsWith("'")).toBe(true);
  });
  it("exports the supplied filtered result only, without internal notes", () => {
    const csv = companyApplicationsCsv([application("allowed", { review: review() })]);
    expect(Papa.parse(csv).data.length).toBe(2);
    expect(csv).not.toContain("企業だけのメモ");
  });
});
