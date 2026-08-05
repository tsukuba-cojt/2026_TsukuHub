import { Fragment, useMemo, useState } from "react";
import { Calendar, CircleQuestionMark, GraduationCap } from "lucide-react";
import CsvDropzone from "../class/CsvDropzone";
import GraduationCheckCsvGuideModal from "../class/GraduationCheckCsvGuideModal";
import { MODULE_TABS, type TimetableCell } from "../class/timetableData";
import { buildPreviewSchedule, type ShareSettings } from "./shareState";
import type { Course } from "../../features/graduationCheck";
import "../../styles/class/TimetableDetail.css";
import "../../styles/class/TimetableShare.css";

const DAY_LABELS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5, 6];

type Props = {
  file: File | null;
  /** CSVをパースした科目（プレビューの元データ） */
  courses: Course[];
  /** ステップ2の共有設定。属性表示の出し分けにそのまま使う */
  settings: ShareSettings;
  /** マイページの登録情報。未連携のうちは未設定表示になる */
  profile?: { enrollYear?: string; major?: string };
  onFileSelect: (file: File) => void;
  /** CSVの読み取りに失敗したときのメッセージ */
  csvError: string | null;
};

/** ステップ3：アップロード（左：ドロップゾーン／右：プレビュー） */
function StepUpload({
  file,
  courses,
  settings,
  profile,
  onFileSelect,
  csvError,
}: Props) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [module, setModule] = useState(MODULE_TABS[0]);

  // 科目リストが変わったときだけ組み立て直す
  const schedule = useMemo(() => buildPreviewSchedule(courses), [courses]);

  // 「day-period」→ コマ の索引（TimetableDetail と同じ描画方法）
  const cellMap = useMemo(() => {
    const map = new Map<string, TimetableCell>();
    (schedule[module] ?? []).forEach((cell) => {
      map.set(`${cell.day}-${cell.period}`, cell);
    });
    return map;
  }, [schedule, module]);

  return (
    <div className="ttShareUploadLayout">
      {/* ── 左：アップロード ── */}
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

        {/* 卒業要件チェッカーと同じドロップゾーン。高さだけこのページ用に調整する */}
        <CsvDropzone
          file={file}
          onFileSelect={onFileSelect}
          className="ttShareDropzone"
        />

        {csvError && <p className="gradCheckFieldError">{csvError}</p>}
      </section>

      {/* ── 右：プレビュー ── */}
      <section className="ttSharePreview">
        <h2 className="ttSharePreviewTitle">プレビュー</h2>

        <div className="ttSharePreviewBox">
          {/* モジュールタブ */}
          <div className="timetableModuleTabs">
            {MODULE_TABS.map((tab) => (
              <button
                type="button"
                key={tab}
                className={`timetableModuleTab${tab === module ? " isActive" : ""}`}
                onClick={() => setModule(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 小さな時間割グリッド（月〜金 × 1〜6限） */}
          <div className="timetableGrid ttShareMiniGrid">
            <div className="timetableGridHead">
              <span />
              {DAY_LABELS.map((day) => (
                <span className="timetableGridDay" key={day}>
                  {day}
                </span>
              ))}
            </div>

            <div className="timetableGridBody">
              {PERIODS.map((period) => (
                <Fragment key={period}>
                  <span className="timetableGridPeriod">{period}</span>
                  {DAY_LABELS.map((_, day) => {
                    const cell = cellMap.get(`${day}-${period}`);
                    return (
                      <div className="timetableGridCell" key={day}>
                        {cell && (
                          <div className={`timetableCourse is-${cell.category}`}>
                            <span className="timetableCourseCode">
                              {cell.code}
                            </span>
                            <span className="timetableCourseName">
                              {cell.name}
                            </span>
                            <span className="timetableCourseLabel">
                              {cell.label}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>

          {/* この時間割の属性（匿名）：ステップ2の共有設定に応じて出し分ける */}
          <div className="timetableAttrBox ttShareAttrBox">
            <h3 className="timetableAttrTitle">この時間割の属性（匿名）</h3>
            {!settings.shareTimetable ? (
              <p className="ttShareAttrPrivate">非公開です</p>
            ) : (
              <dl className="ttShareAttrList">
                {settings.shareEnrollYear && (
                  <div className="timetableAttrItem">
                    <dt className="timetableAttrLabel">
                      <Calendar aria-hidden="true" />
                      入学年度
                    </dt>
                    <dd className="timetableAttrValue">
                      {profile?.enrollYear ?? "未設定"}
                    </dd>
                  </div>
                )}
                {settings.shareMajor && (
                  <div className="timetableAttrItem">
                    <dt className="timetableAttrLabel">
                      <GraduationCap aria-hidden="true" />
                      専攻・分野
                    </dt>
                    <dd className="timetableAttrValue">
                      {profile?.major ?? "未設定"}
                    </dd>
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
