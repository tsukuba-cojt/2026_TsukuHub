import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import "../../styles/class/TimetableShare.css";

export type DoneAction = {
  label: string;
  path: string;
};

type Props = {
  primary: DoneAction;
  secondary: DoneAction;
};

function StepComplete({ primary, secondary }: Props) {
  return (
    <section className="ttShareComplete">
      <span className="ttShareCompleteIcon" aria-hidden="true">
        <Check />
      </span>
      <h2 className="ttShareCompleteTitle">時間割の登録が完了しました！</h2>
      <p className="ttShareCompleteText">
        ご登録いただいた時間割は、マイページからいつでも確認・編集できます
      </p>
      <div className="ttShareCompleteActions">
        <Link to={primary.path} className="ttSharePrimaryBtn">
          {primary.label}
        </Link>
        <Link to={secondary.path} className="ttShareOutlineBtn">
          {secondary.label}
        </Link>
      </div>
    </section>
  );
}

export default StepComplete;
