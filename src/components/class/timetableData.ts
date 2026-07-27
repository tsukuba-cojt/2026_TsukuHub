// 「みんなの時間割」(/timetable) のダミーデータとフィルタリングロジック。
//
// 実データ（Supabase）連携は次フェーズで行う。その際は getTimetables() の
// 中身を Supabase からの取得に差し替えるだけでよいよう、データ取得（getTimetables）と
// 絞り込み（filterTimetables）を分離してある。UI 側はこの2関数と選択肢定数のみを参照する。

export type TimetableColor = "purple" | "green" | "red";

// ミニ時間割のセル1つ分（day:0=月 … 4=金 / period:1〜6）。
// 今回は配色ブロックのみで科目名などの文字は持たない（スコープ外）。
export type TimetableCell = {
  day: number;
  period: number;
  color: TimetableColor;
};

export type Timetable = {
  id: string;
  gakurui: string; // 学類
  grade: string; // 学年（"1"〜"6"）
  module: string; // モジュール（"春A" など）
  major: string; // 専攻（系）
  enrollYear: string; // 入学年度の下2桁（"23" など）
  cells: TimetableCell[];
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

export const MAJOR_OPTIONS = [
  "CG系",
  "SE系",
  "IS系",
  "メディア系",
  "知識科学系",
];

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

const COLORS: TimetableColor[] = ["purple", "green", "red"];

function buildCells(rand: () => number): TimetableCell[] {
  const cells: TimetableCell[] = [];
  const used = new Set<string>();
  const count = 6 + Math.floor(rand() * 5); // 6〜10コマ
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
      color: COLORS[Math.floor(rand() * COLORS.length)],
    });
  }
  return cells;
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
      cells: buildCells(rand),
    });
  }
  return list;
}

const TIMETABLES = generateTimetables();

// データ取得（将来的に Supabase 取得へ差し替える箇所）。
export function getTimetables(): Timetable[] {
  return TIMETABLES;
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
