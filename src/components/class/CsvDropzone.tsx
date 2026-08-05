import { useImperativeHandle, useRef, useState } from "react";
import type { DragEvent, Ref } from "react";
import { CloudUpload } from "lucide-react";
// クラス名（.gradCheckDropzone*）は卒業要件チェッカーから移動せずそのまま使う。
// 見た目を変えずに再利用できるよう、CSS の置き場所も元のままにしている。
import "../../styles/class/GraduationCheck.css";

export type CsvDropzoneHandle = {
  /** モーダルなど外側からファイル選択ダイアログを開くための口 */
  openFilePicker: () => void;
};

type Props = {
  /** 選択済みファイル（未選択なら null）。表示の出し分けにのみ使う */
  file: File | null;
  /** ドロップ／選択でファイルが決まったときに呼ばれる */
  onFileSelect: (file: File) => void;
  /**
   * サイズ・余白をページ側で調整するための追加クラス。
   * 例：時間割共有ウィザードでは .timetableShareDropzone で高さを詰めている。
   */
  className?: string;
  ref?: Ref<CsvDropzoneHandle>;
};

/**
 * 成績CSVのアップロード用ドロップゾーン。
 *
 * 卒業要件チェッカー（/graduation-checker）と時間割共有ウィザード
 * （/timetable/share）で共有する。文言・構造は共通で、サイズや余白だけ
 * className で呼び出し側から調整する。
 */
function CsvDropzone({ file, onFileSelect, className, ref }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const openFilePicker = () => fileInputRef.current?.click();

  useImperativeHandle(ref, () => ({ openFilePicker }), []);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  };

  return (
    <div
      className={`gradCheckDropzone${isDragOver ? " isDragOver" : ""}${file ? " hasFile" : ""}${className ? ` ${className}` : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <CloudUpload className="gradCheckDropzoneIcon" aria-hidden="true" />
      {file ? (
        <>
          <p className="gradCheckDropzoneTitle">{file.name}</p>
          <p className="gradCheckDropzoneSub">
            <button
              type="button"
              className="gradCheckFileLink"
              onClick={openFilePicker}
            >
              別のファイルを選択
            </button>
          </p>
        </>
      ) : (
        <>
          <p className="gradCheckDropzoneTitle">CSVファイルをドラッグ&ドロップ</p>
          <p className="gradCheckDropzoneSub">
            または{" "}
            <button
              type="button"
              className="gradCheckFileLink"
              onClick={openFilePicker}
            >
              クリックしてファイルを選択
            </button>
          </p>
        </>
      )}
      <p className="gradCheckDropzoneNote">
        <span className="gradCheckDropzoneNoteBadge">対応ファイル</span>
        CSV形式
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onFileSelect(selected);
          // 同じファイルを選び直しても onChange が発火するようリセット
          e.target.value = "";
        }}
      />
    </div>
  );
}

export default CsvDropzone;
