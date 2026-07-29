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
import {
  mockReviews,
  mockRelatedCourses,
} from "../components/class/mockReviews";
import "../styles/class/Class.css";
import "../styles/class/ClassDetail.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// coursesテーブルの行の型（Class.tsx と同じ形。共通化は後日検討）
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
  // 口コミ投稿ページから router state で渡されるトーストメッセージ
  const [toast, setToast] = useState<string | null>(() => {
    const state = location.state as { toast?: string } | null;
    return state?.toast ?? null;
  });

  useEffect(() => {
    if ((location.state as { toast?: string } | null)?.toast) {
      // リロードや戻る操作で再表示されないよう state をクリアする
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const [course, setCourse] = useState<CourseRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reviews" | "syllabus">("reviews");
  const [sortKey, setSortKey] = useState<SortKey>("new");
  // ブックマークはトグルの見た目のみ（永続化は後日実装）
  const [bookmarked, setBookmarked] = useState(false);

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

  // 並び替え済みの口コミ（データ元は mockReviews。DB移行時に差し替え）
  const sortedReviews = useMemo(() => {
    const arr = [...mockReviews];
    switch (sortKey) {
      case "rating":
        return arr.sort((a, b) => b.rating - a.rating);
      case "helpful":
        return arr.sort((a, b) => b.helpfulCount - a.helpfulCount);
      default:
        return arr.sort((a, b) => b.date.localeCompare(a.date));
    }
  }, [sortKey]);

  // サイドバー用の集計（モックデータから算出。DB移行時に差し替え）
  const stats = useMemo(() => {
    const total = mockReviews.length;
    const avg = total
      ? mockReviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: mockReviews.filter((r) => Math.round(r.rating) === star).length,
    }));
    const features = [...new Set(mockReviews.flatMap((r) => r.tags))];
    return { total, avg, dist, features };
  }, []);

  const handlePostReview = () => {
    navigate(`/class/${courseCode}/review`);
  };

  // 授業方法（数字コード→日本語ラベル）と講義形式（備考から判定）のバッジ
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
            {/* 授業情報カード */}
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
                  {/* 教室・成績評価方法は DB にカラムが無いため非表示（追加後に表示する） */}
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

            {/* タブ（口コミ / シラバス） */}
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
                {/* 左：口コミ一覧 */}
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
                    {sortedReviews.map((review) => (
                      <ClassReviewCard review={review} courseCode={courseCode ?? ""} key={review.id} />
                    ))}
                  </div>
                </div>

                {/* 右：サイドバー */}
                <aside className="classDetailSidebar">
                  <section className="sidebarCard">
                    <h2>おすすめ度</h2>
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
                  </section>

                  {/* 単位取得率（現状ダミーデータ。実データ接続時は props を渡す） */}
                  <CreditRateCard />

                  <section className="sidebarCard">
                    <h2>この授業の特徴</h2>
                    <div className="sidebarFeatures">
                      {stats.features.map((feature) => (
                        <FeatureTag label={feature} key={feature} />
                      ))}
                    </div>
                  </section>

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
              /* シラバスタブ：DB にシラバス PDF の URL カラムが無いため
                 白紙プレースホルダー。カラム追加後に <object> 埋め込みへ差し替える */
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
