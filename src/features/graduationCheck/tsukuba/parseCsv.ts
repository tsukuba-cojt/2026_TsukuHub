/**
 * TWINS 成績CSVのパース
 *
 * 列は位置で読む（参考: Mimori256/Graduation-Checker src/features/loadCSV.ts,
 * https://github.com/Mimori256/Graduation-Checker, MPL-2.0）。
 * 1行目はヘッダーとしてスキップする。
 *
 * 列位置: [2]=科目番号 / [3]=科目名 / [4]=単位数 / [7]=総合評価 / [9]=開講年度
 */

import Papa from "papaparse";
import type { Course, CsvRowError, Grade, ParseCsvResult } from "../core/types";

const COL_ID = 2;
const COL_NAME = 3;
const COL_UNIT = 4;
const COL_GRADE = 7;
const COL_YEAR = 9;
const MIN_COLUMNS = 10;

const VALID_GRADES: readonly Grade[] = [
  "A+",
  "A",
  "B",
  "C",
  "D",
  "P",
  "F",
  "認",
  "履修中",
];

const isGrade = (value: string): value is Grade =>
  (VALID_GRADES as readonly string[]).includes(value);

/**
 * 成績CSVのテキストを科目リストへ変換する。
 * 判定はすべてクライアント内で完結させる前提のため、この関数は副作用を持たない。
 * 不正な行は捨てずに errors へ行番号・理由付きで返す（UIがエラー表示する）。
 */
export const parseGradesCsv = (csvText: string): ParseCsvResult => {
  // 先頭のBOMを除去してからパースする
  const parsed = Papa.parse<string[]>(csvText.replace(/^\uFEFF/, ""), {
    skipEmptyLines: true,
  });

  const courses: Course[] = [];
  const errors: CsvRowError[] = [];

  const pushError = (rowNumber: number, reason: string, row: string[]) => {
    errors.push({ rowNumber, reason, raw: row.join(",").slice(0, 200) });
  };

  parsed.data.forEach((row, index) => {
    // 1行目はヘッダー
    if (index === 0) return;
    const rowNumber = index + 1;

    if (row.length < MIN_COLUMNS) {
      pushError(
        rowNumber,
        `列数が不足しています（${row.length}列。${MIN_COLUMNS}列以上が必要）`,
        row
      );
      return;
    }

    const id = row[COL_ID].trim();
    const name = row[COL_NAME].trim();
    const unitText = row[COL_UNIT].replaceAll(" ", "");
    const gradeText = row[COL_GRADE].trim();
    const yearText = row[COL_YEAR].trim();

    if (name === "") {
      pushError(rowNumber, "科目名が空です", row);
      return;
    }

    const unit = Number.parseFloat(unitText);
    if (Number.isNaN(unit)) {
      pushError(rowNumber, `単位数を数値として読めません（"${unitText}"）`, row);
      return;
    }

    if (!isGrade(gradeText)) {
      pushError(
        rowNumber,
        `総合評価が不明です（"${gradeText}"。A+/A/B/C/D/P/F/認/履修中 のいずれかが必要）`,
        row
      );
      return;
    }

    const year = Number.parseInt(yearText, 10);
    if (Number.isNaN(year)) {
      pushError(rowNumber, `開講年度を数値として読めません（"${yearText}"）`, row);
      return;
    }

    courses.push({ id, name, unit, grade: gradeText, year });
  });

  return { courses, errors };
};
