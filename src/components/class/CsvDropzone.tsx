import { useImperativeHandle, useRef, useState } from "react";
import type { DragEvent, Ref } from "react";
import { CloudUpload } from "lucide-react";
import "../../styles/class/GraduationCheck.css";

export type CsvDropzoneHandle = {
  openFilePicker: () => void;
};

type Props = {
  file: File | null;
  onFileSelect: (file: File) => void;
  className?: string;
  ref?: Ref<CsvDropzoneHandle>;
};

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
          e.target.value = "";
        }}
      />
    </div>
  );
}

export default CsvDropzone;
