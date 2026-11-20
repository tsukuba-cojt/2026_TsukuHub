import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  Clock,
  Hourglass,
  ImagePlus,
  MapPin,
  Armchair,
  Scale,
  Send,
  TriangleAlert,
  Volume2,
  Wallet,
  X,
} from "lucide-react";
import { useUniversity } from "../components/university/universityContextValue";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import RatingStarsInput from "../components/class/RatingStarsInput";
import { mockCafeterias, paymentLabels, paymentMethods } from "../components/life/mockCafeterias";
import commentIcon from "../assets/class/Comment.svg";
import "../styles/class/Class.css";
import "../styles/class/ClassDetail.css";
import "../styles/class/ClassReviewForm.css";
import "../styles/circle/CircleReviewForm.css";
import "../styles/life/CafeteriaReviewForm.css";

// 任意項目の選択肢（Google マップの飲食店口コミ「1人あたりの料金」「待ち時間」「騒音レベル」を参考に学食向けへ調整）。
// 混雑は「待ち時間」「席の空き具合」「騒がしさ」に分けて聞き、いつの情報かを「利用した時間帯」で補う。
const visitTimeOptions = ["〜11時", "11時〜12時", "12時〜13時", "13時〜17時", "17時以降"];
const spendOptions = ["〜300円", "300〜500円", "500〜700円", "700〜1,000円", "1,000円以上"];
const priceFeelingOptions = ["安い", "妥当", "高い"];
const waitTimeOptions = ["待ち時間なし", "5分未満", "5〜10分", "10〜20分", "20分以上"];
const seatOptions = ["すぐ座れた", "少し探した", "座れなかった", "テイクアウトのみ"];
const noiseOptions = ["静か", "普通", "にぎやか"];

const COMMENT_MAX = 1000;
const PHOTO_MAX = 4;

type CafeteriaReviewPhoto = {
  file: File;
  url: string;
};

type CafeteriaReviewDraft = {
  rating: number;
  visitTime: string;
  spend: string;
  priceFeeling: string;
  waitTime: string;
  seat: string;
  noise: string;
  comment: string;
  photos: File[];
  anonymous: boolean;
};

function CafeteriaReviewForm() {
  const { path } = useUniversity();
  const { cafeteriaId } = useParams<{ cafeteriaId: string }>();
  const navigate = useNavigate();
  const cafeteria = mockCafeterias.find((item) => item.id === cafeteriaId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState(0);
  const [visitTime, setVisitTime] = useState("");
  const [spend, setSpend] = useState("");
  const [priceFeeling, setPriceFeeling] = useState("");
  const [waitTime, setWaitTime] = useState("");
  const [seat, setSeat] = useState("");
  const [noise, setNoise] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<CafeteriaReviewPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  // 下書きは React の状態として一時保持するのみ（永続化は後日実装）
  const [, setDraft] = useState<CafeteriaReviewDraft | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const commentTooLong = comment.length > COMMENT_MAX;

  // プレビュー用の Object URL はページを離れるときにまとめて解放する
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  const currentValues = (): CafeteriaReviewDraft => ({
    rating,
    visitTime,
    spend,
    priceFeeling,
    waitTime,
    seat,
    noise,
    comment,
    photos: photos.map((photo) => photo.file),
    anonymous,
  });

  const handleAddPhotos = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    const room = PHOTO_MAX - photos.length;
    setPhotoError(
      images.length > room ? `写真は${PHOTO_MAX}枚までアップロードできます` : null,
    );
    const added = images.slice(0, Math.max(room, 0)).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((current) => [...current, ...added]);
  };

  const handleRemovePhoto = (url: string) => {
    URL.revokeObjectURL(url);
    setPhotos((current) => current.filter((photo) => photo.url !== url));
    setPhotoError(null);
  };

  const handleSaveDraft = () => {
    setDraft(currentValues());
    setDraftSavedAt(new Date().toLocaleTimeString());
  };

  const handleSubmit = () => {
    if (rating === 0) {
      setRatingError("おすすめ度を選択してください");
      return;
    }
    if (commentTooLong) return;
    setRatingError(null);
    // 学食口コミの保存先（DBテーブル・写真ストレージ）は未作成のため、送信は行わない
    setSubmitNotice("学食の口コミ保存は準備中です。入力内容はまだ送信されていません。");
  };

  const renderSelect = (
    label: string,
    Icon: typeof Clock,
    options: string[],
    value: string,
    onChange: (v: string) => void,
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
          aria-label={label}
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

  const availablePayments = cafeteria
    ? paymentMethods.filter((method) => cafeteria.payments[method]).map((method) => paymentLabels[method])
    : [];

  return (
    <div className="classPage circleReviewFormPage">
      <Globalnav />
      <main className="classPageLayout">
        {!cafeteria && (
          <div className="classDetailNotFound">
            <p className="classStatus">
              該当する施設が見つかりませんでした（ID：{cafeteriaId}）。
            </p>
            <Link to={path("/life/cafeteria")} className="classDetailBackLink">
              学食情報へ戻る
            </Link>
          </div>
        )}

        {cafeteria && (
          <>
            <p className="classBreadcrumb">
              <Link to={path()} className="classBreadcrumbLink">
                ホーム
              </Link>{" "}
              &gt;{" "}
              <Link to={path("/life")} className="classBreadcrumbLink">
                生活・便利情報
              </Link>{" "}
              &gt;{" "}
              <Link
                to={path("/life/cafeteria")}
                state={{ cafeteriaId: cafeteria.id }}
                className="classBreadcrumbLink"
              >
                学食情報
              </Link>{" "}
              &gt; {cafeteria.name} &gt; 口コミ投稿
            </p>

            {/* 施設の簡易情報カード（講義・サークルの口コミ投稿ページと同じ構成） */}
            <section className="classDetailInfoCard reviewFormCourseCard">
              <div className="classDetailInfoMain">
                <h1 className="classDetailTitle">{cafeteria.name}</h1>
                <p className="classDetailCode">
                  {cafeteria.category}・{cafeteria.area}
                </p>
                <p className="classDetailTeacher">
                  <MapPin aria-hidden="true" />
                  <span>{cafeteria.location}</span>
                </p>
                <div className="classDetailBadges">
                  {cafeteria.hours.lines.map((line, index) => (
                    <span className={index === 0 ? "classDetailTermBadge" : undefined} key={line}>
                      {line}
                    </span>
                  ))}
                  {availablePayments.length > 0 && (
                    <span>{availablePayments.join("・")}可</span>
                  )}
                </div>
              </div>
            </section>

            <section className="reviewFormPanel">
              <div className="reviewFormHeading">
                <img src={commentIcon} alt="" aria-hidden="true" />
                <h2>口コミを投稿する</h2>
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
                  {ratingError && <p className="reviewFormError">{ratingError}</p>}
                </div>

                <div className="reviewFormGrid">
                  {renderSelect("利用した時間帯", Clock, visitTimeOptions, visitTime, setVisitTime)}
                  {renderSelect("1人あたりの金額", Wallet, spendOptions, spend, setSpend)}
                  {renderSelect("値段の満足度", Scale, priceFeelingOptions, priceFeeling, setPriceFeeling)}
                  {renderSelect("待ち時間", Hourglass, waitTimeOptions, waitTime, setWaitTime)}
                  {renderSelect("席の空き具合", Armchair, seatOptions, seat, setSeat)}
                  {renderSelect("騒がしさ", Volume2, noiseOptions, noise, setNoise)}
                </div>

                <div className="reviewFormField">
                  <p className="reviewFormLabel">
                    コメント
                    <span className="reviewFormOptional">任意</span>
                  </p>
                  <textarea
                    className="reviewFormTextarea"
                    placeholder="おすすめのメニューや味・量、混雑する時間帯、利用するときのコツなどを書いてください"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <p className={`reviewFormCounter${commentTooLong ? " isOver" : ""}`}>
                    {comment.length}/{COMMENT_MAX}
                  </p>
                  {commentTooLong && (
                    <p className="reviewFormError">コメントは{COMMENT_MAX}字以内で入力してください</p>
                  )}
                </div>

                <div className="reviewFormField">
                  <p className="reviewFormLabel">
                    写真
                    <span className="reviewFormOptional">任意</span>
                  </p>
                  <div className="cafeteriaReviewPhotos">
                    {photos.map((photo, index) => (
                      <div className="cafeteriaReviewPhoto" key={photo.url}>
                        <img src={photo.url} alt={`アップロードする写真${index + 1}`} />
                        <button
                          type="button"
                          className="cafeteriaReviewPhotoRemove"
                          aria-label={`写真${index + 1}を削除`}
                          onClick={() => handleRemovePhoto(photo.url)}
                        >
                          <X aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                    {photos.length < PHOTO_MAX && (
                      <button
                        type="button"
                        className="cafeteriaReviewPhotoAdd"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus aria-hidden="true" />
                        写真を追加
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => {
                        handleAddPhotos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <p className="cafeteriaReviewPhotoNote">
                    料理やメニュー表などの写真を{PHOTO_MAX}枚まで追加できます（人の顔が写らないようご注意ください）
                  </p>
                  {photoError && <p className="reviewFormError">{photoError}</p>}
                </div>
              </div>

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
                  <li>他の利用者や店員さんの顔が写った写真は投稿しないでください</li>
                </ul>
                <p className="reviewFormGuidelineNote">
                  ※ガイドラインに違反する投稿は、運営により削除される場合があります
                </p>
              </div>

              <div className="reviewFormActions">
                {submitNotice && <p className="reviewFormError">{submitNotice}</p>}
                <button type="button" className="reviewFormCancelBtn" onClick={() => navigate(-1)}>
                  キャンセル
                </button>
                <div className="reviewFormActionsRight">
                  {draftSavedAt && (
                    <span className="reviewFormDraftNote">
                      下書きを保存しました（{draftSavedAt}・このページ表示中のみ）
                    </span>
                  )}
                  <button type="button" className="reviewFormDraftBtn" onClick={handleSaveDraft}>
                    下書き保存
                  </button>
                  <button
                    type="button"
                    className="reviewFormSubmitBtn"
                    disabled={rating === 0 || commentTooLong}
                    onClick={handleSubmit}
                  >
                    <Send aria-hidden="true" />
                    口コミを投稿する
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

export default CafeteriaReviewForm;
