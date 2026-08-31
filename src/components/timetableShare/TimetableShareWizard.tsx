import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkGraduation,
  findDepartment,
  findMajor,
  listDepartmentAdmissionYears,
  parseGradesCsv,
  resolveRequirementId,
  supportedDepartments,
} from "../../features/graduationCheck";
import {
  buildTimetableHistoriesFromGraduationReport,
  saveTimetableHistories,
} from "../../services/timetableService";
import { useAuth } from "../auth/authContextValue";
import { useUniversity } from "../university/universityContextValue";
import TimetableShareStepper from "./TimetableShareStepper";
import TimetableSharePrivacyCard from "./TimetableSharePrivacyCard";
import StepConsent from "./StepConsent";
import StepShareSettings from "./StepShareSettings";
import StepUpload from "./StepUpload";
import StepComplete, { type DoneAction } from "./StepComplete";
import LeaveConfirmModal from "./LeaveConfirmModal";
import { useLeaveConfirm } from "./useLeaveConfirm";
import {
  applyShareSettings,
  INITIAL_SHARE_STATE,
  type TimetableShareState,
} from "./shareState";
import "../../styles/class/TimetableShare.css";

export type TimetableShareWizardProps = {
  cancelPath: string;
  primaryDone: DoneAction;
  secondaryDone: DoneAction;
  mypagePath?: string;
};

const supportedSummary = supportedDepartments
  .map((department) => {
    const years = listDepartmentAdmissionYears(department);
    return `${department.label}の${years[0]}〜${years[years.length - 1]}年度入学`;
  })
  .join("、");

function TimetableShareWizard({
  cancelPath,
  primaryDone,
  secondaryDone,
  mypagePath = "/mypage",
}: TimetableShareWizardProps) {
  const navigate = useNavigate();
  const leave = useLeaveConfirm();
  const { user } = useAuth();
  const { university } = useUniversity();

  const [step, setStep] = useState(1);
  const [state, setState] = useState<TimetableShareState>(INITIAL_SHARE_STATE);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const { departmentKey, majorKey, admissionYear } = state.profile;

  const department = useMemo(
    () => findDepartment(departmentKey),
    [departmentKey]
  );
  const major = useMemo(
    () => findMajor(departmentKey, majorKey),
    [departmentKey, majorKey]
  );
  const requirementId = useMemo(
    () => resolveRequirementId(departmentKey, majorKey, admissionYear),
    [departmentKey, majorKey, admissionYear]
  );
  const isUnsupported =
    departmentKey !== "" &&
    majorKey !== "" &&
    admissionYear !== "" &&
    requirementId === null;

  const departmentLabel = department?.label ?? "";
  const majorLabel = major?.label ?? departmentLabel;

  const handleFileSelect = async (file: File) => {
    if (requirementId === null) return;
    setState((prev) => ({ ...prev, file, courses: [], histories: [] }));
    setCsvError(null);
    setIsParsing(true);
    try {
      const { courses } = parseGradesCsv(await file.text());
      if (courses.length === 0) {
        setCsvError(
          "CSVから履修データを読み取れませんでした。TWINSからダウンロードした成績CSVかご確認ください。"
        );
        return;
      }
      const report = checkGraduation(courses, requirementId);
      const histories = await buildTimetableHistoriesFromGraduationReport({
        report,
        department: departmentLabel,
        major: majorLabel,
        admissionYear: Number(admissionYear),
        sharePublic: state.settings.shareTimetable,
        ownerId: user?.id,
        universityId: university?.id ?? "",
      });
      setState((prev) => ({ ...prev, courses, histories }));
    } catch {
      setCsvError("成績データの解析に失敗しました。もう一度お試しください。");
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpload = async () => {
    if (!state.file || !user || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    try {
      await saveTimetableHistories(
        applyShareSettings(state.histories, state.settings),
        user.id,
        university?.id ?? ""
      );
      setStep(4);
    } catch {
      setCsvError("時間割の保存に失敗しました。時間をおいてもう一度お試しください。");
    } finally {
      setIsSaving(false);
      savingRef.current = false;
    }
  };

  const canGoNext =
    step === 1
      ? state.agreed
      : requirementId !== null &&
        (!state.settings.shareTimetable || state.settings.modules.length > 0);

  return (
    <div className="ttShareWizard">
      <h1 className="ttShareTitle">自分の時間割を登録する</h1>
      <TimetableShareStepper currentStep={step} />

      {step === 4 ? (
        <StepComplete primary={primaryDone} secondary={secondaryDone} />
      ) : (
        <>
          {step === 3 ? (
            <StepUpload
              file={state.file}
              histories={state.histories}
              settings={state.settings}
              admissionYear={admissionYear}
              majorLabel={majorLabel}
              isParsing={isParsing}
              csvError={csvError}
              onFileSelect={handleFileSelect}
            />
          ) : (
            <div className="ttShareLayout">
              {step === 1 && (
                <StepConsent
                  agreed={state.agreed}
                  onAgreedChange={(agreed) =>
                    setState((prev) => ({ ...prev, agreed }))
                  }
                />
              )}
              {step === 2 && (
                <StepShareSettings
                  profile={state.profile}
                  onProfileChange={(profile) =>
                    setState((prev) => ({
                      ...prev,
                      profile,
                      file: null,
                      courses: [],
                      histories: [],
                    }))
                  }
                  settings={state.settings}
                  onChange={(settings) =>
                    setState((prev) => ({ ...prev, settings }))
                  }
                  isUnsupported={isUnsupported}
                  unsupportedNotice={`選択した学類・専攻・入学年度の要件データには現在対応していません（対応: ${supportedSummary}）`}
                />
              )}
              <TimetableSharePrivacyCard
                onGoMypage={() => leave.request(mypagePath)}
              />
            </div>
          )}

          <div className="ttShareActions">
            <button
              type="button"
              className="ttShareOutlineBtn"
              onClick={() => (step === 1 ? navigate(cancelPath) : setStep(step - 1))}
            >
              {step === 1 ? "キャンセル" : "戻る"}
            </button>
            {step === 3 ? (
              <button
                type="button"
                className="ttSharePrimaryBtn"
                disabled={
                  !state.file || state.histories.length === 0 || isParsing || isSaving
                }
                onClick={handleUpload}
              >
                {isSaving ? "保存しています..." : "ファイルをアップロード"}
              </button>
            ) : (
              <button
                type="button"
                className="ttSharePrimaryBtn"
                disabled={!canGoNext}
                onClick={() => setStep(step + 1)}
              >
                次へ
              </button>
            )}
          </div>
        </>
      )}

      {leave.isOpen && (
        <LeaveConfirmModal onCancel={leave.cancel} onConfirm={leave.confirm} />
      )}
    </div>
  );
}

export default TimetableShareWizard;
