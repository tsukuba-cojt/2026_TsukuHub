export type UniversityLandingDestination = "home" | "login" | "suspended";

export function resolveUniversityLanding({
  universityStatus,
  isAuthenticated,
  isActiveUniversity,
  canAccessUniversity,
}: {
  universityStatus: "active" | "suspended";
  isAuthenticated: boolean;
  isActiveUniversity: boolean;
  canAccessUniversity: boolean;
}): UniversityLandingDestination {
  if (universityStatus === "suspended") return "suspended";
  if (isAuthenticated && isActiveUniversity && canAccessUniversity) return "home";
  return "login";
}
