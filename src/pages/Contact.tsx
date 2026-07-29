import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  Clock,
  MessageCircleQuestion,
  TriangleAlert,
  X,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import searchIllust from "../assets/NotFound/SearchIllust.svg";
import "../styles/contact/Contact.css";

// お問合せ種別（順序も仕様どおり）
const inquiryTypes = [
  { value: "feature", label: "機能について" },
  { value: "bug", label: "不具合の報告" },
  { value: "request", label: "ご要望・改善提案" },
  { value: "other", label: "その他" },
];

// 区分（ラジオボタン・横並び）
const affiliations = ["筑波大生", "筑波大学教員・職員", "その他"];

const MESSAGE_MAX = 2000;

type FormErrors = Partial<
  Record<"name" | "email" | "affiliation" | "inquiryType" | "message" | "agreed", string>
>;

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  // モーダル表示中は ESC キーで閉じる
  useEffect(() => {
    if (!isPolicyOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPolicyOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPolicyOpen]);

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();

    const next: FormErrors = {};
    if (!name.trim()) next.name = "お名前を入力してください";
    if (!email.trim()) {
      next.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "メールアドレスの形式が正しくありません";
    }
    if (!affiliation) next.affiliation = "区分を選択してください";
    if (!inquiryType) next.inquiryType = "お問合せ種別を選択してください";
    if (!message.trim()) next.message = "お問い合わせ内容を入力してください";
    if (!agreed) next.agreed = "プライバシーポリシーへの同意が必要です";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // バリデーション通過：入力欄をリセットして受付完了ボックスを表示
    setName("");
    setEmail("");
    setAffiliation("");
    setInquiryType("");
    setMessage("");
    setAgreed(false);
    setSubmitted(true);
  };

  return (
    <div className="contactPage">
      <Globalnav />
      <main className="contactPageLayout">
        <p className="contactBreadcrumb">
          <Link to="/" className="contactBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt; お問い合わせ
        </p>

        {/* 見出しエリア */}
        <div className="contactHeading">
          <p className="contactEyebrow">CONTACT</p>
          <h1 className="contactTitle">お問い合わせ</h1>
          <p className="contactLead">
            TsukuHubへのご質問・ご要望・不具合のご報告はこちらから。
            <br />
            内容を確認のうえ、担当者よりご入力のメールアドレスへご返信いたします。
          </p>
        </div>

        <div className="contactColumns">
          {/* 左カラム：入力フォームカード */}
          <form className="contactFormCard" onSubmit={handleSubmit} noValidate>
            <div className="contactField">
              <label className="contactLabel" htmlFor="contact-name">
                お名前<span className="contactRequired">*</span>
              </label>
              <div className="contactControl">
                <input
                  id="contact-name"
                  type="text"
                  className="contactInput"
                  placeholder="例）筑波 太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="contactError">{errors.name}</p>}
              </div>
            </div>

            <div className="contactField">
              <label className="contactLabel" htmlFor="contact-email">
                メールアドレス<span className="contactRequired">*</span>
              </label>
              <div className="contactControl">
                <input
                  id="contact-email"
                  type="email"
                  className="contactInput"
                  placeholder="メールアドレスを入力してください"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="contactError">{errors.email}</p>}
              </div>
            </div>

            <div className="contactField">
              <span className="contactLabel">
                区分<span className="contactRequired">*</span>
              </span>
              <div className="contactControl">
                <div className="contactRadioGroup">
                  {affiliations.map((option) => (
                    <label className="contactRadioLabel" key={option}>
                      <input
                        type="radio"
                        name="affiliation"
                        value={option}
                        checked={affiliation === option}
                        onChange={(e) => setAffiliation(e.target.value)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.affiliation && (
                  <p className="contactError">{errors.affiliation}</p>
                )}
              </div>
            </div>

            <div className="contactField">
              <label className="contactLabel" htmlFor="contact-type">
                お問合せ種別<span className="contactRequired">*</span>
              </label>
              <div className="contactControl">
                <div className="contactSelectWrap">
                  <select
                    id="contact-type"
                    className={`contactSelect${inquiryType === "" ? " isPlaceholder" : ""}`}
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                  >
                    <option value="" disabled>
                      選択してください
                    </option>
                    {inquiryTypes.map((t) => (
                      <option value={t.value} key={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="contactSelectChevron" aria-hidden="true" />
                </div>
                {errors.inquiryType && (
                  <p className="contactError">{errors.inquiryType}</p>
                )}
              </div>
            </div>

            <div className="contactFieldBlock">
              <label className="contactLabel" htmlFor="contact-message">
                お問い合わせ内容<span className="contactRequired">*</span>
              </label>
              <div className="contactTextareaWrap">
                <textarea
                  id="contact-message"
                  className="contactTextarea"
                  placeholder="具体的なお問い合わせ内容をご記入ください。不具合の場合は、発生した操作・端末・ブラウザなども併せてご記入いただけると助かります。"
                  maxLength={MESSAGE_MAX}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <span className="contactCounter">
                  {message.length}/{MESSAGE_MAX}
                </span>
              </div>
              {errors.message && <p className="contactError">{errors.message}</p>}
            </div>

            <div className="contactAgreeRow">
              <label className="contactAgreeLabel">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>
                  <button
                    type="button"
                    className="contactPolicyLink"
                    onClick={() => setIsPolicyOpen(true)}
                  >
                    プライバシーポリシー
                  </button>
                  に同意します（個人情報の取り扱いについて）
                </span>
              </label>
              {errors.agreed && <p className="contactError">{errors.agreed}</p>}
            </div>

            <div className="contactSubmitRow">
              <button type="submit" className="contactSubmitBtn">
                送信する
              </button>
            </div>
          </form>

          {/* 右カラム：案内サイドバーカード */}
          <aside className="contactSidebar">
            <div className="contactSidebarIllust">
              <img src={searchIllust} alt="" aria-hidden="true" />
            </div>
            <h2 className="contactSidebarTitle">お問い合わせについて</h2>

            <div className="contactSidebarItem">
              <p className="contactSidebarItemTitle">
                <Clock className="contactSidebarIcon" aria-hidden="true" />
                回答までの目安
              </p>
              <p className="contactSidebarItemBody">
                通常、2〜3週間以内にご返信します
              </p>
            </div>

            <div className="contactSidebarItem">
              <p className="contactSidebarItemTitle">
                <MessageCircleQuestion
                  className="contactSidebarIcon"
                  aria-hidden="true"
                />
                よくあるお問い合わせ
              </p>
              <p className="contactSidebarItemBody">
                <Link to="/faq" className="contactFaqTextLink">
                  FAQページ
                </Link>
                もあわせてご確認ください
              </p>
            </div>

            <div className="contactSidebarItem">
              <p className="contactSidebarItemTitle">
                <TriangleAlert className="contactSidebarIcon" aria-hidden="true" />
                ご注意事項
              </p>
              <ul className="contactSidebarNotes">
                <li>内容によっては回答にお時間をいただく場合があります</li>
                <li>土日祝日や長期休業期間中は、返信が遅れる場合があります</li>
              </ul>
            </div>

            <Link to="/faq" className="contactFaqBtn">
              よくある質問（FAQ）へ
            </Link>
          </aside>
        </div>

        {/* 受付完了（送信後のみ表示・全幅） */}
        {submitted && (
          <div className="contactSuccessBox" role="status">
            <span className="contactSuccessBadge">
              <Check aria-hidden="true" />
            </span>
            <div>
              <p className="contactSuccessTitle">お問合せを受け付けました</p>
              <p className="contactSuccessBody">
                ご入力いただいたメールアドレスへ自動返信メールをお送りしました。
                <br />
                内容をご確認のうえ、担当者より改めてご連絡いたします。
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />

      {/* プライバシーポリシーのモーダル */}
      {isPolicyOpen && (
        <div
          className="contactModalOverlay"
          onClick={() => setIsPolicyOpen(false)}
        >
          <div
            className="contactModalPanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-policy-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="contactModalClose"
              aria-label="閉じる"
              onClick={() => setIsPolicyOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
            <h2 className="contactModalTitle" id="contact-policy-title">
              プライバシーポリシー
            </h2>
            {/* TODO: 本文は正式なプライバシーポリシー文面に差し替える */}
            <div className="contactModalBody">
              <p>
                TsukuHub（以下「当サイト」）は、お問い合わせフォームにご入力いただいた個人情報を、お問い合わせへの回答および本人確認の目的にのみ利用します。
              </p>
              <p>
                取得した個人情報は、ご本人の同意がある場合または法令に基づく場合を除き、第三者に提供しません。
              </p>
              <p>
                ※ この文章はプレースホルダです。正式なプライバシーポリシー文面に差し替えてください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contact;
