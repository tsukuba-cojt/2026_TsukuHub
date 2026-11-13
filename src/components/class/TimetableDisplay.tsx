import { Fragment } from "react";
import { ChevronRight, Clock3, GraduationCap, Layers3 } from "lucide-react";
import type {
  TimetableCourse,
  TimetableHistory,
  TimetableModuleKey,
  TimetableSpecialType,
} from "../../types/timetable";
import {
  timetableModuleLabels,
  timetableSpecialLabels,
} from "../../types/timetable";
import "../../styles/class/Timetable.css";

const days = ["月", "火", "水", "木", "金"] as const;
const periods = [1, 2, 3, 4, 5, 6];

const categoryTone = (course: TimetableCourse) => {
  if (course.category === "compulsory") return "isRequired";
  if (course.category === "common" || course.category === "related") return "isCommon";
  return "isSpecialized";
};

const moduleCourses = (
  history: TimetableHistory,
  moduleKey: TimetableModuleKey
) =>
  history.courses.filter((course) =>
    moduleKey === "other"
      ? course.modules.includes("other") || course.specialType
      : course.modules.includes(moduleKey)
  );

const coursesForCell = (
  courses: TimetableCourse[],
  day: (typeof days)[number],
  period: number
) =>
  courses.filter((course) =>
    course.slots.some((slot) => slot.day === day && slot.period === period)
  );

function TimetableMiniGrid({
  history,
  moduleKey,
}: {
  history: TimetableHistory;
  moduleKey: TimetableModuleKey;
}) {
  const courses = moduleCourses(history, moduleKey);

  return (
    <div className="timetableMiniGrid" aria-label={`${history.displayName} ${timetableModuleLabels[moduleKey]}`}>
      <div className="timetableMiniCorner" />
      {days.map((day) => (
        <span className="timetableMiniDay" key={day}>
          {day}
        </span>
      ))}
      {periods.map((period) => (
        <Fragment key={`mini-row-${period}`}>
          <span className="timetableMiniPeriod" key={`period-${period}`}>
            {period}
          </span>
          {days.map((day) => {
            const cellCourses = coursesForCell(courses, day, period);
            return (
              <div className="timetableMiniCell" key={`${day}-${period}`}>
                {cellCourses.slice(0, 2).map((course) => (
                  <span
                    className={`timetableMiniBlock ${categoryTone(course)}`}
                    title={course.courseName}
                    key={`${course.courseCode}-${day}-${period}`}
                  />
                ))}
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

export function TimetableHistoryCard({
  history,
  moduleKey,
  onOpen,
}: {
  history: TimetableHistory;
  moduleKey: TimetableModuleKey;
  onOpen: () => void;
}) {
  return (
    <article className="timetableResultCard">
      <div className="timetableCardHeader">
        <span className="timetableAvatar" aria-hidden="true" />
      <div>
        <h3>{history.department} {history.studentYearLabel}</h3>
        <p>{history.admissionYear}年度入学・{history.academicYear}年度履修・{history.trackLabel}</p>
      </div>
      </div>
      <TimetableMiniGrid history={history} moduleKey={moduleKey} />
      <button type="button" className="timetableDetailLink" onClick={onOpen}>
        詳細を見る
        <ChevronRight aria-hidden="true" />
      </button>
    </article>
  );
}

function TimetableFullGrid({
  history,
  moduleKey,
}: {
  history: TimetableHistory;
  moduleKey: TimetableModuleKey;
}) {
  const courses = moduleCourses(history, moduleKey).filter(
    (course) => course.slots.length > 0
  );

  return (
    <div className="timetableFullGridWrap">
      <div className="timetableFullGrid">
        <div className="timetableFullCorner" />
        {days.map((day) => (
          <span className="timetableFullDay" key={day}>
            {day}
          </span>
        ))}
        {periods.map((period) => (
          <Fragment key={`full-row-${period}`}>
            <span className="timetableFullPeriod" key={`period-${period}`}>
              {period}
            </span>
            {days.map((day) => {
              const cellCourses = coursesForCell(courses, day, period);
              return (
                <div className="timetableFullCell" key={`${day}-${period}`}>
                  {cellCourses.map((course) => (
                    <div
                      className={`timetableCourseBlock ${categoryTone(course)}`}
                      key={`${course.courseCode}-${day}-${period}`}
                    >
                      <span>{course.courseCode}</span>
                      <strong>{course.courseName}</strong>
                      {course.instructor && <small>{course.instructor}</small>}
                    </div>
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function SpecialCourseList({
  history,
  moduleKey,
}: {
  history: TimetableHistory;
  moduleKey: TimetableModuleKey;
}) {
  const courses = moduleCourses(history, moduleKey).filter(
    (course) => course.specialType || course.slots.length === 0
  );
  type SpecialGroup = TimetableSpecialType | "unknown";
  const groups: SpecialGroup[] = ["intensive", "consultation", "anytime", "nt", "unknown"];
  const groupLabels: Record<SpecialGroup, string> = {
    ...timetableSpecialLabels,
    unknown: "分類不明",
  };

  return (
    <div className="timetableSpecialPanel">
      {groups.map((group) => {
        const groupCourses = courses.filter((course) =>
          group === "unknown"
            ? !course.specialType
            : course.specialType === group
        );
        return (
          <div className="timetableSpecialRow" key={group}>
            <strong>{groupLabels[group]}</strong>
            <div>
              {groupCourses.length === 0 ? (
                <span className="timetableSpecialEmpty">なし</span>
              ) : (
                groupCourses.map((course) => (
                  <span
                    className={`timetableSpecialChip ${categoryTone(course)}`}
                    key={`${course.courseCode}-${group}`}
                  >
                    <small>{course.courseCode}</small>
                    {course.courseName}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TimetableLegend() {
  return (
    <div className="timetableLegend" aria-label="時間割の色凡例">
      <span><i className="isRequired" />必修</span>
      <span><i className="isSpecialized" />選択（専門・専門基礎）</span>
      <span><i className="isCommon" />選択（共通・関連・その他）</span>
    </div>
  );
}

export function TimetableAttributeCard({ history }: { history: TimetableHistory }) {
  return (
    <section className="timetableAttributeCard">
      <h3>この時間割の属性（匿名）</h3>
      <dl>
        <div>
          <dt><Clock3 aria-hidden="true" />入学年度</dt>
          <dd>{history.admissionYear}年度</dd>
        </div>
        <div>
          <dt><GraduationCap aria-hidden="true" />学類</dt>
          <dd>{history.department}</dd>
        </div>
        <div>
          <dt><Clock3 aria-hidden="true" />学年</dt>
          <dd>{history.studentYearLabel}</dd>
        </div>
        <div>
          <dt><Layers3 aria-hidden="true" />専攻・分野</dt>
          <dd>{history.major || history.trackLabel}</dd>
        </div>
        <div>
          <dt>取得単位数</dt>
          <dd>{history.earnedUnits}単位</dd>
        </div>
        <div>
          <dt>備考</dt>
          <dd>なし</dd>
        </div>
      </dl>
    </section>
  );
}

export function TimetableDetailView({
  history,
  activeModule,
}: {
  history: TimetableHistory;
  activeModule: TimetableModuleKey;
}) {
  return activeModule === "other" ? (
    <SpecialCourseList history={history} moduleKey={activeModule} />
  ) : (
    <TimetableFullGrid history={history} moduleKey={activeModule} />
  );
}
