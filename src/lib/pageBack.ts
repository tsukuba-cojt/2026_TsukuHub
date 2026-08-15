export const NAV_BASE_PATHS = [
  "/",
  "/career",
  "/class/top",
  "/circles",
  "/lifestyle",
  "/global",
] as const;

const normalizePath = (path: string) => {
  const pathname = path.split(/[?#]/)[0] || "/";
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
};

const isUnder = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

export const isNavBasePath = (path: string) =>
  (NAV_BASE_PATHS as readonly string[]).includes(normalizePath(path));

export const fallbackNavBasePath = (path: string) => {
  const relativePath = normalizePath(path);
  if (
    isUnder(relativePath, "/class") ||
    isUnder(relativePath, "/graduation-checker") ||
    relativePath === "/timetable"
  ) {
    return "/class/top";
  }
  if (isUnder(relativePath, "/career")) return "/career";
  if (isUnder(relativePath, "/circles")) return "/circles";
  if (isUnder(relativePath, "/lifestyle")) return "/lifestyle";
  if (isUnder(relativePath, "/global")) return "/global";
  return "/";
};

export const canNavigateBackInApp = (historyState?: unknown) => {
  const state = historyState ?? (typeof window === "undefined" ? null : window.history.state);
  const idx =
    state && typeof state === "object" && "idx" in state
      ? (state as { idx?: unknown }).idx
      : undefined;
  if (typeof idx === "number") return idx > 0;
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  try {
    return Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
};
