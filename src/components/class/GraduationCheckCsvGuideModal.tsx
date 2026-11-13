import { useEffect } from "react";
import { CircleQuestionMark, X } from "lucide-react";
import "../../styles/class/GraduationCheck.css";

type Props = {
  onClose: () => void;
};

// CSV取得・アップロード方法の説明ポップアップ（C）
// 中身はプレースホルダー。後からスクショ付き手順を追加する。
function GraduationCheckCsvGuideModal({ onClose }: Props) {
  // モーダル表示中は ESC キーで閉じる（Contact のモーダルと同じパターン）
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
        aria-labelledby="grad-check-guide-title"
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
          <CircleQuestionMark className="gradCheckModalHeaderIcon" aria-hidden="true" />
          <div>
            <h2 className="gradCheckModalTitle" id="grad-check-guide-title">
              CSVの取得・アップロード方法
            </h2>
            <p className="gradCheckModalSub">TWINSから成績CSVを取得する手順</p>
          </div>
        </div>

        {/* TODO: スクショ付きの取得手順・データ取り扱い詳細をここに追加する */}
        <div className="gradCheckGuideBody">
          <p>準備中です。TWINSからのCSV取得手順をスクリーンショット付きで掲載予定です。</p>
        </div>
      </div>
    </div>
  );
}

export default GraduationCheckCsvGuideModal;
