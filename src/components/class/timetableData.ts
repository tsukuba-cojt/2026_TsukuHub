// 「みんなの時間割」(/timetable, /timetable/:timetableId) のダミーデータと
// フィルタリングロジック。
//
// 実データ（Supabase）連携は次フェーズで行う。その際は getTimetables() /
// getTimetableById() の中身を Supabase からの取得に差し替えるだけでよいよう、
// データ取得と絞り込み（filterTimetables）を分離してある。
// UI 側はこれらの関数と選択肢定数のみを参照する。

// 科目区分。ミニ時間割・詳細ページのセル配色と凡例に対応する。
//   required … 必修（パープル）
//   elective … 選択（専門・専門基礎）（グリーン）
//   common   … 選択（共通・関連・その他）（レッド/サーモン）
export type TimetableCategory = "required" | "elective" | "common";

// 凡例（詳細ページのグリッド下に表示）。
export const CATEGORY_LEGEND: { category: TimetableCategory; label: string }[] = [
  { category: "required", label: "必修" },
  { category: "elective", label: "選択（専門・専門基礎）" },
  { category: "common", label: "選択（共通・関連・その他）" },
];

// ミニ時間割／詳細時間割のセル1つ分（day:0=月 … 4=金 / period:1〜6）。
// トップページのカードでは配色ブロックのみ、詳細ページでは科目情報も表示する。
export type TimetableCell = {
  day: number;
  period: number;
  code: string; // 科目番号
  name: string; // 科目名
  label: string; // セル内に表示する区分ラベル（例：「専門必修」）
  category: TimetableCategory;
};

// モジュール別の時間割。キーは MODULE_TABS の値。
export type TimetableSchedule = Record<string, TimetableCell[]>;

export type Timetable = {
  id: string;
  gakurui: string; // 学類
  grade: string; // 学年（"1"〜"6"）
  module: string; // カードに表示する代表モジュール（"春A" など）
  major: string; // 専攻（系）
  enrollYear: string; // 入学年度の下2桁（"23" など）
  springCredits: number; // 春学期取得単位数
  note: string; // 備考
  schedule: TimetableSchedule; // モジュール別のコマ一覧
};

// 未選択（絞り込みなし）は空文字で表現する。
export type TimetableFilters = {
  gakurui: string;
  grade: string;
  module: string;
  major: string;
};

export const EMPTY_FILTERS: TimetableFilters = {
  gakurui: "",
  grade: "",
  module: "",
  major: "",
};

// ── 選択肢定義 ───────────────────────────────
export const GAKURUI_OPTIONS = [
  "情報科学類",
  "情報メディア創成学類",
  "知識情報・図書館学類",
  "工学システム学類",
  "社会工学類",
];

export const GRADE_OPTIONS = [
  { value: "1", label: "1年次" },
  { value: "2", label: "2年次" },
  { value: "3", label: "3年次" },
  { value: "4", label: "4年次" },
];

export const MODULE_OPTIONS = ["春A", "春B", "春C", "秋A", "秋B", "秋C"];

// 詳細ページのモジュールタブ。通常モジュールに「その他」（集中講義など）を加えたもの。
export const MODULE_TABS = [...MODULE_OPTIONS, "その他"];

export const MAJOR_OPTIONS = [
  "CG系",
  "SE系",
  "IS系",
  "メディア系",
  "知識科学系",
];

// 詳細ページの「専攻・分野」に表示する正式名称（カードの「◯◯系」より詳しい表記）。
const MAJOR_FIELD_LABELS: Record<string, string> = {
  CG系: "CG・映像表現",
  SE系: "ソフトウェア工学",
  IS系: "情報システム",
  メディア系: "メディア表現",
  知識科学系: "知識科学",
};

// ── ダミーデータ生成 ───────────────────────────────
// 決定論的な擬似乱数（seed 固定）で、毎回同じ24件を生成する。
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// セルに割り当てるダミー科目。区分ごとに配色が決まる。
const COURSE_POOL: Omit<TimetableCell, "day" | "period">[] = [
  { code: "GB10001", name: "線形代数A", label: "専門必修", category: "required" },
  { code: "GB10214", name: "微分積分A", label: "専門必修", category: "required" },
  { code: "GB13614", name: "プログラム", label: "専門必修", category: "required" },
  { code: "GB20304", name: "データ構造", label: "専門必修", category: "required" },
  { code: "GB40001", name: "メディア論", label: "専門選択", category: "elective" },
  { code: "GB40412", name: "CG基礎", label: "専門選択", category: "elective" },
  { code: "GB30112", name: "情報デザイン", label: "専門選択", category: "elective" },
  { code: "GA15211", name: "統計学基礎", label: "専門基礎", category: "elective" },
  { code: "FF12345", name: "アーチェリー", label: "共通選択", category: "common" },
  { code: "1120202", name: "英語基礎", label: "共通選択", category: "common" },
  { code: "6202412", name: "情報リテラシ", label: "共通選択", category: "common" },
  { code: "2140011", name: "哲学と現代", label: "関連科目", category: "common" },
];

// 1モジュール分のコマを組み立てる。
function buildCells(rand: () => number, count: number): TimetableCell[] {
  const cells: TimetableCell[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (cells.length < count && guard < 60) {
    guard += 1;
    const day = Math.floor(rand() * 5); // 月〜金
    // 上位のコマ（1〜4限）が埋まりやすいよう重み付け
    const period = 1 + Math.floor(rand() * rand() * 6);
    const key = `${day}-${period}`;
    if (used.has(key)) continue;
    used.add(key);
    cells.push({
      day,
      period,
      ...COURSE_POOL[Math.floor(rand() * COURSE_POOL.length)],
    });
  }
  return cells;
}

// モジュール別の時間割を生成する。「その他」（集中講義枠）は空のことが多い。
function buildSchedule(rand: () => number): TimetableSchedule {
  const schedule: TimetableSchedule = {};
  MODULE_TABS.forEach((module) => {
    const count =
      module === "その他"
        ? Math.floor(rand() * 2) // 0〜1コマ
        : 6 + Math.floor(rand() * 5); // 6〜10コマ
    schedule[module] = buildCells(rand, count);
  });
  return schedule;
}

// 学類・学年・モジュール・専攻の組み合わせを変えた24件を生成。
// 一部の組み合わせは意図的に存在しない（検索結果0件の状態を確認できるようにするため）。
function generateTimetables(): Timetable[] {
  const rand = mulberry32(20260727);
  const list: Timetable[] = [];
  for (let i = 0; i < 24; i += 1) {
    const gakurui = GAKURUI_OPTIONS[i % GAKURUI_OPTIONS.length];
    const grade = GRADE_OPTIONS[i % 3].value; // 1〜3年次のみ（4年次は0件になる）
    const module = MODULE_OPTIONS[i % MODULE_OPTIONS.length];
    const major = MAJOR_OPTIONS[(i + Math.floor(i / 3)) % MAJOR_OPTIONS.length];
    const enrollYear = String(20 + (i % 4)); // 20〜23年度入学
    list.push({
      id: `tt-${i + 1}`,
      gakurui,
      grade,
      module,
      major,
      enrollYear,
      springCredits: 15 + (i % 9),
      note: "なし",
      schedule: buildSchedule(rand),
    });
  }
  return list;
}

const TIMETABLES = generateTimetables();

// データ取得（将来的に Supabase 取得へ差し替える箇所）。
export function getTimetables(): Timetable[] {
  return TIMETABLES;
}

// 1件取得（詳細ページ用。将来的に Supabase 取得へ差し替える箇所）。
export function getTimetableById(id: string | undefined): Timetable | undefined {
  if (!id) return undefined;
  return TIMETABLES.find((t) => t.id === id);
}

// 絞り込み：学類は必須の一致条件、学年・モジュール・専攻は
// 選択されている項目のみ AND 条件で順次絞り込む（未選択＝絞り込みなし）。
export function filterTimetables(
  list: Timetable[],
  filters: TimetableFilters
): Timetable[] {
  if (!filters.gakurui) return [];
  return list.filter((t) => {
    if (t.gakurui !== filters.gakurui) return false;
    if (filters.grade && t.grade !== filters.grade) return false;
    if (filters.module && t.module !== filters.module) return false;
    if (filters.major && t.major !== filters.major) return false;
    return true;
  });
}

// 学年の表示ラベル（"2" → "2年次"）。
export function gradeLabel(grade: string): string {
  return GRADE_OPTIONS.find((g) => g.value === grade)?.label ?? `${grade}年次`;
}

// 入学年度の表示ラベル（"23" → "2023年度"）。
export function enrollYearLabel(enrollYear: string): string {
  return `20${enrollYear}年度`;
}

// 専攻・分野の表示ラベル（"CG系" → "CG・映像表現"）。
export function majorFieldLabel(major: string): string {
  return MAJOR_FIELD_LABELS[major] ?? major;
}
