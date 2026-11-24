import { supabase } from "../lib/supabase";
import type { Application, ApplicationStatus, InternshipStatus } from "../types/career";

export type CompanyJob = { id: string; title: string; company_name: string; status: InternshipStatus };
export type CompanyReview = {
  notes: string;
  shortlisted: boolean;
  next_action: string;
  next_action_date: string | null;
  interview_at: string | null;
  interview_url: string;
  updated_at: string;
};
export type CompanyReviewInput = Omit<CompanyReview, "updated_at">;
export type CompanyActivity = {
  id: string;
  event_type: "status_changed" | "review_updated";
  details: { from?: ApplicationStatus; to?: ApplicationStatus; changed_fields?: string[] };
  actor_email: string;
  created_at: string;
};
export type CompanyApplication = Omit<Application, "user_id" | "university_id"> & { review: CompanyReview | null };
export async function listCompanyJobs(): Promise<CompanyJob[]> {
  const { data, error } = await supabase.rpc("company_list_jobs");
  if (error) throw error;
  return data ?? [];
}
export async function listCompanyApplications(id?: string): Promise<CompanyApplication[]> {
  const { data, error } = await supabase.rpc("company_list_applications", { target_id: id ?? null });
  if (error) throw error;
  return data ?? [];
}
export async function updateCompanyApplication(id: string, status: ApplicationStatus) {
  const { error } = await supabase.rpc("company_update_application", { target_id: id, next_status: status });
  if (error) throw error;
}

export async function saveCompanyReview(id: string, input: CompanyReviewInput, expectedUpdatedAt: string | null): Promise<CompanyReview> {
  const { data, error } = await supabase.rpc("company_save_application_review", {
    target_id: id, next_notes: input.notes, next_shortlisted: input.shortlisted,
    next_action: input.next_action, next_action_date: input.next_action_date,
    next_interview_at: input.interview_at, next_interview_url: input.interview_url,
    expected_updated_at: expectedUpdatedAt,
  });
  if (error) throw error;
  return data;
}

export async function listCompanyActivity(id: string): Promise<CompanyActivity[]> {
  const { data, error } = await supabase.rpc("company_list_application_activity", { target_id: id });
  if (error) throw error;
  return data ?? [];
}
