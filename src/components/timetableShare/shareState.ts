/**
 * 時間割共有ウィザードの状態定義。
 *
 * 4ステップ分の入力（同意・共有設定・CSV）をひとつの状態としてウィザード側で
 * 保持するため、型と初期値をここへ集約する。ステップを戻っても入力が消えないのは
 * この状態をウィザード（TimetableShareWizard）が持ち続けているため。
 */

import type { Course } from "../../features/graduationCheck";
import {
  MODULE_TABS,
  OTHER_MODULE,
  type TimetableCategory,
  type TimetableCell,
  type TimetableSchedule,
} from "../class/timetableData";

/** ステップ2で選ぶ共有設定 */
export type ShareSettings = {
  /** 時間割を匿名で共有する（OFF なら以下すべて無効＝完全非公開） */
  shareTimetable: boolean;
  /** 入学年度を共有する */
  shareEnrollYear: boolean;
  /** 専攻・分野を共有する */
  shareMajor: boolean;
  /** 共有するモジュール（MODULE_TABS の部分集合） */
  modules: string[];
  /** 備考（自由記述） */
  note: string;
};

/** ウィザード全体の状態 */
export type TimetableShareState = {
  /** ステップ1：ガイドラインへの同意 */
  agreed: boolean;
  /** ステップ2：共有設定 */
  settings: ShareSettings;
  /** ステップ3：選択されたCSVファイル */
  file: File | null;
  /** ステップ3：CSVをパースした科目（プレビュー用） */
  courses: Course[];
};

/**
 * 初期値。
 * 「できるだけ共有してほしい」という意図に沿って、共有系はすべて ON、
 * モジュールも全選択から始める（ユーザーが明示的に外す形）。
 */
export const INITIAL_SHARE_STATE: TimetableShareState = {
  agreed: false,
  settings: {
    shareTimetable: true,
    shareEnrollYear: true,
    shareMajor: true,
    modules: [...MODULE_TABS],
    note: "",
  },
  file: null,
  courses: [],
};

/** ウィザードのステップ定義（インジケーターと本文で共有する） */
export const SHARE_STEPS = [
  { num: 1, label: "同意の確認" },
  { num: 2, label: "共有情報の選択" },
  { num: 3, label: "アップロード" },
  { num: 4, label: "完了" },
] as const;

// ── プレビュー用の時間割生成 ──────────────────────────────

/**
 * 科目番号の先頭文字から科目区分（＝グリッドの配色）を決める。
 * TimetableDetail の凡例と同じ 3 区分に寄せている。
 */
function categoryOf(courseId: string): TimetableCategory {
  const head = courseId.charAt(0);
  // 1〜4 始まり＝共通科目・基礎科目系
  if (/[0-9]/.test(head)) return "common";
  // 専門科目は学類記号（英字）始まり。末尾が偶数のものを必修扱いにして色を分ける。
  const tail = courseId.charCodeAt(courseId.length - 1);
  return tail % 2 === 0 ? "required" : "elective";
}

/** グリッド内の区分ラベル（セル下段の小さい文字） */
const CATEGORY_LABELS: Record<TimetableCategory, string> = {
  required: "必修",
  elective: "専門選択",
  common: "共通科目",
};

/**
 * 文字列から安定した数値を作る（同じ科目番号なら常に同じ値）。
 * 再レンダリングのたびに配置が変わらないようにするため、乱数は使わない。
 */
function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * パース済みの科目からプレビュー用の時間割を組み立てる。
 *
 * ⚠️ 暫定実装：TWINSの成績CSVには開講曜日・時限・モジュールの情報が含まれない
 * （parseGradesCsv が返す Course は 科目番号 / 科目名 / 単位数 / 総合評価 / 開講年度 のみ）。
 * そのため現状は科目番号から安定なハッシュを作ってコマへ割り当てている。
 * 科目番号→開講曜時の対応表（KdB等）が用意できたら、この関数の中だけを
 * 差し替えればプレビューが正しくなる。呼び出し側は変更不要。
 */
export function buildPreviewSchedule(courses: Course[]): TimetableSchedule {
  const schedule: TimetableSchedule = {};
  MODULE_TABS.forEach((module) => {
    schedule[module] = [];
  });

  // 「履修中」でない＝過去に修得した科目もそのまま並べる（プレビューのため）
  courses.forEach((course) => {
    const hash = hashCode(course.id);
    const module = MODULE_TABS[hash % MODULE_TABS.length];
    // 「その他」タブは曜日・時限を持たない科目の置き場なのでコマは作らない
    if (module === OTHER_MODULE) return;

    const day = hash % 5; // 0=月 … 4=金
    const period = (hash % 6) + 1; // 1〜6限
    const cells = schedule[module];

    // 既に埋まっているコマには置かない（重なりを避ける）
    if (cells.some((cell) => cell.day === day && cell.period === period)) return;

    const category = categoryOf(course.id);
    cells.push({
      day,
      period,
      code: course.id,
      name: course.name,
      label: CATEGORY_LABELS[category],
      category,
    } satisfies TimetableCell);
  });

  return schedule;
}
