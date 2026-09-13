import { useEffect } from "react";
import { CircleQuestionMark, X } from "lucide-react";
import "../../styles/class/GraduationCheck.css";

type Props = {
  onClose: () => void;
  csvSourceName?: string;
  universitySlug?: string;
};

const guideContent: Record<
  string,
  { subtitle: string; steps: string[] }
> = {
  tsukuba: {
    subtitle: "TWINSから成績CSVを取得する手順",
    steps: [
      "TWINS（CampusWeb）にログインします。",
      "成績メニューから成績CSVをダウンロードします。",
      "ダウンロードしたCSVファイルをこのページへアップロードします。",
    ],
  },
  osaka: {
    subtitle: "KOANから成績CSVを取得する手順",
    steps: [
      "KOAN（PC版）にログインします。",
      "【成績】→【単位修得状況照会】を開きます。",
      "「過去を含めた全成績」にチェックを入れ、「ファイルに出力する」を押してCSVを保存します。",
      "保存したCSVファイルをこのページへアップロードします。",
    ],
  },
};

function GraduationCheckCsvGuideModal({
  onClose,
  csvSourceName = "TWINS",
  universitySlug = "tsukuba",
}: Props) {
  const guide = guideContent[universitySlug] ?? guideContent.tsukuba;

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
            <p className="gradCheckModalSub">{guide.subtitle}</p>
          </div>
        </div>

        <div className="gradCheckGuideBody">
          <ol>
            {guide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            {csvSourceName}
            から出力したCSVのみ対応しています。成績データはブラウザ内でのみ処理され、サーバーへ送信されません。
          </p>
        </div>
      </div>
    </div>
  );
}

export default GraduationCheckCsvGuideModal;
