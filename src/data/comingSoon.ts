/**
 * 未実装ページへの導線をまとめて無効化するための定義。
 *
 * ここに登録したパスは、グローバルナビ（Globalnav.tsx）とトップページの
 * カテゴリカード（CategorySection.tsx）で
 *   ・クリックしても遷移しない
 *   ・ホバー／フォーカス時に「準備中」ポップアップを表示する
 *   ・cursor: not-allowed になる
 * という扱いになる。
 *
 * ページの実装が完了したら、この配列から該当パスを削除するだけで導線が復活する。
 * （コンポーネント側の変更は不要）
 */

/** ポップアップおよび title 属性に出す文言 */
export const COMING_SOON_NOTICE = "準備中です";

/** 未実装のためリンクを無効化するパス */
const COMING_SOON_PATHS: ReadonlySet<string> = new Set([
  "/circles", // サークル・課外活動（グロナビ・カテゴリカード）
  "/lifestyle", // 生活・便利情報（グロナビ・カテゴリカード）
  "/global", // 留学・国際交流（グロナビ・カテゴリカード）
]);

/** 指定パスが「準備中」（＝導線を無効化する対象）かどうか */
export function isComingSoon(path: string): boolean {
  return COMING_SOON_PATHS.has(path);
}

type FeatureEnabledCheck = (feature: import("../types/university").UniversityFeatureKey) => boolean;

const UNIVERSITY_PATH_FEATURES: Readonly<Record<string, readonly import("../types/university").UniversityFeatureKey[]>> = {
  "/news": ["news"],
  "/topics": ["news"],
  "/career": ["career_articles", "internships", "alumni_stories"],
  "/career/basics": ["career_articles"],
  "/career/internships": ["internships"],
  "/career/alumni": ["alumni_stories"],
  "/class/top": ["courses", "class_reviews", "graduation_checker", "timetable"],
  "/class": ["courses"],
  "/graduation-checker": ["graduation_checker"],
  "/timetable": ["timetable"],
  "/timetable/share": ["timetable"],
};

/** 固定の未実装項目、または大学側で全対象機能が準備中なら true。 */
export function isUniversityComingSoon(
  path: string,
  isFeatureEnabled: FeatureEnabledCheck,
): boolean {
  const pathname = normalizeInternalPath(path);
  if (isComingSoon(pathname)) return true;
  const features = UNIVERSITY_PATH_FEATURES[pathname];
  return Boolean(features && !features.some(isFeatureEnabled));
}

const KNOWN_STATIC_PATHS: ReadonlySet<string> = new Set([
  "/",
  "/login",
  "/signup",
  "/auth/confirm",
  "/class",
  "/class/top",
  "/graduation-checker",
  "/graduation-checker/result",
  "/timetable",
  "/timetable/share",
  "/mypage",
  "/mypage/applications",
  "/contact",
  "/terms",
  "/privacy",
  "/news",
  "/topics",
  "/career",
  "/career/basics",
  "/career/internships",
  "/career/alumni",
  "/career/stories",
  "/admin",
  "/admin/internships",
  "/admin/internships/new",
  "/admin/applications",
  "/admin/career-content",
  "/admin/class-management",
]);

const KNOWN_DYNAMIC_PATHS: readonly RegExp[] = [
  /^\/class\/[^/]+$/,
  /^\/class\/[^/]+\/review$/,
  /^\/class\/guides\/[^/]+$/,
  /^\/class\/guide\/[^/]+$/,
  /^\/career\/articles\/[^/]+$/,
  /^\/career\/internships\/[^/]+$/,
  /^\/career\/alumni\/[^/]+$/,
  /^\/admin\/internships\/[^/]+\/edit$/,
  /^\/admin\/applications\/[^/]+$/,
];

function normalizeInternalPath(path: string): string {
  const pathname = path.split(/[?#]/)[0] || "/";
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

/** App.tsx に存在するルートかどうか */
export function isKnownAppPath(path: string): boolean {
  const pathname = normalizeInternalPath(path);
  return (
    KNOWN_STATIC_PATHS.has(pathname) ||
    KNOWN_DYNAMIC_PATHS.some((pattern) => pattern.test(pathname))
  );
}

/** 内部リンククリック時に遷移を止め、「準備中」として扱うべきか */
export function shouldBlockInternalNavigation(path: string): boolean {
  const pathname = normalizeInternalPath(path);
  return isComingSoon(pathname) || !isKnownAppPath(pathname);
}
