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
export const COMING_SOON_NOTICE = "すみません！まだ準備中です";

/** 未実装のためリンクを無効化するパス */
const COMING_SOON_PATHS: ReadonlySet<string> = new Set([
  "/circles", // サークル・課外活動（グロナビ・カテゴリカード）
  "/lifestyle", // 生活・便利情報（グロナビ・カテゴリカード）
  "/events", // イベント・お知らせ（カテゴリカードのみ）
  "/global", // 留学・国際交流（グロナビ・カテゴリカード）
]);

/** 指定パスが「準備中」（＝導線を無効化する対象）かどうか */
export function isComingSoon(path: string): boolean {
  return COMING_SOON_PATHS.has(path);
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
  "/mypage",
  "/mypage/applications",
  "/contact",
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
