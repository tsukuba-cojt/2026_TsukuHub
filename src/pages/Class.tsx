import { useState, useEffect, useMemo } from "react";
import { useUniversity } from "../components/university/universityContextValue";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import ClassSearchPanel from "../components/class/ClassSearchPanel.tsx";
import ClassSortBar from "../components/class/ClassSortBar";
import ClassCard, { type ClassCourse } from "../components/class/ClassCard";
import ClassPagination from "../components/class/ClassPagination";
import { listCatalogCourses } from "../services/courseCatalog";
import type { CatalogCourse } from "../types/courseCatalog";
import {
  getTermUi,
  osakaTermMatchesModuleRange,
} from "../features/timetable/termUi";
import "../styles/class/Class.css";

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
  const { university } = useUniversity();
  const termUi = getTermUi(university?.slug);
  const [courses, setCourses] = useState<ClassCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    text: "",
    code: "",
    moduleRangeStart: 1,
    moduleRangeEnd: termUi.classModuleMax,
    classType: "normal",
    schedule: "all",
    scheduleDay: "all",
    schedulePeriod: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 大学切替時に開講期レンジを合わせてリセット
  useEffect(() => {
    const nextUi = getTermUi(university?.slug);
    setFilters((prev) => ({
      ...prev,
      moduleRangeStart: 1,
      moduleRangeEnd: nextUi.classModuleMax,
    }));
    setCurrentPage(1);
  }, [university?.slug]);

  const toClassCourse = (r: CatalogCourse): ClassCourse => ({
    id: r.course_number,
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
      if (!university) return;
      setLoading(true);
      setError(null);
      try {
        const rows = await listCatalogCourses(university.slug);
        setCourses(rows.map(toClassCourse));
      } catch {
        setError("履修一覧の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    void fetchCourses();
  }, [university]);

  const filteredCourses = useMemo(() => {
    const text = filters.text.trim().toLowerCase();
    const code = filters.code.trim().toLowerCase();
    const isOsaka = university?.slug === "osaka";
    const moduleMax = termUi.classModuleMax;

    const moduleMap: { [key: string]: number } = {
      春A: 1,
      春B: 2,
      春C: 3,
      秋A: 4,
      秋B: 5,
      秋C: 6,
    };
    const moduleLabels = Object.keys(moduleMap);
    const getAllowedTermModules = (start: number, end: number) =>
      Object.entries(moduleMap)
        .filter(([, num]) => num >= start && num <= end)
        .map(([label]) => label);
    const getTermModules = (term: string) =>
      moduleLabels.filter((label) => term.includes(label));

    return courses.filter((c) => {
      if (text) {
        const hay = `${c.title} ${c.teacher}`.toLowerCase();
        if (!hay.includes(text)) return false;
      }
      if (code && !c.code.toLowerCase().includes(code)) return false;

      const term = c.term || "";
      if (isOsaka) {
        if (
          !osakaTermMatchesModuleRange(
            term,
            filters.moduleRangeStart,
            filters.moduleRangeEnd
          )
        ) {
          return false;
        }
      } else {
        const allowedModules = getAllowedTermModules(
          filters.moduleRangeStart,
          filters.moduleRangeEnd
        );
        const termModules = getTermModules(term);
        if (term.includes("通年")) {
          if (
            filters.moduleRangeStart !== 1 ||
            filters.moduleRangeEnd !== moduleMax
          ) {
            return false;
          }
        } else if (term.includes("集中講義") || term.includes("集中")) {
          // keep
        } else if (termModules.length > 0) {
          if (
            !termModules.some((moduleLabel) =>
              allowedModules.includes(moduleLabel)
            )
          ) {
            return false;
          }
          if (
            termModules.some(
              (moduleLabel) => !allowedModules.includes(moduleLabel)
            )
          ) {
            return false;
          }
        }
      }

      const schedRaw = c.period || "";
      const fullModuleRange =
        filters.moduleRangeStart === 1 &&
        filters.moduleRangeEnd === moduleMax;
      if (term.includes("通年") && fullModuleRange && !isOsaka) {
        // Tsukuba year-round + full modules: ignore day/period
      } else if (filters.classType && filters.classType !== "normal") {
        const classTypeMap: { [key: string]: string[] } = {
          intensive: ["集中", "集中講義"],
          consultation: ["応談", "応相談", "応談可"],
          anytime: ["随時", "オンデマンド"],
          nt: ["NT", "ＮＴ", "他"],
        };
        const keywords = classTypeMap[filters.classType] || [];
        const lowerSched = schedRaw.toLowerCase();
        if (!keywords.some((k) => lowerSched.includes(k.toLowerCase()))) {
          return false;
        }
      } else {
        const DAY_JP: { [key: string]: string } = {
          mon: "月",
          tue: "火",
          wed: "水",
          thu: "木",
          fri: "金",
        };

        if (filters.schedule && filters.schedule !== "all") {
          const schedSearch = filters.schedule.replace("-", " ");
          if (!schedRaw.toLowerCase().includes(schedSearch.toLowerCase())) {
            return false;
          }
        } else if (filters.scheduleDay && filters.scheduleDay !== "all") {
          const day = DAY_JP[filters.scheduleDay] || filters.scheduleDay;
          const searchValue =
            filters.schedulePeriod && filters.schedulePeriod !== "all"
              ? `${day}${filters.schedulePeriod}`
              : `${day}`;
          if (!schedRaw.toLowerCase().includes(searchValue.toLowerCase())) {
            return false;
          }
        }
      }

      return true;
    });
  }, [courses, filters, university?.slug, termUi.classModuleMax]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentPageCourses = useMemo(() => {
    const offset = (safeCurrentPage - 1) * pageSize;
    return filteredCourses.slice(offset, offset + pageSize);
  }, [filteredCourses, safeCurrentPage, pageSize]);

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <ClassSearchPanel
          universitySlug={university?.slug}
          filters={filters}
          onChange={(next: Partial<FiltersState>) => {
            setFilters((prev) => ({ ...prev, ...next }));
            setCurrentPage(1);
          }}
        />
        <ClassSortBar currentPage={safeCurrentPage} totalCount={filteredCourses.length} />

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
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onChangePage={setCurrentPage}
        />
      </main>
      <Footer />
    </div>
  );
}

export default Class;
