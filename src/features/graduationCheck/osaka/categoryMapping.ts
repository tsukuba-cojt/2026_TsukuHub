/**
 * 大阪大学 要件グループ → TsukuHub 5区分のマッピング
 *
 * 根拠: CELAS「履修の手引」付録1 卒業要件単位数一覧表
 * https://www.celas.osaka-u.ac.jp/education/prerequisite/
 */

import type { CategoryKey } from "../core/types";

export const groupLabelToCategory: Record<
  string,
  Exclude<CategoryKey, "compulsory">
> = {
  全学共通教育科目: "common",
  専門基礎教育科目: "specializedFoundation",
  専門教育科目: "specialized",
  国際性涵養教育系科目: "related",
  教職教育科目: "related",
};

export const categoryLabels: Record<CategoryKey, string> = {
  compulsory: "必修科目",
  specialized: "専門教育科目",
  specializedFoundation: "専門基礎教育科目",
  common: "全学共通教育科目",
  related: "国際性涵養・教職等",
};

export const categoryOrder: readonly CategoryKey[] = [
  "compulsory",
  "common",
  "specializedFoundation",
  "specialized",
  "related",
];
