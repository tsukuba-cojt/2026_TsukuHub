/**
 * 履修登録の上限解放の目安
 *
 * 学類ごとの条件は履修要覧の数値をこちらで持つ。
 * 判定は CSV 上の最新開講年度を「前年度」とみなす（来年度上限の予測）。
 */

import { courseCodeTypes } from "./data/courseCodeTypes";
import type { Course, Grade } from "./types";
import { beginWithMatch, isFailed } from "./utils";

export type CreditCapReleaseType = "a_rate" | "gpa" | "absolute";
export type CreditCapBasis = "credit" | "applied" | "count";
export type CreditCapState = "locked" | "inReach" | "unmet" | "unknown" | "unsupported";

export type CreditCapRule = {
  department: string;
  releaseType: CreditCapReleaseType;
  /** 基準の年間上限（解放前） */
  baseCap: number;
  /** 解放後の上限。学類長判断などで数値がないときは null */
  releasedCap: number | null;
  releasedCapText: string;
  minEarnedCredits: number | null;
  aRateThreshold: number | null;
  numeratorGrades: readonly Grade[];
  basis: CreditCapBasis;
  gpaThreshold: number | null;
  absoluteCredits: number | null;
  note?: string;
};

export type CreditCapForecast = {
  state: CreditCapState;
  rule: CreditCapRule | null;
  /** 判定に使った開講年度（year スコープ） */
  targetYear: number | null;
  minCreditsShort: number;
  aRateNow: number | null;
  aNeededCourses: number | null;
  inProgressCount: number;
};

const EPS = 1e-9;
const round2 = (value: number) => Math.round(value * 100) / 100;

const A_PLUS_A: readonly Grade[] = ["A+", "A"];

const gpaPoints: Partial<Record<Grade, number>> = {
  "A+": 4.3,
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 0.0,
};

/** 情報学群。他学類は表に無いので unsupported */
const creditCapRules: CreditCapRule[] = [
  {
    department: "情報メディア創成学類",
    releaseType: "a_rate",
    baseCap: 45,
    releasedCap: 55,
    releasedCapText: "55単位",
    minEarnedCredits: 40,
    aRateThreshold: 0.6,
    numeratorGrades: A_PLUS_A,
    basis: "applied",
    gpaThreshold: null,
    absoluteCredits: null,
    note: "分母は履修申請した全科目の単位（教職科目を除く）",
  },
  {
    department: "知識情報・図書館学類",
    releaseType: "a_rate",
    baseCap: 45,
    releasedCap: 55,
    releasedCapText: "55単位",
    minEarnedCredits: 40,
    aRateThreshold: 0.7,
    numeratorGrades: A_PLUS_A,
    basis: "credit",
    gpaThreshold: null,
    absoluteCredits: null,
  },
  {
    department: "情報科学類",
    releaseType: "a_rate",
    baseCap: 45,
    releasedCap: 55,
    releasedCapText: "55単位",
    minEarnedCredits: 40,
    aRateThreshold: 0.6,
    numeratorGrades: A_PLUS_A,
    basis: "applied",
    gpaThreshold: null,
    absoluteCredits: null,
    note: "分母は履修申請した全科目の単位（教職科目を除く）",
  },
];

const teachingCodes = courseCodeTypes["教職に関する科目"].codes;
const teachingExcept = courseCodeTypes["教職に関する科目"].except;

const isTeachingCourse = (course: Course): boolean =>
  course.id !== "" &&
  beginWithMatch(course.id, teachingCodes) &&
  !beginWithMatch(course.id, teachingExcept);

const latestYear = (courses: Course[]): number | null => {
  let year: number | null = null;
  for (const course of courses) {
    if (!Number.isFinite(course.year) || course.year <= 0) continue;
    if (year === null || course.year > year) year = course.year;
  }
  return year;
};

const weightOf = (course: Course, basis: CreditCapBasis): number =>
  basis === "count" ? 1 : course.unit;

const sumBy = (courses: Course[], basis: CreditCapBasis): number =>
  courses.reduce((total, course) => total + weightOf(course, basis), 0);

const yearlyGpa = (courses: Course[]): number | null => {
  let points = 0;
  let units = 0;
  for (const course of courses) {
    const rate = gpaPoints[course.grade];
    if (rate === undefined || course.unit <= 0) continue;
    points += rate * course.unit;
    units += course.unit;
  }
  return units > 0 ? round2(points / units) : null;
};

export const findCreditCapRule = (department: string): CreditCapRule | null =>
  creditCapRules.find((rule) => rule.department === department) ?? null;

const emptyForecast = (
  state: CreditCapState,
  rule: CreditCapRule | null
): CreditCapForecast => ({
  state,
  rule,
  targetYear: null,
  minCreditsShort: 0,
  aRateNow: null,
  aNeededCourses: null,
  inProgressCount: 0,
});

/**
 * 来年度の履修登録上限が上がるかの目安。
 * 認は除外。教職科目は分母・分子から外す。
 */
export const creditCapForecast = (
  courses: Course[],
  department: string
): CreditCapForecast => {
  const rule = findCreditCapRule(department);
  if (rule === null) return emptyForecast("unsupported", null);

  const eligible = courses.filter(
    (course) => course.grade !== "認" && !isTeachingCourse(course)
  );
  const targetYear = latestYear(eligible);
  const scoped =
    targetYear === null
      ? []
      : eligible.filter((course) => course.year === targetYear);

  const earned = scoped.filter(
    (course) => !isFailed(course.grade) && course.grade !== "履修中"
  );
  const inProgress = scoped.filter((course) => course.grade === "履修中");
  const failed = scoped.filter((course) => isFailed(course.grade));

  const base: CreditCapForecast = {
    state: "unknown",
    rule,
    targetYear,
    minCreditsShort: 0,
    aRateNow: null,
    aNeededCourses: null,
    inProgressCount: inProgress.length,
  };

  if (earned.length === 0 && inProgress.length === 0) return base;

  const earnedUnits = earned.reduce((total, course) => total + course.unit, 0);
  const projectedUnits =
    earnedUnits + inProgress.reduce((total, course) => total + course.unit, 0);
  const minShort =
    rule.minEarnedCredits === null
      ? 0
      : Math.max(0, round2(rule.minEarnedCredits - projectedUnits));
  const earnedMeetsMin =
    rule.minEarnedCredits === null || earnedUnits >= rule.minEarnedCredits - EPS;
  const projectedMeetsMin = minShort <= EPS;

  if (rule.releaseType === "gpa") {
    const gpaNow = yearlyGpa(earned);
    const threshold = rule.gpaThreshold ?? 0;
    if (gpaNow !== null && gpaNow + EPS >= threshold && earnedMeetsMin) {
      return { ...base, state: "locked", minCreditsShort: 0 };
    }
    const optimistic = yearlyGpa([
      ...earned,
      ...inProgress.map((course) => ({ ...course, grade: "A+" as const })),
    ]);
    if (
      optimistic !== null &&
      optimistic + EPS >= threshold &&
      projectedMeetsMin
    ) {
      return {
        ...base,
        state: "inReach",
        aNeededCourses: inProgress.length,
        minCreditsShort: 0,
      };
    }
    return { ...base, state: "unmet", minCreditsShort: minShort };
  }

  if (rule.releaseType === "absolute") {
    const needed = rule.absoluteCredits ?? 0;
    const aUnits = earned
      .filter((course) => rule.numeratorGrades.includes(course.grade))
      .reduce((total, course) => total + course.unit, 0);
    if (aUnits + EPS >= needed && earnedMeetsMin) {
      return { ...base, state: "locked", minCreditsShort: 0 };
    }
    const projectedA =
      aUnits + inProgress.reduce((total, course) => total + course.unit, 0);
    if (projectedA + EPS >= needed && projectedMeetsMin) {
      return { ...base, state: "inReach", minCreditsShort: 0 };
    }
    return { ...base, state: "unmet", minCreditsShort: minShort };
  }

  const denominatorCourses =
    rule.basis === "applied"
      ? [...earned, ...failed, ...inProgress]
      : [...earned, ...inProgress];
  const denominator = sumBy(denominatorCourses, rule.basis);
  if (denominator <= 0) return base;

  const numerator = sumBy(
    earned.filter((course) => rule.numeratorGrades.includes(course.grade)),
    rule.basis
  );
  const aRateNow = numerator / denominator;
  const need = (rule.aRateThreshold ?? 0) * denominator;

  if (numerator + EPS >= need && earnedMeetsMin) {
    return {
      ...base,
      state: "locked",
      aRateNow,
      aNeededCourses: 0,
      minCreditsShort: 0,
    };
  }

  const sorted = inProgress
    .slice()
    .sort((a, b) => weightOf(b, rule.basis) - weightOf(a, rule.basis));
  let extra = 0;
  let neededCourses = 0;
  for (const course of sorted) {
    if (numerator + extra + EPS >= need) break;
    extra += weightOf(course, rule.basis);
    neededCourses += 1;
  }
  const rateReachable = numerator + extra + EPS >= need;

  if (rateReachable && projectedMeetsMin) {
    return {
      ...base,
      state: "inReach",
      aRateNow,
      aNeededCourses: neededCourses,
      minCreditsShort: 0,
    };
  }

  return {
    ...base,
    state: "unmet",
    aRateNow,
    aNeededCourses: rateReachable ? neededCourses : null,
    minCreditsShort: minShort,
  };
};
