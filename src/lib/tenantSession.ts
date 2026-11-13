const tenantSessionKey = "tsukuhub_active_university";
const lastUniversityKey = "tsukuhub_last_university";

export const getActiveUniversitySlug = () => localStorage.getItem(tenantSessionKey);

export const setActiveUniversitySlug = (slug: string) => {
  localStorage.setItem(tenantSessionKey, slug);
  localStorage.setItem(lastUniversityKey, slug);
};

export const clearActiveUniversitySlug = () => localStorage.removeItem(tenantSessionKey);
export const getLastUniversitySlug = () => localStorage.getItem(lastUniversityKey);
