import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  Bookmark,
  Calendar,
  Clock,
  SquarePen,
  UserRound,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import Toast from "../components/utility/Toast";
import RatingStars from "../components/class/RatingStars";
import ClassReviewCard from "../components/class/ClassReviewCard";
import FeatureTag from "../components/class/FeatureTag";
import CreditRateCard from "../components/class/CreditRateCard";
import {
  getClassFormats,
  getMethodLabel,
} from "../components/class/courseBadges";
import { mockRelatedCourses } from "../components/class/mockReviews";
import "../styles/class/Class.css";
import "../styles/class/ClassDetail.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

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

// [変更] is_anonymous を削除、author_major / author_grade を追加
type Review = {
  id: string;
  course_id: number;
  user_id: string;
  rating: number;
  lecture_format: string | null;
  test_format: string | null;
  difficulty: string | null;
  workload: string | null;
  attendance: string | null;
  past_exam: string | null;
  comment: string | null;
  author_major: string | null;
  author_grade: number | null;
  created_at: string;
  updated_at: string;
  helpful_count: number;
};

type SortKey = "new" | "rating" | "helpful";

const sortTabs: { key: SortKey; label: string }[] = [
  { key: "new", label: "新規順" },
  { key: "rating", label: "評価順" },
  { key: "helpful", label: "参考順" },
];

function ClassDetail() {
  const { courseCode } = useParams<{ courseCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    if (state?.toast) {
      setToast(state.toast);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const [course, setCourse] = useState<CourseRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reviews" | "syllabus">("reviews");
  const [sortKey, setSortKey] = useState<SortKey>("new");
  // ブックマークはトグルの見た目のみ（汎用ブックマーク機能として後日実装）
  const [bookmarked, setBookmarked] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("courses")
        .select(
          "id, course_number, course_name, method, credits, target_year, semester, schedule, instructor, overview, remarks"
        )
        .eq("course_number", courseCode)
        .maybeSingle();

      if (fetchError) {
        setError("講義情報の取得に失敗しました。");
        setLoading(false);
        return;
      }

      setCourse(data as CourseRow | null);
      setLoading(false);
    };

    fetchCourse();
  }, [courseCode]);

  // course 取得後に口コミを fetch
  useEffect(() => {
    if (!course) return;

    const fetchReviews = async () => {
      const { data, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("course_id", course.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("口コミの取得に失敗:", fetchError);
        return;
      }

      if (data) {
        setReviews(
          data.map((r) => ({ ...r, helpful_count: 0 }) as Review)
        );
      }
    };

    fetchReviews();
  }, [course]);

  const sortedReviews = useMemo(() => {
    const arr = [...reviews];
    switch (sortKey) {
      case "rating":
        return arr.sort((a, b) => b.rating - a.rating);
      case "helpful":
        return arr.sort((a, b) => b.helpful_count - a.helpful_count);
      default:
        return arr.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
  }, [sortKey, reviews]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => Math.round(r.rating) === star).length,
    }));

    const counts: Record<string, number> = {};
    for (const r of reviews) {
      for (const val of [
        r.lecture_format,
        r.difficulty,
        r.workload,
        r.attendance,
        r.past_exam,
      ]) {
        if (val) counts[val] = (counts[val] || 0) + 1;
      }
    }
    const features = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label]) => label);

    return { total, avg, dist, features };
  }, [reviews]);

  const handlePostReview = () => {
    navigate(`/class/${courseCode}/review`);
  };

  const methodLabel = course ? getMethodLabel(course.method) : null;
  const classFormats = course ? getClassFormats(course.remarks) : [];

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <p className="classBreadcrumb">
          <Link to="/" className="classBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt;{" "}
          <Link to="/class" className="classBreadcrumbLink">
            授業・履修
          </Link>{" "}
          &gt; {course ? course.course_name : "講義詳細"}
        </p>

        {loading && <p className="classStatus">読み込み中...</p>}
        {error && <p className="classStatus classStatusError">{error}</p>}

        {!loading && !error && !course && (
          <div className="classDetailNotFound">
            <p className="classStatus">
              該当する講義が見つかりませんでした（講義番号：{courseCode}）。
            </p>
            <Link to="/class" className="classDetailBackLink">
              講義検索へ戻る
            </Link>
          </div>
        )}

        {!loading && !error && course && (
          <div className="classDetailPanel">
            <section className="classDetailInfoCard">
              <div className="classDetailInfoMain">
                <h1 className="classDetailTitle">{course.course_name}</h1>
                <p className="classDetailCode">{course.course_number}</p>
                <p className="classDetailTeacher">
                  <UserRound aria-hidden="true" />
                  <span>{course.instructor}</span>
                  <small>先生</small>
                </p>
                <div className="classDetailBadges">
                  <span className="classDetailTermBadge">{course.semester}</span>
                  <span>
                    <Calendar aria-hidden="true" />
                    {course.schedule}
                  </span>
                  <span>
                    <Clock aria-hidden="true" />
                    {course.credits}単位
                  </span>
                  {methodLabel && <span>{methodLabel}</span>}
                  {classFormats.map((format) => (
                    <span key={format}>{format}</span>
                  ))}
                </div>
              </div>
              <div className="classDetailActions">
                <button
                  type="button"
                  className={`classDetailActionBtn${bookmarked ? " isActive" : ""}`}
                  aria-pressed={bookmarked}
                  onClick={() => setBookmarked((v) => !v)}
                >
                  <Bookmark aria-hidden="true" />
                  ブックマーク
                </button>
                <button
                  type="button"
                  className="classDetailActionBtn isPrimary"
                  onClick={handlePostReview}
                >
                  <SquarePen aria-hidden="true" />
                  口コミを投稿
                </button>
              </div>
            </section>

            <div className="classDetailTabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "reviews"}
                className={activeTab === "reviews" ? "isActive" : ""}
                onClick={() => setActiveTab("reviews")}
              >
                口コミ
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "syllabus"}
                className={activeTab === "syllabus" ? "isActive" : ""}
                onClick={() => setActiveTab("syllabus")}
              >
                シラバス
              </button>
            </div>

            {activeTab === "reviews" ? (
              <div className="classDetailBody">
                <div className="classDetailReviews">
                  <div className="reviewSortBar">
                    <span>並び替え：</span>
                    {sortTabs.map((tab) => (
                      <button
                        type="button"
                        key={tab.key}
                        className={sortKey === tab.key ? "isActive" : ""}
                        onClick={() => setSortKey(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="reviewList">
                    {sortedReviews.length === 0 && (
                      <p className="classStatus">
                        まだ口コミがありません。最初の口コミを投稿しましょう！
                      </p>
                    )}
                    {sortedReviews.map((review) => (
                      <ClassReviewCard review={review} key={review.id} />
                    ))}
                  </div>
                </div>

                <aside className="classDetailSidebar">
                  <section className="sidebarCard">
                    <h2>おすすめ度</h2>
                    {stats.total > 0 ? (
                      <>
                        <div className="sidebarScoreRow">
                          <strong>{stats.avg.toFixed(1)}</strong>
                          <RatingStars rating={stats.avg} />
                          <span>({stats.total}件の評価)</span>
                        </div>
                        <div className="sidebarDist">
                          {stats.dist.map(({ star, count }) => (
                            <div className="sidebarDistRow" key={star}>
                              <span className="sidebarDistStar">★ {star}</span>
                              <div className="sidebarDistBar">
                                <div
                                  className="sidebarDistFill"
                                  style={{
                                    width: stats.total
                                      ? `${(count / stats.total) * 100}%`
                                      : "0%",
                                  }}
                                />
                              </div>
                              <span className="sidebarDistCount">{count}件</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="classStatus">まだ評価がありません</p>
                    )}
                  </section>

                  <CreditRateCard />

                  {stats.features.length > 0 && (
                    <section className="sidebarCard">
                      <h2>この授業の特徴</h2>
                      <div className="sidebarFeatures">
                        {stats.features.map((feature) => (
                          <FeatureTag label={feature} key={feature} />
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="sidebarCard">
                    <h2>関連授業</h2>
                    <ul className="sidebarRelated">
                      {mockRelatedCourses.map((related) => (
                        <li key={related.code}>
                          <Link to={`/class/${related.code}`}>
                            {related.title}
                          </Link>
                          <span>{related.code}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </aside>
              </div>
            ) : (
              <div className="classDetailSyllabus">
                <p>シラバスは準備中です</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default ClassDetail;