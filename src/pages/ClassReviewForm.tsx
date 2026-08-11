import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  BookMarked,
  ChartColumnBig,
  ChevronDown,
  Laptop,
  LibraryBig,
  Megaphone,
  NotebookPen,
  Send,
  TriangleAlert,
  User,
  UsersRound,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import RatingStarsInput from "../components/class/RatingStarsInput";
import { createClassReview } from "../services/classReviewService";
import {
  getClassFormats,
  getMethodLabel,
} from "../components/class/courseBadges";
import commentIcon from "../assets/class/Comment.svg";
import "../styles/class/Class.css";
import "../styles/class/ClassDetail.css";
import "../styles/class/ClassReviewForm.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// coursesテーブルの行の型（ClassDetail.tsx と同じ形。共通化は後日検討）
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

// 任意項目の選択肢（口コミDBのマスタ設計が決まるまではフロントの定数として固定）
const lectureFormatOptions = [
  "対面",
  "対面（オンライン併用）",
  "オンライン（同時双方向）",
  "オンライン（オンデマンド）",
];

const testFormatOptions = [
  "対面（持ち込みあり）",
  "対面（持ち込みなし）",
  "オンライン（時間指定あり、閲覧あり）",
  "オンライン（時間指定あり、閲覧なし）",
  "オンライン（時間指定なし、閲覧あり）",
  "オンライン（時間指定なし、閲覧なし）",
  "なし",
];

const difficultyOptions = ["とても難しい", "難しい", "普通", "簡単", "とても簡単"];
const workloadOptions = ["とても多い", "多い", "普通", "少ない", "とても少ない"];
const attendanceOptions = ["毎回ある", "時々ある", "ない"];
const pastExamOptions = ["過去問あり（有効）", "過去問あり（無効）", "過去問なし"];

// コメント上限。DB設計時に確定させる（現状は仮の1000字）
const COMMENT_MAX = 1000;

type ReviewDraft = {
  rating: number;
  lectureFormat: string;
  testFormat: string;
  difficulty: string;
  workload: string;
  attendance: string;
  pastExam: string;
  comment: string;
  anonymous: boolean;
};

function ClassReviewForm() {
  const { courseCode } = useParams<{ courseCode: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フォーム状態
  const [rating, setRating] = useState(0);
  const [lectureFormat, setLectureFormat] = useState("");
  const [testFormat, setTestFormat] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [workload, setWorkload] = useState("");
  const [attendance, setAttendance] = useState("");
  const [pastExam, setPastExam] = useState("");
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true); // デフォルトON
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 下書きは React の状態として一時保持するのみ（永続化は後日実装）
  const [, setDraft] = useState<ReviewDraft | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

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

  const commentTooLong = comment.length > COMMENT_MAX;

  const currentValues = (): ReviewDraft => ({
    rating,
    lectureFormat,
    testFormat,
    difficulty,
    workload,
    attendance,
    pastExam,
    comment,
    anonymous,
  });

  const handleSaveDraft = () => {
    // ダミー実装：Reactの状態として保持するのみ（DB・localStorageへは保存しない）
    setDraft(currentValues());
    setDraftSavedAt(new Date().toLocaleTimeString());
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setRatingError("おすすめ度を選択してください");
      return;
    }
    if (commentTooLong) return;
    setRatingError(null);
    setSubmitError(null);
    setSubmitting(true);

    try {
      await createClassReview({
        courseCode: courseCode ?? "",
        ...currentValues(),
      });
      navigate(`/class/${courseCode}`, {
        state: { toast: "口コミの投稿に成功しました！" },
      });
    } catch {
      setSubmitError("口コミを投稿できませんでした。DBマイグレーション適用後に再度お試しください。");
      setSubmitting(false);
    }
  };

  // 講義形式のアイコン：「対面」を含む→UsersRound／「オンライン」を含む→Laptop
  const LectureFormatIcon = lectureFormat.includes("対面")
    ? UsersRound
    : lectureFormat.includes("オンライン")
      ? Laptop
      : UsersRound;

  const methodLabel = course ? getMethodLabel(course.method) : null;
  const classFormats = course ? getClassFormats(course.remarks) : [];

  // セレクト1つ分（アイコン＋ラベル＋任意バッジ＋プルダウン）
  const renderSelect = (
    label: string,
    Icon: typeof NotebookPen,
    options: string[],
    value: string,
    onChange: (v: string) => void
  ) => (
    <div className="reviewFormField">
      <p className="reviewFormLabel">
        {label}
        <span className="reviewFormOptional">任意</span>
      </p>
      <div className="reviewFormSelectWrap">
        <Icon className="reviewFormSelectIcon" aria-hidden="true" />
        <select
          className={`reviewFormSelect${value === "" ? " isPlaceholder" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">未選択</option>
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="reviewFormSelectChevron" aria-hidden="true" />
      </div>
    </div>
  );

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
          &gt;{" "}
          {course ? (
            <Link to={`/class/${course.course_number}`} className="classBreadcrumbLink">
              {course.course_name}
            </Link>
          ) : (
            "講義詳細"
          )}{" "}
          &gt; 口コミ投稿
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
          <>
            {/* 講義の簡易情報カード（詳細ページのヘッダーカードと同等・ボタンなし） */}
            <section className="classDetailInfoCard reviewFormCourseCard">
              <div className="classDetailInfoMain">
                <h1 className="classDetailTitle">{course.course_name}</h1>
                <p className="classDetailCode">{course.course_number}</p>
                <p className="classDetailTeacher">
                  <User aria-hidden="true" />
                  <span>{course.instructor}</span>
                  <small>先生</small>
                </p>
                <div className="classDetailBadges">
                  <span className="classDetailTermBadge">{course.semester}</span>
                  <span>{course.schedule}</span>
                  <span>{course.credits}単位</span>
                  {methodLabel && <span>{methodLabel}</span>}
                  {classFormats.map((format) => (
                    <span key={format}>{format}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* 口コミ投稿フォーム */}
            <section className="reviewFormPanel">
              <div className="reviewFormHeading">
                <img src={commentIcon} alt="" aria-hidden="true" />
                <h2>口コミを投稿する</h2>
              </div>

              {/* 内側スクロール領域（おすすめ度〜コメント欄） */}
              <div className="reviewFormScroll">
                <div className="reviewFormField">
                  <p className="reviewFormLabel">
                    おすすめ度
                    <span className="reviewFormRequired">必須</span>
                  </p>
                  <RatingStarsInput
                    value={rating}
                    onChange={(v) => {
                      setRating(v);
                      setRatingError(null);
                    }}
                  />
                  {ratingError && (
                    <p className="reviewFormError">{ratingError}</p>
                  )}
                </div>

                <div className="reviewFormGrid">
                  {renderSelect(
                    "講義形式",
                    LectureFormatIcon,
                    lectureFormatOptions,
                    lectureFormat,
                    setLectureFormat
                  )}
                  {renderSelect(
                    "テスト形式",
                    NotebookPen,
                    testFormatOptions,
                    testFormat,
                    setTestFormat
                  )}
                  {renderSelect(
                    "難易度",
                    ChartColumnBig,
                    difficultyOptions,
                    difficulty,
                    setDifficulty
                  )}
                  {renderSelect(
                    "課題量",
                    LibraryBig,
                    workloadOptions,
                    workload,
                    setWorkload
                  )}
                  {renderSelect(
                    "出席確認",
                    Megaphone,
                    attendanceOptions,
                    attendance,
                    setAttendance
                  )}
                  {renderSelect(
                    "過去問の有無",
                    BookMarked,
                    pastExamOptions,
                    pastExam,
                    setPastExam
                  )}
                </div>

                <div className="reviewFormField">
                  <p className="reviewFormLabel">
                    コメント
                    <span className="reviewFormOptional">任意</span>
                  </p>
                  <textarea
                    className="reviewFormTextarea"
                    placeholder="授業の雰囲気や難易度、テスト対策、おすすめの理由などを書いてください"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <p
                    className={`reviewFormCounter${commentTooLong ? " isOver" : ""}`}
                  >
                    {comment.length}/{COMMENT_MAX}
                  </p>
                  {commentTooLong && (
                    <p className="reviewFormError">
                      コメントは{COMMENT_MAX}字以内で入力してください
                    </p>
                  )}
                </div>
              </div>

              {/* ここから下はスクロール領域の外（常に表示） */}
              <label className="reviewFormAnonymous">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                匿名で投稿する
                <small>（学群・学年のみ表示されます）</small>
              </label>

              <div className="reviewFormGuideline">
                <p className="reviewFormGuidelineTitle">
                  <TriangleAlert aria-hidden="true" />
                  口コミ投稿ガイドライン
                </p>
                <ul>
                  <li>個人情報（氏名・連絡先など）を書かないでください</li>
                  <li>事実に基づいた内容を投稿してください</li>
                  <li>誹謗中傷や差別的な表現は行わないでください</li>
                  <li>他人の著作物の転載や引用はしないでください</li>
                </ul>
                <p className="reviewFormGuidelineNote">
                  ※ガイドラインに違反する投稿は、運営により削除される場合があります
                </p>
              </div>

              <div className="reviewFormActions">
                {submitError && <p className="reviewFormError">{submitError}</p>}
                <button
                  type="button"
                  className="reviewFormCancelBtn"
                  onClick={() => navigate(-1)}
                >
                  キャンセル
                </button>
                <div className="reviewFormActionsRight">
                  {draftSavedAt && (
                    <span className="reviewFormDraftNote">
                      下書きを保存しました（{draftSavedAt}・このページ表示中のみ）
                    </span>
                  )}
                  <button
                    type="button"
                    className="reviewFormDraftBtn"
                    onClick={handleSaveDraft}
                  >
                    下書き保存
                  </button>
                  <button
                    type="button"
                    className="reviewFormSubmitBtn"
                    disabled={rating === 0 || submitting || commentTooLong}
                    onClick={() => void handleSubmit()}
                  >
                    <Send aria-hidden="true" />
                    {submitting ? "投稿中..." : "口コミを投稿する"}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ClassReviewForm;
