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
  findDepartment,
  listDepartmentAdmissionYears,
  parseGradesCsv,
  resolveRequirementId,
  supportedDepartments,
} from "../features/graduationCheck";
import "../styles/class/GraduationCheck.css";

// 学類・専攻の選択肢は features/graduationCheck/data/supportedDepartments.ts に集約。
// 卒業要件データが用意できている学類・専攻のみを載せているため、
// 新規登録ページ（Signup.tsx）の全学類リストとは別物として持つ。

// 入学年度：今年度から4年前まで（ダミー。年度切り替わりの厳密な扱いは本実装時に調整）
// 将来的に学類・専攻ごとに対応年度を出し分ける場合は、
// supportedDepartments の requirements.admissionYears から生成する。
const currentYear = new Date().getFullYear();
const admissionYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

// 対応外を選んだときの案内文（対応学類・年度もデータ定義から生成する）
const supportedSummary = supportedDepartments
  .map((department) => {
    const years = listDepartmentAdmissionYears(department);
    return `${department.label}の${years[0]}〜${years[years.length - 1]}年度入学`;
  })
  .join("、");

// 卒業要件チェック アップロードページ（/graduation-checker）
// CSVのパース・要件判定はクライアント内で完結する（features/graduationCheck）。
function GraduationCheck() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [departmentKey, setDepartmentKey] = useState("");
  const [majorKey, setMajorKey] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const department = useMemo(
    () => findDepartment(departmentKey),
    [departmentKey]
  );
  // 学類・専攻・入学年度の3つが揃うと要件データが一意に決まる（対応外なら null）
  const requirementId = useMemo(
    () => resolveRequirementId(departmentKey, majorKey, admissionYear),
    [departmentKey, majorKey, admissionYear]
  );
  const isUnsupported =
    departmentKey !== "" &&
    majorKey !== "" &&
    admissionYear !== "" &&
    requirementId === null;

  // 学類を選び直したら専攻はリセット。専攻が1件だけの学類は、
  // 主専攻が1件のときに自動確定していた従来挙動に合わせてその1件を自動選択する。
  const handleDepartmentChange = (nextDepartmentKey: string) => {
    setDepartmentKey(nextDepartmentKey);
    const majors = findDepartment(nextDepartmentKey)?.majors ?? [];
    setMajorKey(majors.length === 1 ? majors[0].key : "");
  };

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
        major: department?.label ?? "",
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
                <label
                  className="gradCheckFieldLabel"
                  htmlFor="grad-check-department"
                >
                  学類
                </label>
                <div className="gradCheckSelectWrap">
                  <select
                    id="grad-check-department"
                    className={`gradCheckSelect${departmentKey === "" ? " isPlaceholder" : ""}`}
                    value={departmentKey}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                  >
                    <option value="" disabled>
                      -- 選択する --
                    </option>
                    {supportedDepartments.map((d) => (
                      <option value={d.key} key={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="gradCheckSelectChevron" aria-hidden="true" />
                </div>
              </div>

              {/* 学類が未選択のうちは選べない（学類を選ぶと連動して選択肢が入る） */}
              <div className="gradCheckField">
                <label className="gradCheckFieldLabel" htmlFor="grad-check-major">
                  専攻
                </label>
                <div className="gradCheckSelectWrap">
                  <select
                    id="grad-check-major"
                    className={`gradCheckSelect${majorKey === "" ? " isPlaceholder" : ""}`}
                    value={majorKey}
                    disabled={department === undefined}
                    onChange={(e) => setMajorKey(e.target.value)}
                  >
                    <option value="" disabled>
                      -- 選択する --
                    </option>
                    {(department?.majors ?? []).map((m) => (
                      <option value={m.key} key={m.key}>
                        {m.label}
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
                    onChange={(e) => setAdmissionYear(e.target.value)}
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
            </div>

            {isUnsupported && (
              <p className="gradCheckFieldError">
                選択した学類・専攻・入学年度の卒業要件データには現在対応していません（対応:
                {supportedSummary}）
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
