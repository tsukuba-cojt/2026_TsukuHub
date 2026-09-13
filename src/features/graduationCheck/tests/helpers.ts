import type { Course, Grade } from "../core/types";

/** テスト用の科目ビルダー */
export const course = (
  id: string,
  name: string,
  unit: number,
  grade: Grade = "A",
  year = 2023
): Course => ({ id, name, unit, grade, year });

/** TWINS成績CSVの行（列位置: [2]=科目番号 [3]=科目名 [4]=単位数 [7]=総合評価 [9]=年度） */
export const csvRow = (
  id: string,
  name: string,
  unit: string,
  grade: string,
  year: string
): string =>
  [
    "202300000",
    "筑波 太郎",
    id,
    name,
    unit,
    "-",
    "-",
    grade,
    "-",
    year,
    "-",
  ].join(",");

export const CSV_HEADER =
  "学籍番号,氏名,科目番号,科目名,単位数,春学期,秋学期,総合評価,科目区分,開講年度,備考";
