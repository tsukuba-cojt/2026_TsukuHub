export type PublishStatus = "draft" | "published";

export type CareerArticleRecord = {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  published_at: string;
  read_minutes: number;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
  source_type?: "internal" | "external";
  external_url?: string | null;
  university_ids?: string[];
};

export type CareerArticleInput = Omit<CareerArticleRecord, "id" | "created_at" | "updated_at">;

export type AlumniStoryRecord = {
  id: string;
  university_id: string;
  graduation_year: number;
  faculty: string;
  destination: string;
  job_role: string;
  title: string;
  summary: string;
  tags: string[];
  started_at: string;
  target_industries: string;
  challenge: string;
  actions: string;
  advice: string;
  current_work: string;
  cover_image_url: string | null;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
};

export type AlumniStoryInput = Omit<AlumniStoryRecord, "id" | "created_at" | "updated_at">;

export type ClassAnnouncementRecord = {
  id: string;
  university_id: string;
  category: string;
  title: string;
  content: string;
  published_at: string;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
};

export type ClassAnnouncementInput = Omit<ClassAnnouncementRecord, "id" | "created_at" | "updated_at">;

export type ReviewReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export type ReviewReport = {
  id: string;
  university_id: string;
  review_id: string;
  course_code: string;
  review_snapshot: string;
  reporter_id: string;
  reason: string;
  status: ReviewReportStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export const publishStatusLabels: Record<PublishStatus, string> = {
  draft: "下書き",
  published: "公開中",
};

export const reviewReportStatusLabels: Record<ReviewReportStatus, string> = {
  pending: "未対応",
  reviewing: "確認中",
  resolved: "対応済み",
  dismissed: "問題なし",
};
