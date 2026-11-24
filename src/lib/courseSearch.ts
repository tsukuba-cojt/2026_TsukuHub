import type { CatalogCourse } from "../types/courseCatalog";
import { catalogYear, currentYear } from "../seo/catalog";

export type CourseFilters = {
  academicYear: number;
  text: string;
  code: string;
  moduleRangeStart: number;
  moduleRangeEnd: number;
  classType: "normal" | "intensive" | "consultation" | "anytime" | "nt";
  schedule: string;
  scheduleDay: string;
  schedulePeriod: string;
};

export const pageSize = 10;
export const defaultFilters: CourseFilters = {
  academicYear: currentYear,
  text: "",
  code: "",
  moduleRangeStart: 1,
  moduleRangeEnd: 6,
  classType: "normal",
  schedule: "all",
  scheduleDay: "all",
  schedulePeriod: "all",
};

export function readSearch(params: URLSearchParams) {
  const filters = { ...defaultFilters, academicYear: catalogYear(params) };
  for (const key of ["text", "code", "schedule", "scheduleDay", "schedulePeriod"] as const) {
    filters[key] = params.get(key) ?? defaultFilters[key];
  }
  const classType = params.get("classType");
  if (classType === "intensive" || classType === "consultation" || classType === "anytime" || classType === "nt") {
    filters.classType = classType;
  }
  for (const key of ["moduleRangeStart", "moduleRangeEnd"] as const) {
    const n = Number(params.get(key));
    if (Number.isInteger(n) && n >= 1 && n <= 6) filters[key] = n;
  }
  const n = Number(params.get("page"));
  return { filters, page: Number.isSafeInteger(n) && n > 0 ? n : 1 };
}

export function searchQuery(filters: CourseFilters, page: number) {
  const params = new URLSearchParams({ year: String(filters.academicYear) });
  if (page > 1) params.set("page", String(page));
  for (const key of Object.keys(defaultFilters) as (keyof CourseFilters)[]) {
    if (key !== "academicYear" && filters[key] !== defaultFilters[key]) params.set(key, String(filters[key]));
  }
  return "?" + params.toString();
}

export function filterCourses(courses: CatalogCourse[], filters: CourseFilters) {
  const text = filters.text.trim().toLowerCase();
  const code = filters.code.trim().toLowerCase();

  // モジュールと数値のマッピング
  const moduleMap: { [key: string]: number } = {
    "春A": 1,
    "春B": 2,
    "春C": 3,
    "秋A": 4,
    "秋B": 5,
    "秋C": 6,
  };

  const moduleLabels = Object.keys(moduleMap);

  const getAllowedTermModules = (start: number, end: number) => {
    return Object.entries(moduleMap)
      .filter(([, num]) => num >= start && num <= end)
      .map(([label]) => label);
  };

  const getTermModules = (term: string) => {
    return moduleLabels.filter((label) => term.includes(label));
  };

  const allowedModules = getAllowedTermModules(filters.moduleRangeStart, filters.moduleRangeEnd);
  return courses.filter((c) => {
    // text: タイトル・教員名を検索
    if (text) {
      const hay = `${c.course_name} ${c.instructor || c.method || ""}`.toLowerCase();
      if (!hay.includes(text)) return false;
    }

    // code: コード部分を部分一致
    if (code) {
      if (!c.course_number.toLowerCase().includes(code)) return false;
    }

    // module: 範囲指定で判定
    const term = (c.semester || "");
    const termModules = getTermModules(term);

    if (term.includes("通年")) {
      // 通年科目は、モジュール範囲が 1〜6 全選択のときのみ表示する
      if (filters.moduleRangeStart !== 1 || filters.moduleRangeEnd !== 6) {
        return false;
      }
    } else if (term.includes("集中講義")) {
      // 集中講義は範囲指定にかかわらず残す
    } else {
      if (termModules.length === 0) {
        return false;
      }

      // 範囲内のモジュールが1つも含まれていない場合は除外
      if (!termModules.some((moduleLabel) => allowedModules.includes(moduleLabel))) {
        return false;
      }

      // 範囲外のモジュールが含まれていれば除外
      if (termModules.some((moduleLabel) => !allowedModules.includes(moduleLabel))) {
        return false;
      }
    }

    // schedule 判定:
    // - 通年かつモジュールが全選択(1..6) の場合は schedule フィルターを無視する
    // - filters.classType !== 'normal' の場合は DB の schedule に種別キーワードが含まれるかで判定
    // - normal の場合は曜日/時限で判定（split モード：scheduleDay/schedulePeriod、combined モード：schedule）
    const schedRaw = (c.schedule || "");
    if (term.includes("通年") && filters.moduleRangeStart === 1 && filters.moduleRangeEnd === 6) {
      // 通年かつモジュール全選択：schedule 条件を適用しない
    } else if (filters.classType && filters.classType !== "normal") {
      const classTypeMap: { [key: string]: string[] } = {
        intensive: ["集中", "集中講義"],
        consultation: ["応談", "応相談", "応談可"],
        anytime: ["随時"],
        nt: ["NT", "ＮＴ"],
      };
      const keywords = classTypeMap[filters.classType] || [];
      const lowerSched = schedRaw.toLowerCase();
      if (!keywords.some((k) => lowerSched.includes(k.toLowerCase()))) return false;
    } else {
      // normal の場合
      const DAY_JP: { [key: string]: string } = {
        mon: "月",
        tue: "火",
        wed: "水",
        thu: "木",
        fri: "金",
      };

      if (filters.schedule && filters.schedule !== "all") {
        // combined モード（例: "mon-2" を "mon 2" に変換して検索）
        const schedSearch = filters.schedule.replace("-", " ");
        if (!schedRaw.toLowerCase().includes(schedSearch.toLowerCase())) return false;
      } else if (filters.scheduleDay && filters.scheduleDay !== "all") {
        const day = DAY_JP[filters.scheduleDay] || filters.scheduleDay;
        const searchValue =
          filters.schedulePeriod && filters.schedulePeriod !== "all"
            ? `${day}${filters.schedulePeriod}`
            : `${day}`;
        if (!schedRaw.toLowerCase().includes(searchValue.toLowerCase())) return false;
      }
    }

    return true;
  });
}
