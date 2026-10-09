import { useMemo, useState } from "react";
import { Calendar, CircleQuestionMark, GraduationCap } from "lucide-react";
import CsvDropzone from "../class/CsvDropzone";
import GraduationCheckCsvGuideModal from "../class/GraduationCheckCsvGuideModal";
import { TimetableDetailView } from "../class/TimetableDisplay";
import { timetableModuleLabels, timetableModuleOrder } from "../../types/timetable";
import type { TimetableHistory, TimetableModuleKey } from "../../types/timetable";
import type { ShareSettings } from "./shareState";
import "../../styles/class/GraduationCheck.css";
import "../../styles/class/Timetable.css";
import "../../styles/class/TimetableShare.css";

type Props = {
  file: File | null;
  histories: TimetableHistory[];
  settings: ShareSettings;
  admissionYear: string;
  majorLabel: string;
  isParsing: boolean;
  csvError: string | null;
  onFileSelect: (file: File) => void;
};

function StepUpload({
  file,
  histories,
  settings,
  admissionYear,
  majorLabel,
  isParsing,
  csvError,
  onFileSelect,
}: Props) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<TimetableModuleKey | null>(
    null
  );

  const preview = useMemo(() => histories[0], [histories]);
  const firstFilledModule = useMemo(
    () =>
      preview
        ? timetableModuleOrder.find((key) =>
            preview.courses.some((course) => course.modules.includes(key))
          )
        : undefined,
    [preview]
  );
  const moduleKey = selectedModule ?? firstFilledModule ?? "springA";

  return (
    <div className="ttShareUploadLayout">
      <section className="ttShareUploadMain">
        <h2 className="ttShareUploadTitle">
          成績 CSV をアップロード
          <button
            type="button"
            className="gradCheckHelpBtn"
            aria-label="CSVの取得・アップロード方法を見る"
            onClick={() => setIsGuideOpen(true)}
          >
            <CircleQuestionMark aria-hidden="true" />
          </button>
        </h2>

        <CsvDropzone
          file={file}
          onFileSelect={onFileSelect}
          className="ttShareDropzone"
        />

        {csvError && <p className="gradCheckFieldError">{csvError}</p>}
      </section>

      <section className="ttSharePreview">
        <h2 className="ttSharePreviewTitle">プレビュー</h2>

        <div className="ttSharePreviewBox">
          <div className="timetableModuleTabs" role="tablist">
            {timetableModuleOrder.map((key) => (
              <button
                type="button"
                role="tab"
                aria-selected={moduleKey === key}
                className={moduleKey === key ? "isActive" : ""}
                onClick={() => setSelectedModule(key)}
                key={key}
              >
                {timetableModuleLabels[key]}
              </button>
            ))}
          </div>

          {preview ? (
            <TimetableDetailView history={preview} activeModule={moduleKey} />
          ) : (
            <p className="ttSharePreviewEmpty">
              {isParsing
                ? "時間割を組み立てています..."
                : "CSVをアップロードすると、ここにプレビューが表示されます"}
            </p>
          )}

          <div className="ttShareAttrBox">
            <h3 className="ttShareAttrTitle">この時間割の属性（匿名）</h3>
            {!settings.shareTimetable ? (
              <p className="ttShareAttrPrivate">非公開です</p>
            ) : (
              <dl className="ttShareAttrList">
                {settings.shareEnrollYear && (
                  <div className="ttShareAttrItem">
                    <dt className="ttShareAttrLabel">
                      <Calendar aria-hidden="true" />
                      入学年度
                    </dt>
                    <dd className="ttShareAttrValue">
                      {admissionYear ? `${admissionYear}年度` : "未設定"}
                    </dd>
                  </div>
                )}
                {settings.shareMajor && (
                  <div className="ttShareAttrItem">
                    <dt className="ttShareAttrLabel">
                      <GraduationCap aria-hidden="true" />
                      専攻・分野
                    </dt>
                    <dd className="ttShareAttrValue">{majorLabel || "未設定"}</dd>
                  </div>
                )}
                {!settings.shareEnrollYear && !settings.shareMajor && (
                  <p className="ttShareAttrPrivate">
                    公開する属性は選択されていません
                  </p>
                )}
              </dl>
            )}
          </div>
        </div>
      </section>

      {isGuideOpen && (
        <GraduationCheckCsvGuideModal onClose={() => setIsGuideOpen(false)} />
      )}
    </div>
  );
}

export default StepUpload;
