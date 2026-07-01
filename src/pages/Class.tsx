import { useMemo, useState } from "react";
import ClassList, { type Course, type SortKey } from "../components/class/ClassList";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import "../styles/class/Class.css";

const dummyCourses: Course[] = [
  { id: "1", code: "ABC1234", name: "心理学入門", instructor: "山田 太郎", department: "人文・文化学群", semester: "春A", module: "春A", schedule: "月2・3", credits: 2, rating: 4.0, reviewCount: 32 },
  { id: "2", code: "DEF5678", name: "微分積分学I", instructor: "佐藤 花子", department: "理工学群", semester: "春A", module: "春A", schedule: "火1", credits: 1.5, rating: 3.2, reviewCount: 58 },
  { id: "3", code: "GHI9012", name: "プログラミング入門", instructor: "鈴木 一郎", department: "情報学群", semester: "春B", module: "春B", schedule: "水3・4", credits: 2, rating: 4.6, reviewCount: 120 },
  { id: "4", code: "JKL3456", name: "経済学概論", instructor: "高橋 次郎", department: "社会・国際学群", semester: "秋A", module: "秋A", schedule: "木2", credits: 2, rating: 3.8, reviewCount: 45 },
  { id: "5", code: "MNO7890", name: "生命科学の基礎", instructor: "田中 三郎", department: "生命環境学群", semester: "秋B", module: "秋B", schedule: "金5", credits: 1.5, rating: 4.2, reviewCount: 21 },
  { id: "6", code: "PQR1122", name: "統計学入門", instructor: "伊藤 四郎", department: "理工学群", semester: "春A", module: "春A", schedule: "月4", credits: 2, rating: 3.5, reviewCount: 67 },
  { id: "7", code: "STU3344", name: "英語コミュニケーション", instructor: "渡辺 五郎", department: "人文・文化学群", semester: "春B", module: "春B", schedule: "火2", credits: 1, rating: 4.4, reviewCount: 89 },
  { id: "8", code: "VWX5566", name: "データ構造とアルゴリズム", instructor: "中村 六郎", department: "情報学群", semester: "秋A", module: "秋A", schedule: "水1・2", credits: 2, rating: 4.8, reviewCount: 150 },
  { id: "9", code: "YZA7788", name: "国際関係論", instructor: "小林 七郎", department: "社会・国際学群", semester: "秋B", module: "秋B", schedule: "木3", credits: 2, rating: 3.1, reviewCount: 18 },
  { id: "10", code: "BCD9900", name: "生態学概論", instructor: "加藤 八郎", department: "生命環境学群", semester: "春A", module: "春A", schedule: "金1", credits: 1.5, rating: 3.9, reviewCount: 40 },
  { id: "11", code: "EFG1234", name: "哲学入門", instructor: "吉田 九郎", department: "人文・文化学群", semester: "春B", module: "春B", schedule: "月3", credits: 2, rating: 4.1, reviewCount: 30 },
  { id: "12", code: "HIJ5678", name: "線形代数学", instructor: "山本 十郎", department: "理工学群", semester: "秋A", module: "秋A", schedule: "火4", credits: 1.5, rating: 3.0, reviewCount: 72 },
];

const moduleOptions = ["すべて", "春A", "春B", "秋A", "秋B"];
const semesterOptions = ["すべて", "春学期", "秋学期", "通年"];
const scheduleOptions = ["すべて", "月2・3", "火1", "水3・4", "木2", "金5", "月4", "火2", "水1・2", "木3", "金1", "月3", "火4"];

const PAGE_SIZE = 10;

const initialFilters = {
  keyword: "",
  code: "",
  module: "すべて",
  semester: "すべて",
  schedule: "すべて",
};

function Class() {
  const [filters, setFilters] = useState(initialFilters);
  const [sortKey, setSortKey] = useState<SortKey>("ratingDesc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourses = useMemo(() => {
    return dummyCourses.filter((course) => {
      if (filters.keyword && !course.name.includes(filters.keyword)) return false;
      if (filters.code && !course.code.toLowerCase().includes(filters.code.toLowerCase())) return false;
      if (filters.module !== "すべて" && course.module !== filters.module) return false;
      if (filters.semester !== "すべて") {
        const isSpring = course.semester.startsWith("春");
        const semesterLabel = isSpring ? "春学期" : "秋学期";
        if (filters.semester !== semesterLabel) return false;
      }
      if (filters.schedule !== "すべて" && course.schedule !== filters.schedule) return false;
      return true;
    });
  }, [filters]);

  const sortedCourses = useMemo(() => {
    const sorted = [...filteredCourses];
    switch (sortKey) {
      case "ratingDesc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "reviewCountDesc":
        sorted.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "codeAsc":
        sorted.sort((a, b) => a.code.localeCompare(b.code));
        break;
    }
    return sorted;
  }, [filteredCourses, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedCourses.length / PAGE_SIZE));
  const pagedCourses = sortedCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const updateFilter = (key: keyof typeof initialFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <section className="classFilterArea">
          <input
            type="text"
            className="classFilterInput"
            placeholder="講義名・キーワードで検索"
            value={filters.keyword}
            onChange={(e) => updateFilter("keyword", e.target.value)}
          />
          <input
            type="text"
            className="classFilterInput"
            placeholder="講座番号で検索"
            value={filters.code}
            onChange={(e) => updateFilter("code", e.target.value)}
          />
          <select
            className="classFilterSelect"
            value={filters.module}
            onChange={(e) => updateFilter("module", e.target.value)}
          >
            {moduleOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            className="classFilterSelect"
            value={filters.semester}
            onChange={(e) => updateFilter("semester", e.target.value)}
          >
            {semesterOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            className="classFilterSelect"
            value={filters.schedule}
            onChange={(e) => updateFilter("schedule", e.target.value)}
          >
            {scheduleOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button type="button" className="classFilterClearButton" onClick={clearFilters}>
            フィルターをクリア
          </button>
        </section>

        <ClassList
          courses={pagedCourses}
          totalCount={sortedCourses.length}
          sortKey={sortKey}
          onSortChange={setSortKey}
        />

        <nav className="classPagination" aria-label="ページネーション">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            前へ
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={page === currentPage ? "isActivePage" : ""}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            次へ
          </button>
        </nav>
      </main>

      <Footer />
    </div>
  );
}

export default Class;
