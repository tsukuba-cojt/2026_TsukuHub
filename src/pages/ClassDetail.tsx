import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useUniversity } from "../components/university/universityContextValue";
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
  mockRelatedCourses,
} from "../components/class/mockReviews";
import {
  fetchClassReviews,
  fetchCourseInsightStats,
  type CourseInsightStats,
} from "../services/classReviewService";
import { getCatalogCourse } from "../services/courseCatalog";
import type { CatalogCourse } from "../types/courseCatalog";
import { KOAN_SYLLABUS_PORTAL_URL } from "../data/osakaExternalLinks";
import "../styles/class/Class.css";
import "../styles/class/ClassDetail.css";

type SortKey = "new" | "rating" | "helpful";

const sortTabs: { key: SortKey; label: string }[] = [
  { key: "new", label: "新規順" },
  { key: "rating", label: "評価順" },
  { key: "helpful", label: "参考順" },
];

function ClassDetail() {
  const { university, path } = useUniversity();
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

  const [course, setCourse] = useState<CatalogCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reviews" | "syllabus">("reviews");
  const [sortKey, setSortKey] = useState<SortKey>("new");
  const [reviews, setReviews] = useState<Awaited<ReturnType<typeof fetchClassReviews>>>([]);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [insights, setInsights] = useState<CourseInsightStats | null>(null);
  // ブックマークはトグルの見た目のみ（永続化は後日実装）
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!university) return;
      setLoading(true);
      setError(null);

      try {
        const nextCourse = await getCatalogCourse(university.slug, courseCode);
        setCourse(nextCourse);
      } catch {
        setError("講義情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    void fetchCourse();
  }, [courseCode, university]);

  useEffect(() => {
    if (!courseCode || !university) return;
    let cancelled = false;
    fetchClassReviews(courseCode, university.id)
      .then((items) => {
        if (!cancelled) {
          setReviewError(null);
          setReviews(items);
        }
        return fetchCourseInsightStats(courseCode, items, university.id);
      })
      .then((nextInsights) => {
        if (!cancelled) setInsights(nextInsights);
      })
      .catch(() => {
        if (!cancelled) {
          setReviews([]);
          setInsights(null);
          setReviewError("口コミ・難易度データを取得できませんでした。DBマイグレーション適用後に再度お試しください。");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [courseCode, university]);

  // 並び替え済みの口コミ
  const sortedReviews = useMemo(() => {
    const arr = [...reviews];
    switch (sortKey) {
      case "rating":
        return arr.sort((a, b) => b.rating - a.rating);
      case "helpful":
        return arr.sort((a, b) => b.helpfulCount - a.helpfulCount);
      default:
        return arr.sort((a, b) => b.date.localeCompare(a.date));
    }
  }, [reviews, sortKey]);

  // サイドバー用の口コミ集計
  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => Math.round(r.rating) === star).length,
    }));
    const features = [...new Set(reviews.flatMap((r) => r.tags))];
    return { total, avg, dist, features };
  }, [reviews]);

  const handlePostReview = () => {
    navigate(path(`/class/${courseCode}/review`));
  };

  // 授業方法（数字コード→日本語ラベル）と講義形式（備考から判定）のバッジ
  const methodLabel = course ? getMethodLabel(course.method) : null;
  const classFormats = course ? getClassFormats(course.remarks) : [];

  const syllabusPresentation = useMemo(() => {
    if (university?.slug === "osaka") {
      const externalUrl = course?.syllabus_url?.trim() || KOAN_SYLLABUS_PORTAL_URL;
      return {
        mode: "external" as const,
        url: externalUrl,
        description:
          "大阪大学 KOAN 外部シラバスで確認できます（ログインが必要です）。",
      };
    }

    const record = course as (CatalogCourse & Record<string, unknown>) | null;
    const candidates = [
      record?.["syllabus_url"],
      record?.["syllabusUrl"],
      record?.["syllabus_url_link"],
      record?.["url"],
      record?.["pdf_url"],
    ];

    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) {
        return {
          mode: "embed" as const,
          url: value,
          description:
            "筑波大学の教育課程編成支援システムの内容を表示します。",
        };
      }
    }

    const fallbackCode = course?.course_number ?? courseCode;
    if (fallbackCode) {
      return {
        mode: "embed" as const,
        url: `https://kdb.tsukuba.ac.jp/syllabi/2026/${fallbackCode}/jpn`,
        description:
          "筑波大学の教育課程編成支援システムの内容を表示します。",
      };
    }

    return null;
  }, [course, courseCode, university?.slug]);

  const syllabusSummary = useMemo(() => {
    const targetYear = course?.target_year?.trim();
    const targetYearLabel = targetYear
      ? `対象学年：${targetYear}${targetYear.endsWith("年") ? "" : "年"}`
      : null;
    const parts = [course?.overview, course?.remarks, targetYearLabel].filter(
      (value): value is string => Boolean(value && value.trim())
    );
    return parts.join("\n\n");
  }, [course]);

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        {loading && <p className="classStatus">読み込み中...</p>}
        {error && <p className="classStatus classStatusError">{error}</p>}

        {!loading && !error && !course && (
          <div className="classDetailNotFound">
            <p className="classStatus">
              該当する講義が見つかりませんでした（講義番号：{courseCode}）。
            </p>
            <Link to={path("/class")} className="classDetailBackLink">
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
                    {reviewError && <p className="classStatus classStatusError">{reviewError}</p>}
                    {sortedReviews.length === 0 && !reviewError ? (
                      <p className="classStatus">まだ口コミがありません。最初の口コミを投稿してみませんか？</p>
                    ) : (
                      sortedReviews.map((review) => (
                        <ClassReviewCard review={review} courseCode={courseCode ?? ""} key={review.id} />
                      ))
                    )}
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

                  <section className="sidebarCard courseDifficultyCard">
                    <h2>授業の難易度</h2>
                    <div className="courseDifficultyRows">
                      <p>
                        <span>難易度</span>
                        <strong>{insights?.difficultyLabel ?? "データ不足"}</strong>
                      </p>
                      <p>
                        <span>課題量</span>
                        <strong>{insights?.workloadLabel ?? "データ不足"}</strong>
                      </p>
                    </div>
                    <small>
                      口コミ{insights?.difficultySampleCount ?? 0}件と匿名統計をもとに表示しています。
                    </small>
                  </section>

                  <CreditRateCard
                    rate={insights?.creditRate ?? undefined}
                    confidenceLabel={insights?.confidenceLabel ?? "不足"}
                    sampleCount={insights?.sampleCount ?? 0}
                    highlightLabel={insights?.highlightLabel ?? "データ不足"}
                    distribution={insights?.gradeDistribution ?? []}
                  />

                  <section className="sidebarCard">
                    <h2>この授業の特徴</h2>
                    <div className="sidebarFeatures">
                      {stats.features.length === 0 ? (
                        <p className="sidebarEmptyText">口コミが集まると特徴タグが表示されます。</p>
                      ) : (
                        stats.features.map((feature) => (
                          <FeatureTag label={feature} key={feature} />
                        ))
                      )}
                    </div>
                  </section>

                  {university?.slug !== "osaka" && (
                    <section className="sidebarCard">
                      <h2>関連授業</h2>
                      <ul className="sidebarRelated">
                        {mockRelatedCourses.map((related) => (
                          <li key={related.code}>
                            <Link to={path(`/class/${related.code}`)}>
                              {related.title}
                            </Link>
                            <span>{related.code}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </aside>
              </div>
            ) : (
              <div className="classDetailSyllabus">
                <div className="classDetailSyllabusCard">
                  <div className="classDetailSyllabusHeader">
                    <div>
                      <h2>シラバス</h2>
                      <p>{syllabusPresentation?.description ?? "シラバス情報は準備中です。"}</p>
                    </div>
                  </div>

                  {syllabusPresentation?.mode === "embed" ? (
                    <>
                      {syllabusSummary && (
                        <div className="classDetailSyllabusSummary">
                          <h3>講義概要</h3>
                          <p>{syllabusSummary}</p>
                        </div>
                      )}
                      <iframe
                        src={syllabusPresentation.url}
                        title={`${course?.course_name ?? "講義"} のシラバス`}
                        className="classDetailSyllabusFrame"
                        loading="lazy"
                      />
                    </>
                  ) : syllabusPresentation?.mode === "external" ? (
                    <div className="classDetailSyllabusPlaceholder">
                      {syllabusSummary && (
                        <div className="classDetailSyllabusSummary">
                          <h3>講義概要</h3>
                          <p>{syllabusSummary}</p>
                        </div>
                      )}
                      <p>
                        このページ内ではシラバス全文を表示できません。KOAN
                        外部シラバスからご確認ください。
                      </p>
                      <a
                        href={syllabusPresentation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="classDetailBackLink"
                      >
                        KOAN外部シラバスを開く
                      </a>
                    </div>
                  ) : (
                    <div className="classDetailSyllabusPlaceholder">
                      <p>シラバス情報を取得できませんでした。</p>
                      {syllabusSummary && <p>{syllabusSummary}</p>}
                    </div>
                  )}
                </div>
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
