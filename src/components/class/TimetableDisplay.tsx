import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, GraduationCap, Layers3, X } from "lucide-react";
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

export function TimetableHistoryCarousel({
  histories,
  moduleForHistory,
  onOpen,
  label = "時間割一覧",
}: {
  histories: TimetableHistory[];
  moduleForHistory: (history: TimetableHistory) => TimetableModuleKey;
  onOpen: (history: TimetableHistory) => void;
  label?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isAllOpen, setIsAllOpen] = useState(false);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    const updateScrollButtons = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      setCanScrollLeft(element.scrollLeft > 2);
      setCanScrollRight(element.scrollLeft < maxScrollLeft - 2);
    };

    updateScrollButtons();
    element.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      element.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [histories.length]);

  useEffect(() => {
    if (!isAllOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAllOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isAllOpen]);

  const scrollByCard = (direction: -1 | 1) => {
    const element = scrollerRef.current;
    if (!element) return;
    const firstCard = element.querySelector<HTMLElement>(".timetableResultCard");
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 20;
    const distance = (firstCard?.getBoundingClientRect().width ?? 310) + gap;
    element.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  if (histories.length === 0) return null;

  const cards = histories.map((history) => (
    <TimetableHistoryCard
      history={history}
      moduleKey={moduleForHistory(history)}
      onOpen={() => onOpen(history)}
      key={history.id}
    />
  ));

  return (
    <>
      <div className="timetableCarousel">
        <button
          type="button"
          className="timetableCarouselArrow"
          aria-label="前の時間割を見る"
          onClick={() => scrollByCard(-1)}
          disabled={!canScrollLeft}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <div ref={scrollerRef} className="timetableResultsScroller">
          {cards}
        </div>
        <button
          type="button"
          className="timetableCarouselArrow"
          aria-label="次の時間割を見る"
          onClick={() => scrollByCard(1)}
          disabled={!canScrollRight}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <div className="timetableCarouselFooter">
        <span>横にスライド、または矢印で切り替えられます</span>
        {histories.length > 1 && (
          <button type="button" onClick={() => setIsAllOpen(true)}>
            すべて見る（{histories.length}件）
          </button>
        )}
      </div>
      {isAllOpen && (
        <div
          className="timetableAllOverlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAllOpen(false);
          }}
        >
          <section className="timetableAllDialog" role="dialog" aria-modal="true" aria-label={label}>
            <div className="timetableAllDialogHeader">
              <div>
                <p>一覧表示</p>
                <h2>{label}</h2>
              </div>
              <button
                type="button"
                className="timetableAllDialogClose"
                aria-label="一覧を閉じる"
                onClick={() => setIsAllOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="timetableAllGrid">{cards}</div>
          </section>
        </div>
      )}
    </>
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
          <dt>通期取得単位数</dt>
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
