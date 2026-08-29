import type { TimetableModuleKey } from "../../types/timetable";
import {
  timetableModuleLabels,
  timetableModuleOrder,
} from "../../types/timetable";

export type TermUiConfig = {
  /** 授業検索スライダーの最大値（筑波=6 / 大阪=4） */
  classModuleMax: number;
  /** 授業検索のラベル（indexは1始まり） */
  classModuleMarks: Record<number, string>;
  /** 授業検索フィールド名 */
  classModuleFieldLabel: string;
  /** 時間割タブの並び */
  timetableOrder: TimetableModuleKey[];
  /** 時間割タブ表示名 */
  timetableLabels: Record<TimetableModuleKey, string>;
  defaultTimetableModule: TimetableModuleKey;
};

const tsukubaTermUi: TermUiConfig = {
  classModuleMax: 6,
  classModuleMarks: {
    1: "春A",
    2: "春B",
    3: "春C",
    4: "秋A",
    5: "秋B",
    6: "秋C",
  },
  classModuleFieldLabel: "モジュール",
  timetableOrder: [...timetableModuleOrder],
  timetableLabels: { ...timetableModuleLabels },
  defaultTimetableModule: "springA",
};

const osakaTermUi: TermUiConfig = {
  classModuleMax: 4,
  classModuleMarks: {
    1: "春",
    2: "夏",
    3: "秋",
    4: "冬",
  },
  classModuleFieldLabel: "開講期",
  // 大阪は春・夏・秋・冬。筑波の C モジュール枠は使わない。
  timetableOrder: ["springA", "springB", "fallA", "fallB", "other"],
  timetableLabels: {
    springA: "春",
    springB: "夏",
    springC: "春",
    fallA: "秋",
    fallB: "冬",
    fallC: "秋",
    other: "その他",
  },
  defaultTimetableModule: "springA",
};

export const getTermUi = (universitySlug?: string | null): TermUiConfig =>
  universitySlug === "osaka" ? osakaTermUi : tsukubaTermUi;

/** 大阪の開講期文字列が、授業検索の 1..4 範囲と交差するか */
export const osakaTermMatchesModuleRange = (
  term: string,
  start: number,
  end: number
): boolean => {
  const normalized = term.replace(/\s+/g, "");
  const inRange = (point: number) => point >= start && point <= end;
  const overlaps = (a: number, b: number) => !(end < a || start > b);

  if (!normalized) return true;
  if (/集中/.test(normalized) || /年度跨/.test(normalized)) return true;
  if (/通年/.test(normalized)) return start === 1 && end === 4;

  if (/春[～〜\-－–—]夏/.test(normalized)) return overlaps(1, 2);
  if (/秋[～〜\-－–—]冬/.test(normalized)) return overlaps(3, 4);

  if (/^春学期$/.test(normalized) || /^春$/.test(normalized)) return inRange(1);
  if (/^夏学期$/.test(normalized) || /^夏$/.test(normalized)) return inRange(2);
  if (/^秋学期$/.test(normalized) || /^秋$/.test(normalized)) return inRange(3);
  if (/^冬学期$/.test(normalized) || /^冬$/.test(normalized)) return inRange(4);

  // 春～夏学期 / 秋～冬学期 は上の部分一致で拾えるが、保険で再判定
  if (normalized.includes("春") && normalized.includes("夏")) return overlaps(1, 2);
  if (normalized.includes("秋") && normalized.includes("冬")) return overlaps(3, 4);

  return true;
};
