import { Fragment } from "react";
import { SHARE_STEPS } from "./shareState";
import "../../styles/class/TimetableShare.css";

type Props = {
  currentStep: number;
};

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
