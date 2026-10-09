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

        <div className="gradCheckGuideBody">
          <p>
            TWINS の「成績」画面からダウンロードした CSV を読み込むと、
            必修・選択の修得状況と、卒業までに残っている単位を整理します。
          </p>

          <h3>成績CSVの取得方法・ファイルの例</h3>
          <ol>
            <li>TWINSにログインし、「成績」の画面を開きます。</li>
            <li>
              成績の一覧からCSVをダウンロードします。年度などの絞り込みがある場合は、
              全年度の成績が含まれる状態にしてください。
            </li>
            <li>
              取得した.csvファイルを、そのまま下の欄で選択します。履修登録用のCSVやPDFでは読み込めません。
            </li>
          </ol>

          <p className="gradCheckGuideNote">
            列名は「科目番号・科目名・単位数・総合評価・開講年度」が必要です。
            例は形式の説明用で、実際の成績ではありません。
          </p>

          <pre className="gradCheckCsvExample" aria-label="成績CSVの例">
            <code>{`科目番号,科目名,単位数,総合評価,開講年度
GE61801,データ構造とアルゴリズム,2.0,A,2025`}</code>
          </pre>

          <p className="gradCheckGuideNote">
            文字コードはUTF-8またはShift_JISに対応しています。
          </p>
        </div>
      </div>
    </div>
  );
}

export default GraduationCheckCsvGuideModal;
