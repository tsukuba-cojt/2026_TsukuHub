import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseGradesCsv } from "../../features/graduationCheck";
import TimetableShareStepper from "./TimetableShareStepper";
import TimetableSharePrivacyCard from "./TimetableSharePrivacyCard";
import StepConsent from "./StepConsent";
import StepShareSettings from "./StepShareSettings";
import StepUpload from "./StepUpload";
import StepComplete, { type DoneAction } from "./StepComplete";
import LeaveConfirmModal from "./LeaveConfirmModal";
import { useLeaveConfirm } from "./useLeaveConfirm";
import { INITIAL_SHARE_STATE, type TimetableShareState } from "./shareState";
import "../../styles/class/TimetableShare.css";

export type TimetableShareWizardProps = {
  /** ステップ1「キャンセル」で戻る先（呼び出し元のページ） */
  cancelPath: string;
  /** 完了画面の塗りボタン */
  primaryDone: DoneAction;
  /** 完了画面のアウトラインボタン（呼び出し元へ戻る導線） */
  secondaryDone: DoneAction;
  /** 「マイページへ」ボタンの遷移先 */
  mypagePath?: string;
  /** マイページの登録情報。プレビューの属性表示に使う */
  profile?: { enrollYear?: string; major?: string };
  /**
   * アップロード完了時の保存処理。未指定なら何もせず完了画面へ進む。
   * 実際の保存API連携が決まったらここに差し込む。
   */
  onComplete?: (state: TimetableShareState) => void;
};

/**
 * 「自分の時間割を登録する」4ステップウィザード。
 *
 * 授業・履修（/timetable/share）と、後日実装するマイページの双方から
 * 同じ形で呼び出せるよう、ページ固有の遷移先はすべて props で受け取る。
 * 4ステップ分の入力はこのコンポーネントが1つの state として保持するため、
 * 「戻る」で前のステップに戻っても入力内容は保持される。
 */
function TimetableShareWizard({
  cancelPath,
  primaryDone,
  secondaryDone,
  mypagePath = "/mypage",
  profile,
  onComplete,
}: TimetableShareWizardProps) {
  const navigate = useNavigate();
  const leave = useLeaveConfirm();

  const [step, setStep] = useState(1);
  const [state, setState] = useState<TimetableShareState>(INITIAL_SHARE_STATE);
  const [csvError, setCsvError] = useState<string | null>(null);

  // 選択されたCSVをその場でパースし、プレビュー用の科目リストを作る。
  // 判定・保存はせず、クライアント内で完結する（卒業要件チェッカーと同じ方針）。
  const handleFileSelect = async (file: File) => {
    const { courses } = parseGradesCsv(await file.text());
    if (courses.length === 0) {
      setState((prev) => ({ ...prev, file, courses: [] }));
      setCsvError(
        "CSVから履修データを読み取れませんでした。TWINSからダウンロードした成績CSVかご確認ください。"
      );
      return;
    }
    setCsvError(null);
    setState((prev) => ({ ...prev, file, courses }));
  };

  // 「ファイルをアップロード」→ 保存処理（あれば）を実行して完了画面へ
  const handleUpload = () => {
    if (!state.file) return;
    onComplete?.(state);
    setStep(4);
  };

  return (
    <div className="ttShareWizard">
      <h1 className="ttShareTitle">自分の時間割を登録する</h1>
      <TimetableShareStepper currentStep={step} />

      {step === 4 ? (
        <StepComplete primary={primaryDone} secondary={secondaryDone} />
      ) : (
        <>
          {/* ステップ3だけ左右の中身が異なるため、レイアウトを分ける */}
          {step === 3 ? (
            <StepUpload
              file={state.file}
              courses={state.courses}
              settings={state.settings}
              profile={profile}
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
                  settings={state.settings}
                  onChange={(settings) =>
                    setState((prev) => ({ ...prev, settings }))
                  }
                />
              )}
              <TimetableSharePrivacyCard
                onGoMypage={() => leave.request(mypagePath)}
              />
            </div>
          )}

          {/* 下部のアクション行 */}
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
                disabled={!state.file}
                onClick={handleUpload}
              >
                ファイルをアップロード
              </button>
            ) : (
              <button
                type="button"
                className="ttSharePrimaryBtn"
                // ステップ1は同意チェックが入るまで進めない
                disabled={step === 1 && !state.agreed}
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
