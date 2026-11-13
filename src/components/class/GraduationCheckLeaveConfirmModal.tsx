import { useEffect } from "react";
import { TriangleAlert, X } from "lucide-react";
import "../../styles/class/GraduationCheck.css";

type Props = {
  /** 「キャンセル」／ESC／オーバーレイクリック：閉じるだけで遷移しない */
  onCancel: () => void;
  /** 「新しいタブで開く」：結果を保持したまま別タブで開く */
  onOpenNewTab: () => void;
  /** 「移動する」：同じタブで遷移する（結果は失われる） */
  onNavigate: () => void;
};

// 判定結果を破棄する遷移の前に出す確認ダイアログ。
// 結果はメモリ保持のみで永続化しないため、同じタブで離脱すると復元できない。
// 枠・ボタンのスタイルは同意モーダル（GraduationCheckConsentModal）と共通のものを使う。
function GraduationCheckLeaveConfirmModal({
  onCancel,
  onOpenNewTab,
  onNavigate,
}: Props) {
  // モーダル表示中は ESC キーで閉じる（同意モーダルと同じパターン）
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
        aria-labelledby="grad-check-leave-title"
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
            <h2 className="gradCheckModalTitle" id="grad-check-leave-title">
              チェック結果が失われてしまいますが、良いですか？
            </h2>
            <p className="gradCheckModalSub">
              もう一度確認するには、成績CSVのアップロードからやり直しになります。
            </p>
          </div>
        </div>

        <div className="gradCheckModalActions gradCheckLeaveActions">
          <button type="button" className="gradCheckCancelBtn" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" className="gradCheckStartBtn" onClick={onOpenNewTab}>
            新しいタブで開く（結果は保持されます）
          </button>
          <button type="button" className="gradCheckCancelBtn" onClick={onNavigate}>
            移動する
          </button>
        </div>
      </div>
    </div>
  );
}

export default GraduationCheckLeaveConfirmModal;
