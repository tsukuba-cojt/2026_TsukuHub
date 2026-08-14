import { useEffect, useState } from "react";
import { Check, CircleQuestionMark, FileSpreadsheet, FileText, X } from "lucide-react";
import "../../styles/class/GraduationCheck.css";

type Props = {
  /** アップロード済みファイル名（未取得時は呼び出し側でダミーを渡す） */
  fileName: string;
  isProcessing: boolean;
  onClose: () => void;
  /** 「データを変更」：モーダルを閉じてファイルを選び直す */
  onChangeFile: () => void;
  /** CSV取得方法モーダル（C）を開く */
  onOpenGuide: () => void;
  /** 「チェックを開始する」：任意の統計協力チェックの状態を渡す */
  onStart: (agreedStats: boolean) => void;
};

const policyItems = [
  "ログイン中は、復元した時間割を本人履歴として保存します（同じ年度は最新結果に更新）",
  "CSVの元ファイルは解析後すぐに破棄されます",
  "氏名・学籍番号・メールアドレスは保存しません",
];

// データ取り扱い確認ポップアップ（B）
// チェックボックスは開くたびに初期状態OFF（本コンポーネントの再マウントで担保）
function GraduationCheckConsentModal({
  fileName,
  isProcessing,
  onClose,
  onChangeFile,
  onOpenGuide,
  onStart,
}: Props) {
  const [agreedRequired, setAgreedRequired] = useState(false);
  const [agreedStats, setAgreedStats] = useState(false);

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
        aria-labelledby="grad-check-consent-title"
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
          <FileText className="gradCheckModalHeaderIcon" aria-hidden="true" />
          <div>
            <h2 className="gradCheckModalTitle" id="grad-check-consent-title">
              卒業要件チェックについて
            </h2>
            <p className="gradCheckModalSub">データの取り扱いについてご確認ください</p>
          </div>
        </div>

        {/* 読み込んだファイル */}
        <div className="gradCheckFileRow">
          <FileSpreadsheet className="gradCheckFileRowIcon" aria-hidden="true" />
          <span className="gradCheckFileRowName">{fileName}</span>
          <span className="gradCheckFileRowCheck" aria-label="読み込み済み">
            <Check aria-hidden="true" />
          </span>
          <button
            type="button"
            className="gradCheckFileRowChange"
            onClick={onChangeFile}
          >
            データを変更
          </button>
        </div>

        {/* このチェックでのデータの扱い */}
        <div className="gradCheckPolicyBox">
          <p className="gradCheckPolicyBoxTitle">このチェックでのデータの扱い</p>
          {policyItems.map((item) => (
            <p className="gradCheckPolicyItem" key={item}>
              <Check aria-hidden="true" />
              {item}
            </p>
          ))}
        </div>

        {/* 同意チェック */}
        <div className="gradCheckConsentList">
          <label className="gradCheckConsentRow">
            <input
              type="checkbox"
              checked={agreedRequired}
              onChange={(e) => setAgreedRequired(e.target.checked)}
            />
            CSVを卒業要件の判定に利用することに同意します
            <span className="gradCheckBadgeRequired">必須</span>
          </label>

          <div>
            <label className="gradCheckConsentRow">
              <input
                type="checkbox"
                checked={agreedStats}
                onChange={(e) => setAgreedStats(e.target.checked)}
              />
              匿名の統計・みんなの時間割に協力する
              <span className="gradCheckBadgeOptional">任意</span>
            </label>
            <p className="gradCheckConsentNote">
              公開されるのは学類・学年・履修科目などの匿名化された時間割情報のみです。
              <br />
              個人が特定される情報やCSV元ファイルは公開・保存しません。
            </p>
            <button
              type="button"
              className="gradCheckGuideLink"
              onClick={onOpenGuide}
            >
              <CircleQuestionMark aria-hidden="true" />
              CSVの取得方法・データの取り扱い詳細はこちら
            </button>
          </div>
        </div>

        {/* 下部ボタン */}
        <div className="gradCheckModalActions">
          <button type="button" className="gradCheckCancelBtn" onClick={onClose}>
            キャンセル
          </button>
          <button
            type="button"
            className="gradCheckStartBtn"
            disabled={!agreedRequired || isProcessing}
            onClick={() => onStart(agreedStats)}
          >
            {isProcessing ? "解析しています..." : "チェックを開始する"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GraduationCheckConsentModal;
