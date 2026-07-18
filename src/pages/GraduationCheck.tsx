import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { DragEvent } from "react";
import {
  ChevronDown,
  CircleQuestionMark,
  CloudUpload,
  GraduationCap,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import GraduationCheckConsentModal from "../components/class/GraduationCheckConsentModal";
import GraduationCheckCsvGuideModal from "../components/class/GraduationCheckCsvGuideModal";
import {
  checkGraduation,
  listSupportedRequirements,
  parseGradesCsv,
  resolveRequirementIds,
} from "../features/graduationCheck";
import type { RequirementId } from "../features/graduationCheck";
import "../styles/class/GraduationCheck.css";

// 学類・専攻の選択肢：新規登録ページ（Signup.tsx）の学群生（undergraduate）の
// 選択肢と同一リスト。卒業要件チェックは学士のみ対象のため大学院の選択肢は持たない。
// （Signup 側は他ページのためインライン定義のまま変更せず、ここに複製している。
//  共通データ化する際は両方をまとめて差し替えること。）
const undergraduateMajors = [
  "人文学類",
  "比較文化学類",
  "日本語・日本文化学類",
  "社会学類",
  "国際総合学類",
  "教育学類",
  "心理学類",
  "障害科学類",
  "生物学類",
  "生物資源学類",
  "地球学類",
  "数学類",
  "物理学類",
  "化学類",
  "応用理工学類",
  "工学システム学類",
  "社会工学類",
  "総合理工学類プログラム",
  "情報科学類",
  "情報メディア創成学類",
  "知識情報・図書館学類",
  "医学類",
  "看護学類",
  "医療科学類",
  "体育専門学群",
  "芸術専門学群",
];

// 入学年度：今年度から4年前まで（ダミー。年度切り替わりの厳密な扱いは本実装時に調整）
const currentYear = new Date().getFullYear();
const admissionYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

// 卒業要件チェック アップロードページ（/graduation-checker）
// CSVのパース・要件判定はクライアント内で完結する（features/graduationCheck）。
function GraduationCheck() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [major, setMajor] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [subMajorId, setSubMajorId] = useState<RequirementId | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 学類・入学年度から要件データの候補を引く。
  // 知識情報・図書館学類のように主専攻で要件が分かれる場合は複数返るため、
  // 主専攻セレクトで1件に絞る（1件ならそのまま確定）。
  const requirementCandidates = useMemo(
    () =>
      major !== "" && admissionYear !== ""
        ? resolveRequirementIds(major, admissionYear)
        : [],
    [major, admissionYear]
  );
  const requirementId =
    requirementCandidates.length === 1
      ? requirementCandidates[0]
      : requirementCandidates.find((id) => id === subMajorId) ?? null;
  const isUnsupported =
    major !== "" && admissionYear !== "" && requirementCandidates.length === 0;
  const subMajorOptions = useMemo(
    () =>
      listSupportedRequirements().filter((requirement) =>
        requirementCandidates.includes(requirement.id)
      ),
    [requirementCandidates]
  );

  const openFilePicker = () => fileInputRef.current?.click();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setCsvError(null);
    }
  };

  // 「チェックを開始する」→ CSVをその場で判定して結果ページへ遷移。
  // 判定結果は永続化せず、遷移時の state のみで受け渡す（離脱で破棄）。
  const handleStart = async (agreedStats: boolean) => {
    if (!file || requirementId === null) return;
    const { courses } = parseGradesCsv(await file.text());
    setIsConsentOpen(false);
    if (courses.length === 0) {
      setCsvError(
        "CSVから成績データを読み取れませんでした。TWINSからダウンロードした成績CSVかご確認ください。"
      );
      return;
    }
    navigate("/graduation-checker/result", {
      state: {
        fileName: file.name,
        major,
        admissionYear,
        agreedStats,
        report: checkGraduation(courses, requirementId),
      },
    });
  };

  return (
    <div className="gradCheckPage">
      <Globalnav />
      <main className="gradCheckPageLayout">
        <p className="gradCheckBreadcrumb">
          <Link to="/" className="gradCheckBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt;{" "}
          <Link to="/class/top" className="gradCheckBreadcrumbLink">
            授業・履修
          </Link>{" "}
          &gt; 卒業要件チェック
        </p>

        {/* 見出しエリア */}
        <div className="gradCheckHeading">
          <h1 className="gradCheckTitle">
            <GraduationCap aria-hidden="true" />
            卒業要件チェック
            <span className="gradCheckBetaBadge">β版</span>
          </h1>
          <p className="gradCheckLead">
            TWINSの成績csvをアップロードすると、卒業要件の充足状況を確認できます
          </p>
        </div>

        <div className="gradCheckCard">
          {/* ステップ1：学類・専攻と入学年度を選択 */}
          <section>
            <div className="gradCheckStepHeader">
              <span className="gradCheckStepNumber" aria-hidden="true">
                1
              </span>
              <h2 className="gradCheckStepTitle">学類・専攻と入学年度を選択</h2>
            </div>

            <div className="gradCheckFieldList">
              <div className="gradCheckField">
                <label className="gradCheckFieldLabel" htmlFor="grad-check-major">
                  学類・専攻
                </label>
                <div className="gradCheckSelectWrap">
                  <select
                    id="grad-check-major"
                    className={`gradCheckSelect${major === "" ? " isPlaceholder" : ""}`}
                    value={major}
                    onChange={(e) => {
                      setMajor(e.target.value);
                      setSubMajorId("");
                    }}
                  >
                    <option value="" disabled>
                      -- 選択する --
                    </option>
                    {undergraduateMajors.map((m) => (
                      <option value={m} key={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="gradCheckSelectChevron" aria-hidden="true" />
                </div>
              </div>

              <div className="gradCheckField">
                <label className="gradCheckFieldLabel" htmlFor="grad-check-year">
                  入学年度
                </label>
                <div className="gradCheckSelectWrap">
                  <select
                    id="grad-check-year"
                    className={`gradCheckSelect${admissionYear === "" ? " isPlaceholder" : ""}`}
                    value={admissionYear}
                    onChange={(e) => {
                      setAdmissionYear(e.target.value);
                      setSubMajorId("");
                    }}
                  >
                    <option value="" disabled>
                      -- 選択する --
                    </option>
                    {admissionYears.map((y) => (
                      <option value={y} key={y}>
                        {y}年度
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="gradCheckSelectChevron" aria-hidden="true" />
                </div>
              </div>

              {/* 主専攻で要件が分かれる学類（知識情報・図書館学類）のみ表示 */}
              {requirementCandidates.length > 1 && (
                <div className="gradCheckField">
                  <label
                    className="gradCheckFieldLabel"
                    htmlFor="grad-check-submajor"
                  >
                    主専攻
                  </label>
                  <div className="gradCheckSelectWrap">
                    <select
                      id="grad-check-submajor"
                      className={`gradCheckSelect${subMajorId === "" ? " isPlaceholder" : ""}`}
                      value={subMajorId}
                      onChange={(e) =>
                        setSubMajorId(e.target.value as RequirementId)
                      }
                    >
                      <option value="" disabled>
                        -- 選択する --
                      </option>
                      {subMajorOptions.map((requirement) => (
                        <option value={requirement.id} key={requirement.id}>
                          {requirement.major}主専攻
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="gradCheckSelectChevron"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              )}
            </div>

            {isUnsupported && (
              <p className="gradCheckFieldError">
                選択した学類・入学年度の卒業要件データには現在対応していません（対応:
                情報メディア創成学類、知識情報・図書館学類の2021年度以降入学）
              </p>
            )}
          </section>

          {/* ステップ2：成績CSVをアップロード */}
          <section>
            <div className="gradCheckStepHeader">
              <span className="gradCheckStepNumber" aria-hidden="true">
                2
              </span>
              <h2 className="gradCheckStepTitle">
                成績CSVをアップロード
                <button
                  type="button"
                  className="gradCheckHelpBtn"
                  aria-label="CSVの取得・アップロード方法を見る"
                  onClick={() => setIsGuideOpen(true)}
                >
                  <CircleQuestionMark aria-hidden="true" />
                </button>
              </h2>
            </div>

            <div
              className={`gradCheckDropzone${isDragOver ? " isDragOver" : ""}${file ? " hasFile" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <CloudUpload className="gradCheckDropzoneIcon" aria-hidden="true" />
              {file ? (
                <>
                  <p className="gradCheckDropzoneTitle">{file.name}</p>
                  <p className="gradCheckDropzoneSub">
                    <button
                      type="button"
                      className="gradCheckFileLink"
                      onClick={openFilePicker}
                    >
                      別のファイルを選択
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <p className="gradCheckDropzoneTitle">
                    CSVファイルをドラッグ&ドロップ
                  </p>
                  <p className="gradCheckDropzoneSub">
                    または{" "}
                    <button
                      type="button"
                      className="gradCheckFileLink"
                      onClick={openFilePicker}
                    >
                      クリックしてファイルを選択
                    </button>
                  </p>
                </>
              )}
              <p className="gradCheckDropzoneNote">
                <span className="gradCheckDropzoneNoteBadge">対応ファイル</span>
                CSV形式
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    setCsvError(null);
                  }
                  // 同じファイルを選び直しても onChange が発火するようリセット
                  e.target.value = "";
                }}
              />
            </div>

            {csvError && <p className="gradCheckFieldError">{csvError}</p>}
          </section>

          {/* アップロードボタン（カード右下） */}
          <div className="gradCheckSubmitRow">
            <button
              type="button"
              className="gradCheckSubmitBtn"
              disabled={!file || requirementId === null}
              onClick={() => setIsConsentOpen(true)}
            >
              ファイルをアップロード
            </button>
          </div>
        </div>
      </main>
      <Footer />

      {/* B：データ取り扱い確認ポップアップ */}
      {isConsentOpen && (
        <GraduationCheckConsentModal
          fileName={file?.name ?? "成績データ.csv"}
          onClose={() => setIsConsentOpen(false)}
          onChangeFile={() => {
            // ポップアップを閉じてファイルを選び直す
            setIsConsentOpen(false);
            openFilePicker();
          }}
          onOpenGuide={() => setIsGuideOpen(true)}
          onStart={handleStart}
        />
      )}

      {/* C：CSV取得・アップロード方法の説明ポップアップ */}
      {isGuideOpen && (
        <GraduationCheckCsvGuideModal onClose={() => setIsGuideOpen(false)} />
      )}
    </div>
  );
}

export default GraduationCheck;
