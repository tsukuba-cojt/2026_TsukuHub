import { useEffect } from "react";
import { TriangleAlert, X } from "lucide-react";
import "../../styles/class/GraduationCheck.css";

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
};

function LeaveConfirmModal({ onCancel, onConfirm }: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="gradCheckModalOverlay" onClick={onCancel}>
      <div
        className="gradCheckModalPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timetable-share-leave-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="gradCheckModalClose"
          aria-label="閉じる"
          onClick={onCancel}
        >
          <X aria-hidden="true" />
        </button>

        <div className="gradCheckModalHeader">
          <TriangleAlert
            className="gradCheckModalHeaderIcon gradCheckLeaveIcon"
            aria-hidden="true"
          />
          <div>
            <h2 className="gradCheckModalTitle" id="timetable-share-leave-title">
              現在の変更内容が失われますがよろしいですか？
            </h2>
            <p className="gradCheckModalSub">
              入力した共有設定やアップロードしたファイルは保存されません。
            </p>
          </div>
        </div>

        <div className="gradCheckModalActions gradCheckLeaveActions">
          <button type="button" className="gradCheckCancelBtn" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" className="gradCheckStartBtn" onClick={onConfirm}>
            移動する
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeaveConfirmModal;
