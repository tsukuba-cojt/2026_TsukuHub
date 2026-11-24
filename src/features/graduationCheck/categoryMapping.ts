/**
 * 要件データのグループ → TsukuHub 5区分のマッピング
 *
 * 参考リポジトリ（Mimori256/Graduation-Checker, MPL-2.0）の選択要件は
 * group 番号＋表示名（groups: [番号, 最低, 最高, 表示名]）で管理されている。
 * TsukuHub の5区分への変換はこのファイルに集約する（学類・年度で表示名が
 * 変わってもここだけ直せばよい）。
 *
 * 対応が取れないグループは「対象外」とし、区分集計に含めない
 * （誤って専門等へ混ぜない）。
 */

import type { CategoryKey } from "./types";

/** 選択科目のグループ表示名 → 区分。ここにない表示名は集計対象外 */
export const groupLabelToCategory: Record<
  string,
  Exclude<CategoryKey, "compulsory">
> = {
  専門科目選択: "specialized",
  専門基礎科目選択: "specializedFoundation",
  共通科目選択: "common",
  関連科目選択: "related",
};

/** 5区分の表示名（結果ページの要件項目リストと対応） */
export const categoryLabels: Record<CategoryKey, string> = {
  compulsory: "必修科目",
  specialized: "選択科目（専門）",
  specializedFoundation: "選択科目（専門基礎）",
  common: "選択科目（共通）",
  related: "選択科目（関連）",
};

/** 結果オブジェクトでの区分の表示順 */
export const categoryOrder: readonly CategoryKey[] = [
  "compulsory",
  "specialized",
  "specializedFoundation",
  "common",
  "related",
];
