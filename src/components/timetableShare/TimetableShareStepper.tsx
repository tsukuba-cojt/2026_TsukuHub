import { Fragment } from "react";
import { SHARE_STEPS } from "./shareState";
import "../../styles/class/TimetableShare.css";

type Props = {
  /** 現在のステップ（1〜4） */
  currentStep: number;
};

/**
 * 時間割共有ウィザードのステップインジケーター。
 * 「丸い番号＋ステップ名」を横並びにし、ステップ間をラインで接続する。
 * 構造は SignupStepper と同じ組み立て方（Fragment で丸とラインを交互に並べる）。
 */
function TimetableShareStepper({ currentStep }: Props) {
  return (
    <ol className="ttShareStepper">
      {SHARE_STEPS.map((step, i) => (
        <Fragment key={step.num}>
          <li
            className="ttShareStep"
            aria-current={currentStep === step.num ? "step" : undefined}
          >
            <span
              className={`ttShareStepCircle${currentStep === step.num ? " isActive" : ""}`}
              aria-hidden="true"
            >
              {step.num}
            </span>
            <span
              className={`ttShareStepLabel${currentStep === step.num ? " isActive" : ""}`}
            >
              {step.label}
            </span>
          </li>
          {i < SHARE_STEPS.length - 1 && (
            <li className="ttShareStepLine" aria-hidden="true" />
          )}
        </Fragment>
      ))}
    </ol>
  );
}

export default TimetableShareStepper;
