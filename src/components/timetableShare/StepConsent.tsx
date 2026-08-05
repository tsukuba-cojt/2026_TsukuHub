import { useState } from "react";
import { Check, ShieldCheck, SquareArrowOutUpRight } from "lucide-react";
import GuidelineModal from "./GuidelineModal";
import "../../styles/class/TimetableShare.css";

type Props = {
  /** 同意チェックの状態（ウィザードが保持） */
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
};

/** ガイドライン概要の3項目 */
const GUIDELINES = [
  "あなたの氏名や学籍番号など、個人を特定できる情報は公開されません",
  "選択した属性（学類・学年・専攻）のみが表示されます",
  "公開後もいつでも非公開にできます",
];

/** ステップ1：同意の確認 */
function StepConsent({ agreed, onAgreedChange }: Props) {
  const [isGuidelineOpen, setIsGuidelineOpen] = useState(false);

  return (
    <section className="ttShareCard">
      <h2 className="ttShareCardTitle">
        <ShieldCheck aria-hidden="true" />
        安心・安全に使用するためのガイドライン（概要）
      </h2>

      <ul className="ttShareGuidelineList">
        {GUIDELINES.map((text) => (
          <li className="ttShareGuidelineItem" key={text}>
            <Check className="ttShareGuidelineCheck" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="ttShareGuidelineLink"
        onClick={() => setIsGuidelineOpen(true)}
      >
        詳細なガイドラインを見る
        <SquareArrowOutUpRight aria-hidden="true" />
      </button>

      <label className="ttShareCheckbox">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
        />
        上記の内容に同意する
      </label>

      {isGuidelineOpen && (
        <GuidelineModal onClose={() => setIsGuidelineOpen(false)} />
      )}
    </section>
  );
}

export default StepConsent;
