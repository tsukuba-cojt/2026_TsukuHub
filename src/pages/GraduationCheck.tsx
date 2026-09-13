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
import { useAuth } from "../components/auth/authContextValue";
import { getGraduationCheckProvider } from "../features/graduationCheck/provider";
import { enrichCoursesWithCatalog } from "../features/graduationCheck/osaka";
import { listCatalogCourses } from "../services/courseCatalog";
import type {
  SupportedDepartment,
  SupportedMajor,
} from "../features/graduationCheck";
import {
  buildTimetableHistoriesFromGraduationReport,
  saveTimetableHistories,
} from "../services/timetableService";
import "../styles/class/GraduationCheck.css";
import { useUniversity } from "../components/university/universityContextValue";

// 卒業要件チェック アップロードページ（/graduation-checker）
// CSVのパース・要件判定はクライアント内で完結する（features/graduationCheck）。
function GraduationCheck() {
  const { university, path } = useUniversity();
  const provider = useMemo(
    () => getGraduationCheckProvider(university?.slug),
    [university?.slug]
  );
  const {
    supportedDepartments,
    findDepartment,
    findMajor,
    listAdmissionYearOptions,
    listDepartmentAdmissionYears,
    listMajorAdmissionYears,
    resolveRequirementId,
    parseGradesCsv,
    checkGraduation,
    readCsvFile,
    csvErrorHint,
    description,
    departmentSelectLabel,
    majorSelectLabel,
    csvSourceName,
  } = provider;

  const supportedSummary = useMemo(
    () =>
      supportedDepartments
        .map((department) => {
          const years = listDepartmentAdmissionYears(department);
          return `${department.label}の${years[0]}〜${years[years.length - 1]}年度入学`;
        })
        .join("、"),
    [supportedDepartments, listDepartmentAdmissionYears]
  );
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);

  const [departmentKey, setDepartmentKey] = useState("");
  const [majorKey, setMajorKey] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const department = useMemo(
    () => findDepartment(departmentKey),
    [departmentKey]
  );
  const major = useMemo(
    () => findMajor(departmentKey, majorKey),
    [departmentKey, majorKey]
  );
  // 入学年度の選択肢は要件データが存在する年度のみ。
  // 専攻まで選ばれていれば専攻単位、学類のみなら学類単位の対応年度に絞る。
  const admissionYearOptions = useMemo(
    () => listAdmissionYearOptions(department, major),
    [department, major]
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

  // 学類・専攻を変えたとき、新しい対応年度に含まれない入学年度の選択はリセットする
  const keepAdmissionYearIfSupported = (
    nextDepartment: SupportedDepartment | undefined,
    nextMajor: SupportedMajor | undefined
  ) => {
    const years = nextMajor
      ? listMajorAdmissionYears(nextMajor)
      : nextDepartment
        ? listDepartmentAdmissionYears(nextDepartment)
        : [];
    setAdmissionYear((current) =>
      current !== "" && years.includes(Number(current)) ? current : ""
    );
  };

  // 学類を選び直したら専攻はリセット。専攻が1件だけの学類は、
  // 主専攻が1件のときに自動確定していた従来挙動に合わせてその1件を自動選択する。
  const handleDepartmentChange = (nextDepartmentKey: string) => {
    const nextDepartment = findDepartment(nextDepartmentKey);
    const majors = nextDepartment?.majors ?? [];
    const nextMajor = majors.length === 1 ? majors[0] : undefined;
    setDepartmentKey(nextDepartmentKey);
    setMajorKey(nextMajor?.key ?? "");
    keepAdmissionYearIfSupported(nextDepartment, nextMajor);
  };

  const handleMajorChange = (nextMajorKey: string) => {
    setMajorKey(nextMajorKey);
    keepAdmissionYearIfSupported(
      department,
      findMajor(departmentKey, nextMajorKey)
    );
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
  //
  // 行単位のパースエラーがあっても中断せず、読めた科目だけで判定して結果を出す。
  // エラーは結果ページへ渡し、警告として表示させる（1件も読めなかった場合のみ中断）。
  const handleStart = async (agreedStats: boolean) => {
    if (!file || requirementId === null || processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);
    try {
      const csvText = readCsvFile
        ? await readCsvFile(file)
        : await file.text();
      let parsed = parseGradesCsv(csvText);
      if (university?.slug === "osaka") {
        const catalog = await listCatalogCourses("osaka");
        parsed = enrichCoursesWithCatalog(catalog, parsed);
      }
      const { courses, errors } = parsed;
      setIsConsentOpen(false);
      if (courses.length === 0) {
        setCsvError(csvErrorHint);
        return;
      }
      const report = checkGraduation(courses, requirementId);
      const departmentLabel = department?.label ?? "";
      const majorLabel = major?.label ?? departmentLabel;
      const timetableHistories = await buildTimetableHistoriesFromGraduationReport({
        report,
        department: departmentLabel,
        major: majorLabel,
        admissionYear: Number(admissionYear),
        sharePublic: agreedStats,
        ownerId: user?.id,
        universityId: university?.id ?? "",
        universitySlug: university?.slug ?? "tsukuba",
      });

      let timetableSaveStatus: "saved" | "guest" | "failed" = user
        ? "saved"
        : "guest";
      if (user) {
        try {
          await saveTimetableHistories(
            timetableHistories,
            user.id,
            university?.id ?? ""
          );
        } catch {
          timetableSaveStatus = "failed";
        }
      }

      navigate(path("/graduation-checker/result"), {
        state: {
          fileName: file.name,
          department: departmentLabel,
          major: majorLabel,
          admissionYear,
          agreedStats,
          csvErrors: errors,
          report,
          timetableHistories,
          timetableSaveStatus,
        },
      });
    } catch {
      setIsConsentOpen(false);
      setCsvError("成績データの解析に失敗しました。もう一度お試しください。");
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <div className="gradCheckPage">
      <Globalnav />
      <main className="gradCheckPageLayout">
        <p className="gradCheckBreadcrumb">
          <Link to={path()} className="gradCheckBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt;{" "}
          <Link to={path("/class/top")} className="gradCheckBreadcrumbLink">
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
          <p className="gradCheckLead">{description}</p>
        </div>

        <div className="gradCheckCard">
          {/* ステップ1：学類・専攻と入学年度を選択 */}
          <section>
            <div className="gradCheckStepHeader">
              <span className="gradCheckStepNumber" aria-hidden="true">
                1
              </span>
              <h2 className="gradCheckStepTitle">
                {departmentSelectLabel}・{majorSelectLabel}と入学年度を選択
              </h2>
            </div>

            <div className="gradCheckFieldList">
              <div className="gradCheckField">
                <label
                  className="gradCheckFieldLabel"
                  htmlFor="grad-check-department"
                >
                  {departmentSelectLabel}
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
                  {majorSelectLabel}
                </label>
                <div className="gradCheckSelectWrap">
                  <select
                    id="grad-check-major"
                    className={`gradCheckSelect${majorKey === "" ? " isPlaceholder" : ""}`}
                    value={majorKey}
                    disabled={department === undefined}
                    onChange={(e) => handleMajorChange(e.target.value)}
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

              {/* 選択肢は要件データが存在する年度のみ。学類が未選択のうちは選べない */}
              <div className="gradCheckField">
                <label className="gradCheckFieldLabel" htmlFor="grad-check-year">
                  入学年度
                </label>
                <div className="gradCheckSelectWrap">
                  <select
                    id="grad-check-year"
                    className={`gradCheckSelect${admissionYear === "" ? " isPlaceholder" : ""}`}
                    value={admissionYear}
                    disabled={admissionYearOptions.length === 0}
                    onChange={(e) => setAdmissionYear(e.target.value)}
                  >
                    <option value="" disabled>
                      -- 選択する --
                    </option>
                    {admissionYearOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="gradCheckSelectChevron" aria-hidden="true" />
                </div>
              </div>
            </div>

            {isUnsupported && (
              <p className="gradCheckFieldError">
                選択した{departmentSelectLabel}・{majorSelectLabel}・入学年度の卒業要件データには現在対応していません（対応:
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
              {isProcessing ? "解析しています..." : "ファイルをアップロード"}
            </button>
          </div>
        </div>
      </main>
      <Footer />

      {/* B：データ取り扱い確認ポップアップ */}
      {isConsentOpen && (
        <GraduationCheckConsentModal
          fileName={file?.name ?? "成績データ.csv"}
          isProcessing={isProcessing}
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
        <GraduationCheckCsvGuideModal
          onClose={() => setIsGuideOpen(false)}
          csvSourceName={csvSourceName}
          universitySlug={university?.slug}
        />
      )}
    </div>
  );
}

export default GraduationCheck;
