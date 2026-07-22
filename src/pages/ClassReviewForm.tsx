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
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, setDraft] = useState<ReviewDraft | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // ユーザープロフィール
  const [userId, setUserId] = useState<string | null>(null);
  const [authorMajor, setAuthorMajor] = useState<string | null>(null);
  const [authorGrade, setAuthorGrade] = useState<number | null>(null);

  // [変更] 編集モード
  const [isEdit, setIsEdit] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);

  // マウント時にログインユーザーの profiles を取得
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("major, grade")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setAuthorMajor(data.major);
        setAuthorGrade(data.grade);
      }
    };

    fetchProfile();
  }, []);

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

  // [変更] userId と course の両方が揃ったら、既存レビューをチェック→あれば編集モード
  useEffect(() => {
    if (!userId || !course) return;

    const checkExisting = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("course_id", course.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setIsEdit(true);
        setExistingReviewId(data.id);
        // フォームをプリフィル
        setRating(data.rating);
        setLectureFormat(data.lecture_format ?? "");
        setTestFormat(data.test_format ?? "");
        setDifficulty(data.difficulty ?? "");
        setWorkload(data.workload ?? "");
        setAttendance(data.attendance ?? "");
        setPastExam(data.past_exam ?? "");
        setComment(data.comment ?? "");
      }
    };

    checkExisting();
  }, [userId, course]);

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
  });

  const handleSaveDraft = () => {
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
    setSubmitting(true);

    if (!userId) {
      setError("口コミを投稿するにはログインが必要です。");
      setSubmitting(false);
      return;
    }

    // [変更] 編集モードなら UPDATE、新規なら INSERT
    const payload = {
      rating,
      lecture_format: lectureFormat || null,
      test_format: testFormat || null,
      difficulty: difficulty || null,
      workload: workload || null,
      attendance: attendance || null,
      past_exam: pastExam || null,
      comment: comment || null,
      author_major: authorMajor,
      author_grade: authorGrade,
    };

    let submitError;

    if (isEdit && existingReviewId) {
      const { error: updateError } = await supabase
        .from("reviews")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existingReviewId);
      submitError = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("reviews")
        .insert({
          ...payload,
          course_id: course!.id,
          user_id: userId,
        });
      submitError = insertError;
    }

    if (submitError) {
      if (submitError.code === "23505") {
        setError("この講義にはすでに口コミを投稿済みです。");
      } else {
        setError(
          isEdit
            ? "更新に失敗しました。時間をおいて再度お試しください。"
            : "投稿に失敗しました。時間をおいて再度お試しください。"
        );
        console.error(submitError);
      }
      setSubmitting(false);
      return;
    }

    navigate(`/class/${courseCode}`, {
      state: {
        toast: isEdit
          ? "口コミを更新しました！"
          : "口コミの投稿に成功しました！",
      },
    });
  };

  const LectureFormatIcon = lectureFormat.includes("対面")
    ? UsersRound
    : lectureFormat.includes("オンライン")
      ? Laptop
      : UsersRound;

  const methodLabel = course ? getMethodLabel(course.method) : null;
  const classFormats = course ? getClassFormats(course.remarks) : [];

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
          {/* [変更] パンくずのラベルをモードで切り替え */}
          &gt; {isEdit ? "口コミ編集" : "口コミ投稿"}
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

            <section className="reviewFormPanel">
              <div className="reviewFormHeading">
                <img src={commentIcon} alt="" aria-hidden="true" />
                {/* [変更] 見出しをモードで切り替え */}
                <h2>{isEdit ? "口コミを編集する" : "口コミを投稿する"}</h2>
              </div>

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

              <p className="reviewFormAuthorNote">
                投稿者は「{authorMajor ?? "―"} {authorGrade != null ? `${authorGrade}年` : "―"}」と表示されます
              </p>

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
                    onClick={handleSubmit}
                  >
                    <Send aria-hidden="true" />
                    {/* [変更] ボタンラベルをモードで切り替え */}
                    {submitting
                      ? isEdit ? "更新中..." : "投稿中..."
                      : isEdit ? "口コミを更新する" : "口コミを投稿する"}
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