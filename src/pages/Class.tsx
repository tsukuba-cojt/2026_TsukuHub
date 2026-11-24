import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { filterCourses, pageSize, readSearch, searchQuery } from "../lib/courseSearch";
import { PageSeo } from "../seo/PageSeo";
import { listMetadata } from "../seo/metadata";
import { useUniversity } from "../components/university/universityContextValue";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import ClassSearchPanel from "../components/class/ClassSearchPanel.tsx";
import ClassSortBar from "../components/class/ClassSortBar";
import ClassCard, { type ClassCourse } from "../components/class/ClassCard";
import ClassPagination from "../components/class/ClassPagination";
import { listCatalogCourses } from "../services/courseCatalog";
import type { CatalogCourse } from "../types/courseCatalog";
import "../styles/class/Class.css";

function Class() {
  const { university, path } = useUniversity();
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { search } = useLocation();
  const navigate = useNavigate();
  const { filters, page: currentPage } = useMemo(() => readSearch(new URLSearchParams(search)), [search]);
  const year = filters.academicYear;
  const toClassCourse = (r: CatalogCourse): ClassCourse => ({
    id: r.course_number,
    academicYear: r.academic_year ?? filters.academicYear,
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
    let active = true;
    const fetchCourses = async () => {
      if (!university) return;
      setLoading(true);
      setError(null);
      try {
        const rows = await listCatalogCourses(
          university.slug,
          year
        );
        if (active) setCourses(rows);
      } catch {
        if (active) setError("履修一覧の取得に失敗しました。");
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchCourses();
    return () => { active = false; };
  }, [year, university]);

  const filteredCourses = useMemo(() => filterCourses(courses, filters), [courses, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentPageCourses = useMemo(() => {
    const offset = (safeCurrentPage - 1) * pageSize;
    return filteredCourses.slice(offset, offset + pageSize);
  }, [filteredCourses, safeCurrentPage]);

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        {university && <PageSeo {...listMetadata(university.slug, university.name, filters, currentPage)} />}
        <ClassSearchPanel
          filters={filters}
          onChange={(next) => navigate(path("/class") + searchQuery({ ...filters, ...next }, 1), { replace: true })}
        />
        <ClassSortBar currentPage={safeCurrentPage} totalCount={filteredCourses.length} />

        {loading && <p className="classStatus">読み込み中...</p>}
        {error && <p className="classStatus classStatusError">{error}</p>}

        {!loading && !error && currentPage > totalPages && (
          <p className="classStatus">指定したページに授業はありません。</p>
        )}
        {!loading && !error && currentPage <= totalPages && (
          <div className="classCourseList">
            {currentPageCourses.map((course) => (
              <ClassCard course={toClassCourse(course)} key={course.course_number} />
            ))}
          </div>
        )}

        <ClassPagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          pageUrl={(page) => path("/class") + searchQuery(filters, page)}
        />
      </main>
      <Footer />
    </div>
  );
}

export default Class;
