import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUniversity } from "../components/university/universityContextValue";
import {
  CalendarDays,
  ChevronDown,
  Flame,
  IdCard,
  Scale,
  Send,
  ShieldCheck,
  Sprout,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import RatingStarsInput from "../components/class/RatingStarsInput";
import { mockCircles } from "../components/circle/mockCircles";
import { createCircleReview } from "../services/circleReviewService";
import commentIcon from "../assets/class/Comment.svg";
import "../styles/class/Class.css";
import "../styles/class/ClassDetail.css";
import "../styles/class/ClassReviewForm.css";
import "../styles/circle/CircleReviewForm.css";

// 任意項目の選択肢（口コミDBのマスタ設計が決まるまではフロントの定数として固定）
const activityFrequencyOptions = ["週1回未満", "週1〜2回", "週3〜4回", "ほぼ毎日"];
const intensityOptions = ["エンジョイ", "ほどほど", "本格的（大会・発表あり）"];
const annualCostOptions = ["ほぼかからない", "1万円未満", "1〜3万円", "3万円以上"];
const beginnerFriendlyOptions = ["入りやすい", "普通", "経験者向け"];
const compatibilityOptions = ["しやすい", "普通", "しにくい"];
const reviewerStatusOptions = ["現役メンバー", "元メンバー", "見学・体験のみ"];

// コメント上限。授業側と同じ仮の1000字
const COMMENT_MAX = 1000;

type CircleReviewDraft = {
  rating: number;
  activityFrequency: string;
  intensity: string;
  annualCost: string;
  beginnerFriendly: string;
  compatibility: string;
  reviewerStatus: string;
  comment: string;
  anonymous: boolean;
};

function CircleReviewForm() {
  const { university, path } = useUniversity();
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const circle = mockCircles.find((item) => item.id === circleId);

  // フォーム状態
  const [rating, setRating] = useState(0);
  const [activityFrequency, setActivityFrequency] = useState("");
  const [intensity, setIntensity] = useState("");
  const [annualCost, setAnnualCost] = useState("");
  const [beginnerFriendly, setBeginnerFriendly] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [reviewerStatus, setReviewerStatus] = useState("");
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true); // デフォルトON
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 下書きは React の状態として一時保持するのみ（永続化は後日実装）
  const [, setDraft] = useState<CircleReviewDraft | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const commentTooLong = comment.length > COMMENT_MAX;

  const currentValues = (): CircleReviewDraft => ({
    rating,
    activityFrequency,
    intensity,
    annualCost,
    beginnerFriendly,
    compatibility,
    reviewerStatus,
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
      await createCircleReview({
        circleId: circleId ?? "",
        ...currentValues(),
      }, university?.id ?? "");
      navigate(path(`/circles/${circleId}`), {
        state: { toast: "口コミの投稿に成功しました！" },
      });
    } catch {
      setSubmitError("口コミを投稿できませんでした。DBテーブル作成後に再度お試しください。");
      setSubmitting(false);
    }
  };

  // セレクト1つ分（アイコン＋ラベル＋任意バッジ＋プルダウン）
  const renderSelect = (
    label: string,
    Icon: typeof CalendarDays,
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
    <div className="classPage circleReviewFormPage">
      <Globalnav />
      <main className="classPageLayout">
        {!circle && (
          <div className="classDetailNotFound">
            <p className="classStatus">
              該当するサークルが見つかりませんでした（ID：{circleId}）。
            </p>
            <Link to={path("/circles/search")} className="classDetailBackLink">
              サークル検索へ戻る
            </Link>
          </div>
        )}

        {circle && (
          <>
            <p className="classBreadcrumb">
              <Link to={path()} className="classBreadcrumbLink">
                ホーム
              </Link>{" "}
              &gt; サークル・課外活動 &gt;{" "}
              <Link to={path(`/circles/${circle.id}`)} className="classBreadcrumbLink">
                {circle.name}
              </Link>{" "}
              &gt; 口コミ投稿
            </p>

            {/* サークルの簡易情報カード（授業側の講義概要カードと同じ構成・ボタンなし） */}
            <section className="classDetailInfoCard reviewFormCourseCard">
              <div className="classDetailInfoMain">
                <h1 className="classDetailTitle">{circle.name}</h1>
                <p className="classDetailCode">{circle.category}</p>
                <p className="classDetailTeacher">
                  <ShieldCheck aria-hidden="true" />
                  <span>{circle.organizationType}</span>
                  <small>団体</small>
                </p>
                <div className="classDetailBadges">
                  <span className="classDetailTermBadge">{circle.detail.activityDays}</span>
                  <span>{circle.detail.activityPlace}</span>
                  <span>部員{circle.members}</span>
                  <span>会費：{circle.fee}</span>
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
                    "活動頻度",
                    CalendarDays,
                    activityFrequencyOptions,
                    activityFrequency,
                    setActivityFrequency
                  )}
                  {renderSelect(
                    "活動の熱量",
                    Flame,
                    intensityOptions,
                    intensity,
                    setIntensity
                  )}
                  {renderSelect(
                    "年間の費用",
                    Wallet,
                    annualCostOptions,
                    annualCost,
                    setAnnualCost
                  )}
                  {renderSelect(
                    "初心者の入りやすさ",
                    Sprout,
                    beginnerFriendlyOptions,
                    beginnerFriendly,
                    setBeginnerFriendly
                  )}
                  {renderSelect(
                    "兼サー・バイトとの両立",
                    Scale,
                    compatibilityOptions,
                    compatibility,
                    setCompatibility
                  )}
                  {renderSelect(
                    "投稿者の立場",
                    IdCard,
                    reviewerStatusOptions,
                    reviewerStatus,
                    setReviewerStatus
                  )}
                </div>

                <div className="reviewFormField">
                  <p className="reviewFormLabel">
                    コメント
                    <span className="reviewFormOptional">任意</span>
                  </p>
                  <textarea
                    className="reviewFormTextarea"
                    placeholder="サークルの雰囲気や活動内容、新歓の様子、おすすめの理由などを書いてください"
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

export default CircleReviewForm;
