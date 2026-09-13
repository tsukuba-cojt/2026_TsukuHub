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
        <div className="stepper-step" key={step.num}>
          {i > 0 && <span className="stepper-line" aria-hidden="true" />}
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
      ))}
    </div>
  );
}
