import React from "react";
import "../../styles/Auth.css";

interface StepperProps {
  currentStep: number;
}

const STEPS = [
  { num: 1, label: "メールアドレスの入力" },
  { num: 2, label: "アカウント情報の入力" },
  { num: 3, label: "完了" },
];

export default function SignupStepper({ currentStep }: StepperProps) {
  return (
    <div className="stepper">
      {STEPS.map((step, i) => (
        <React.Fragment key={step.num}>
          <div className="stepper-step">
            <div
              className={`stepper-circle${currentStep === step.num ? " stepper-circle--active" : currentStep > step.num ? " stepper-circle--done" : ""}`}
            >
              {step.num}
            </div>
            <span
              className={`stepper-label${currentStep === step.num ? " stepper-label--active" : ""}`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`stepper-line${currentStep > step.num ? " stepper-line--done" : ""}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
