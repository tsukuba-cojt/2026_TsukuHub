export type InternshipStatus = "draft" | "published" | "closed";
export type ApplicationStatus =
  | "submitted"
  | "reviewing"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type Internship = {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  title: string;
  summary: string;
  company_description: string;
  job_category: string;
  location: string;
  work_style: string;
  is_remote: boolean;
  work_conditions: string;
  compensation: string;
  description: string;
  requirements: string;
  preferred_skills: string;
  acquirable_skills: string;
  selection_process: string;
  tags: string[];
  deadline: string;
  status: InternshipStatus;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type InternshipInput = Omit<
  Internship,
  "id" | "created_by" | "created_at" | "updated_at"
>;

export type ApplicationInput = {
  internship_id: string;
  user_id: string;
  applicant_name: string;
  email: string;
  faculty: string;
  graduation_year: number;
  motivation: string;
  skills: string;
  portfolio_url: string | null;
  additional_notes: string | null;
};

export type Application = ApplicationInput & {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  internship?: Pick<Internship, "id" | "title" | "company_name"> | null;
};

export type AdminApplication = Application & { admin_notes: string | null };

export const internshipStatusLabels: Record<InternshipStatus, string> = {
  draft: "下書き",
  published: "公開中",
  closed: "募集終了",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: "応募済み",
  reviewing: "確認中",
  interview: "面接",
  accepted: "合格",
  rejected: "不合格",
  withdrawn: "辞退",
};
