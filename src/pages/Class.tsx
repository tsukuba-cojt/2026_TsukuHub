import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import ClassSearchPanel from "../components/class/ClassSearchPanel";
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
  overview: string;
  remarks: string;
};

// DBの行 → 表示用の ClassCourse に整形
const toClassCourse = (row: CourseRow): ClassCourse => ({
  id: String(row.id),
  code: row.course_number,
  title: row.course_name,
  teacher: row.instructor,
  term: row.semester,
  period: row.schedule,
  credits: `${row.credits}単位`,
  // rating / reviews も現状DBに無いため暫定的に0。
  rating: 0,
  reviews: 0,
});

function Class() {
  const [courses, setCourses] = useState<ClassCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 検索フィルタの状態（ClassSearchPanel と連携）
  type Filters = {
    text: string;
    code: string;
    module: string;
    semester: string;
    schedule: string;
  };

  const [filters, setFilters] = useState<Filters>({
    text: "",
    code: "",
    module: "all",
    semester: "all",
    schedule: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

      // semester: 'spring' / 'fall' / 'all' を簡易マッチ（英語・日本語を考慮）
      if (filters.semester !== "all") {
        const term = (c.term || "").toLowerCase();
        if (filters.semester === "spring") {
          if (!/春|spring/.test(term)) return false;
        } else if (filters.semester === "fall") {
          if (!/秋|fall/.test(term)) return false;
        }
      }

      // schedule: フィルタが 'all' でなければ文字列包含で判定（簡易実装）
      if (filters.schedule !== "all") {
        const sched = (c.period || "").toLowerCase();
        if (!sched.includes(filters.schedule.replace("-", " ").toLowerCase())) return false;
      }

      // module: 現状 DB にモジュール列がないため all のみ意味を持つ
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
        <p className="classBreadcrumb">
          <Link to="/" className="classBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt; 授業・履修
        </p>
        <ClassSearchPanel
          filters={filters}
          onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
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