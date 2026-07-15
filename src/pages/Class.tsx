import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import ClassSearchPanel from "../components/class/ClassSearchPanel.tsx";
import ClassSortBar from "../components/class/ClassSortBar";
import ClassCard, { type ClassCourse } from "../components/class/ClassCard";
import ClassPagination from "../components/class/ClassPagination";
import "../styles/class/Class.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// coursesテーブルの行の型（DBスキーマに対応）
type CourseRow = {
  id: number;
  course_number: string;
  course_name: string;
  method: string;
  credits: string;
  target_year: string;
  semester: string;
  schedule: string;
  instructor: string;
  overview?: string;
  remarks?: string;
};

type FiltersState = {
  text: string;
  code: string;
  moduleRangeStart: number;
  moduleRangeEnd: number;
  classType: "normal" | "intensive" | "consultation" | "anytime" | "nt";
  schedule: string;
  scheduleDay: string;
  schedulePeriod: string;
};

function Class() {
  const [courses, setCourses] = useState<ClassCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    text: "",
    code: "",
    moduleRangeStart: 1,
    moduleRangeEnd: 6,
    classType: "normal",
    schedule: "all",
    scheduleDay: "all",
    schedulePeriod: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const toClassCourse = (r: CourseRow): ClassCourse => ({
    id: String(r.id),
    code: r.course_number,
    title: r.course_name,
    teacher: r.instructor || r.method || "",
    term: r.semester || "",
    period: r.schedule || "",
    credits: r.credits || "",
    rating: 0,
    reviews: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("courses")
        .select(
          "id, course_number, course_name, method, credits, target_year, semester, schedule, instructor, overview, remarks"
        )
        .order("id", { ascending: true });

      if (fetchError) {
        setError("履修一覧の取得に失敗しました。");
        setLoading(false);
        return;
      }

      setCourses((data as CourseRow[]).map(toClassCourse));
      setLoading(false);
    };

    fetchCourses();
  }, []);

  // フィルタを適用した配列をメモ化
  const filteredCourses = useMemo(() => {
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

    return courses.filter((c) => {
      // text: タイトル・教員名を検索
      if (text) {
        const hay = `${c.title} ${c.teacher}`.toLowerCase();
        if (!hay.includes(text)) return false;
      }

      // code: コード部分を部分一致
      if (code) {
        if (!c.code.toLowerCase().includes(code)) return false;
      }

      // module: 範囲指定で判定
      const term = (c.term || "");
      const allowedModules = getAllowedTermModules(filters.moduleRangeStart, filters.moduleRangeEnd);
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
      const schedRaw = (c.period || "");
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
  }, [courses, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const currentPageCourses = useMemo(() => {
    const offset = (currentPage - 1) * pageSize;
    return filteredCourses.slice(offset, offset + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <p className="classBreadcrumb">ホーム &gt; 授業・履修</p>
        <ClassSearchPanel
          filters={filters}
          onChange={(next: Partial<FiltersState>) => setFilters((prev) => ({ ...prev, ...next }))}
        />
        <ClassSortBar currentPage={currentPage} totalCount={filteredCourses.length} />

        {loading && <p className="classStatus">読み込み中...</p>}
        {error && <p className="classStatus classStatusError">{error}</p>}

        {!loading && !error && (
          <div className="classCourseList">
            {currentPageCourses.map((course) => (
              <ClassCard course={course} key={course.id} />
            ))}
          </div>
        )}

        <ClassPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChangePage={setCurrentPage}
        />
      </main>
      <Footer />
    </div>
  );
}

export default Class;