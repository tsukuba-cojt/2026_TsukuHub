export type UniversityLandingDestination = "home" | "login" | "suspended";

export function resolveUniversityLanding({
  universityStatus,
  isAuthenticated,
  isActiveUniversity,
  canAccessUniversity,
  isAdmin = false,
}: {
  universityStatus: "active" | "suspended";
  isAuthenticated: boolean;
  isActiveUniversity: boolean;
  canAccessUniversity: boolean;
  isAdmin?: boolean;
}): UniversityLandingDestination {
  if (universityStatus === "suspended") return "suspended";
  if (
    isAuthenticated &&
    canAccessUniversity &&
    (isActiveUniversity || isAdmin)
  ) {
    return "home";
  }
  return "login";
}
