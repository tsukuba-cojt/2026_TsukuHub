import { supabase } from "../lib/supabase";
import {
  universityFeatureKeys,
  type University,
  type UniversityEmailDomain,
  type UniversityFeature,
  type UniversityFeatureKey,
  type UniversityFeatureStatus,
  type UniversityWithSettings,
} from "../types/university";

const universityColumns =
  "id, slug, name, short_name, tagline, description, status, signup_enabled, created_at, updated_at";

const emptyFeatures = () =>
  Object.fromEntries(
    universityFeatureKeys.map((key) => [key, "coming_soon"]),
  ) as Record<UniversityFeatureKey, UniversityFeatureStatus>;

const mergeSettings = (
  university: University,
  features: UniversityFeature[],
  emailDomains: UniversityEmailDomain[],
): UniversityWithSettings => ({
  ...university,
  features: features.reduce((result, feature) => {
    result[feature.feature_key] = feature.status;
    return result;
  }, emptyFeatures()),
  emailDomains,
});

export async function listUniversities(): Promise<University[]> {
  const { data, error } = await supabase
    .from("universities")
    .select(universityColumns)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as University[];
}
export async function getUniversityBySlug(
  slug: string,
): Promise<UniversityWithSettings | null> {
  const { data, error } = await supabase
    .from("universities")
    .select(universityColumns)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const university = data as University;
  const [featuresResult, domainsResult] = await Promise.all([
    supabase
      .from("university_features")
      .select("university_id, feature_key, status")
      .eq("university_id", university.id),
    supabase
      .from("university_email_domains")
      .select("id, university_id, domain, enabled")
      .eq("university_id", university.id)
      .eq("enabled", true)
      .order("domain"),
  ]);
  if (featuresResult.error) throw featuresResult.error;
  if (domainsResult.error) throw domainsResult.error;

  return mergeSettings(
    university,
    (featuresResult.data ?? []) as UniversityFeature[],
    (domainsResult.data ?? []) as UniversityEmailDomain[],
  );
}

export async function listUniversitiesWithSettings(): Promise<
  UniversityWithSettings[]
> {
  const universities = await listUniversities();
  return Promise.all(
    universities.map((university) => getUniversityBySlug(university.slug)),
  ).then((items) => items.filter((item): item is UniversityWithSettings => Boolean(item)));
}

export type UniversitySettingsInput = Pick<
  University,
  "name" | "short_name" | "tagline" | "description" | "status" | "signup_enabled"
>;

export async function updateUniversity(
  id: string,
  input: UniversitySettingsInput,
): Promise<void> {
  const { error } = await supabase.from("universities").update(input).eq("id", id);
  if (error) throw error;
}

export async function createUniversity(input: {
  slug: string;
  name: string;
  short_name: string;
  tagline: string;
  description: string;
}): Promise<University> {
  const { data, error } = await supabase
    .from("universities")
    .insert({ ...input, status: "active", signup_enabled: false })
    .select(universityColumns)
    .single();
  if (error) throw error;
  const university = data as University;
  const { error: featureError } = await supabase.from("university_features").insert(
    universityFeatureKeys.map((feature_key) => ({
      university_id: university.id,
      feature_key,
      status: "coming_soon",
    })),
  );
  if (featureError) throw featureError;
  return university;
}

export async function setUniversityFeature(
  universityId: string,
  featureKey: UniversityFeatureKey,
  status: UniversityFeatureStatus,
): Promise<void> {
  const { error } = await supabase.from("university_features").upsert({
    university_id: universityId,
    feature_key: featureKey,
    status,
  });
  if (error) throw error;
}

export async function addUniversityEmailDomain(
  universityId: string,
  domain: string,
): Promise<void> {
  const normalized = domain.trim().toLowerCase().replace(/^@/, "");
  const { error } = await supabase.from("university_email_domains").upsert(
    { university_id: universityId, domain: normalized, enabled: true },
    { onConflict: "university_id,domain" },
  );
  if (error) throw error;
}

export async function disableUniversityEmailDomain(id: string): Promise<void> {
  const { error } = await supabase
    .from("university_email_domains")
    .update({ enabled: false })
    .eq("id", id);
  if (error) throw error;
}
