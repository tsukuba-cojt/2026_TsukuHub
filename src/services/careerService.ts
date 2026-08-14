import { supabase } from "../lib/supabase";
import type {
  AdminApplication,
  Application,
  ApplicationInput,
  ApplicationStatus,
  Internship,
  InternshipInput,
  InternshipStatus,
} from "../types/career";

const internshipColumns = "id, company_name, company_logo_url, title, summary, company_description, job_category, location, work_style, is_remote, work_conditions, compensation, description, requirements, preferred_skills, acquirable_skills, selection_process, tags, deadline, status, is_featured, created_by, created_at, updated_at";

export async function listPublishedInternships(universityId: string): Promise<Internship[]> {
  const { data, error } = await supabase
    .from("internships")
    .select(`${internshipColumns}, internship_universities!inner(university_id)`)
    .eq("internship_universities.university_id", universityId)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Internship[];
}

export async function getInternship(id: string, universityId?: string): Promise<Internship | null> {
  let query = supabase
    .from("internships")
    .select(universityId ? `${internshipColumns}, internship_universities!inner(university_id)` : internshipColumns)
    .eq("id", id);
  if (universityId) query = query.eq("internship_universities.university_id", universityId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data as Internship | null;
}

export async function listAdminInternships(): Promise<Internship[]> {
  const [itemsResult, targetsResult] = await Promise.all([
    supabase.from("internships").select(internshipColumns).order("created_at", { ascending: false }),
    supabase.from("internship_universities").select("internship_id, university_id"),
  ]);
  const { data, error } = itemsResult;
  if (error) throw error;
  if (targetsResult.error) throw targetsResult.error;
  return ((data ?? []) as Internship[]).map((item) => ({
    ...item,
    university_ids: (targetsResult.data ?? [])
      .filter((target) => target.internship_id === item.id)
      .map((target) => target.university_id),
  }));
}

async function setInternshipUniversities(id: string, universityIds: string[]) {
  const { error: deleteError } = await supabase
    .from("internship_universities")
    .delete()
    .eq("internship_id", id);
  if (deleteError) throw deleteError;
  if (universityIds.length === 0) return;
  const { error } = await supabase.from("internship_universities").insert(
    universityIds.map((university_id) => ({ internship_id: id, university_id })),
  );
  if (error) throw error;
}

export async function getInternshipTargetUniversityIds(id: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("internship_universities")
    .select("university_id")
    .eq("internship_id", id);
  if (error) throw error;
  return (data ?? []).map((item) => item.university_id);
}

export async function createInternship(input: InternshipInput, universityIds: string[]): Promise<Internship> {
  const { data, error } = await supabase
    .from("internships")
    .insert(input)
    .select(internshipColumns)
    .single();
  if (error) throw error;
  await setInternshipUniversities((data as Internship).id, universityIds);
  return data as Internship;
}

export async function updateInternship(id: string, input: InternshipInput, universityIds: string[]): Promise<Internship> {
  const { data, error } = await supabase
    .from("internships")
    .update(input)
    .eq("id", id)
    .select(internshipColumns)
    .single();
  if (error) throw error;
  await setInternshipUniversities(id, universityIds);
  return data as Internship;
}

export async function updateInternshipStatus(id: string, status: InternshipStatus) {
  const { error } = await supabase.from("internships").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteInternship(id: string) {
  const { error } = await supabase.from("internships").delete().eq("id", id);
  if (error) throw error;
}

export async function createApplication(input: ApplicationInput): Promise<void> {
  const { error } = await supabase.from("applications").insert(input);
  if (error) throw error;
}

export async function listMyApplications(userId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("id, internship_id, user_id, university_id, applicant_name, email, faculty, graduation_year, motivation, skills, portfolio_url, additional_notes, status, created_at, updated_at, internship:internships(id, title, company_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Application[];
}

export async function hasApplied(internshipId: string, userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("internship_id", internshipId)
    .eq("user_id", userId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getProfileDefaults(userId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as Record<string, unknown> | null;
}

export async function listAdminApplications(): Promise<AdminApplication[]> {
  const { data, error } = await supabase.rpc("admin_list_applications");
  if (error) throw error;
  return (data ?? []) as AdminApplication[];
}

export async function getAdminApplication(id: string): Promise<AdminApplication | null> {
  const { data, error } = await supabase.rpc("admin_get_application", { target_id: id });
  if (error) throw error;
  return data as AdminApplication | null;
}

export async function updateAdminApplication(
  id: string,
  status: ApplicationStatus,
  adminNotes: string,
): Promise<void> {
  const { error } = await supabase.rpc("admin_update_application", {
    target_id: id,
    next_status: status,
    next_admin_notes: adminNotes,
  });
  if (error) throw error;
}

export async function uploadCompanyLogo(file: File, userId: string): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("company-logos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("company-logos").getPublicUrl(path).data.publicUrl;
}

export async function removeCompanyLogo(publicUrl: string): Promise<void> {
  const marker = "/company-logos/";
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex < 0) throw new Error("invalid_company_logo_url");
  const path = decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
  const { error } = await supabase.storage.from("company-logos").remove([path]);
  if (error) throw error;
}
