import { useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";
import "../../styles/class/GraduationCheck.css";

type Props = {
  onClose: () => void;
};

function GuidelineModal({ onClose }: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="gradCheckModalOverlay" onClick={onClose}>
      <div
        className="gradCheckModalPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timetable-share-guideline-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="gradCheckModalClose"
          aria-label="閉じる"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>

        <div className="gradCheckModalHeader">
          <ShieldCheck className="gradCheckModalHeaderIcon" aria-hidden="true" />
          <div>
            <h2
              className="gradCheckModalTitle"
              id="timetable-share-guideline-title"
            >
              安心・安全に使用するためのガイドライン
            </h2>
          </div>
        </div>

        <div className="gradCheckGuideBody">
          <p>サンプルテキスト</p>
        </div>
      </div>
    </div>
  );
}

export default GuidelineModal;
