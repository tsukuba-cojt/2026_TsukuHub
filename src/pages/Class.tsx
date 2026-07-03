import { useState, useEffect } from "react";
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
  // coursesテーブルに学群カテゴリ列が無いため暫定値。列が用意でき次第差し替え。
  category: "情報学群",
  categoryTone: "cyan",
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

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <p className="classBreadcrumb">ホーム &gt; 授業・履修</p>
        <ClassSearchPanel />
        <ClassSortBar />

        {loading && <p className="classStatus">読み込み中...</p>}
        {error && <p className="classStatus classStatusError">{error}</p>}

        {!loading && !error && (
          <div className="classCourseList">
            {courses.map((course) => (
              <ClassCard course={course} key={course.id} />
            ))}
          </div>
        )}

        <ClassPagination />
      </main>
      <Footer />
    </div>
  );
}

export default Class;