export function canAccessUniversitySite({
  isAdmin,
  profileUniversityId,
  universityId,
}: {
  isAdmin: boolean;
  profileUniversityId: string | null | undefined;
  universityId: string;
}) {
  return isAdmin || profileUniversityId === universityId;
}
