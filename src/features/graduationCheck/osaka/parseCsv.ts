/**
 * 大阪大学 KOAN 成績CSVのパース
 *
 * 参考: Happa8/KOAN-grade-analyzer (https://github.com/Happa8/KOAN-grade-analyzer)
 * KOAN「単位修得状況照会」→「ファイルに出力する」で取得したCSVを想定。
 */

import type { Course, CsvRowError, Grade, ParseCsvResult } from "../core/types";

const GRADE_TABLE_HEADER =
  '"学生所属コード","学籍番号","画面指定年度","画面指定学期","No.","科目詳細区分","科目小区分","開講科目名 ","リーディングプログラム科目","知のジムナスティックス科目","単位数","修得年度","修得学期","評語","合否"';

const normalizeGradeChar = (value: string) =>
  value
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    )
    .trim();

const mapKoanGrade = (
  gradeText: string,
  passOrFail: string
): Grade | null => {
  const grade = normalizeGradeChar(gradeText);
  const pass = normalizeGradeChar(passOrFail);

  if (pass === "認") return "認";
  if (grade === "S" || grade === "Ｓ") return "A+";
  if (grade === "A" || grade === "Ａ") return "A";
  if (grade === "B" || grade === "Ｂ") return "B";
  if (grade === "C" || grade === "Ｃ") return "C";
  if (grade === "D" || grade === "Ｄ") return "D";
  if (grade === "F" || grade === "Ｆ") return "F";
  if (pass === "合" && grade === "") return "P";
  if (pass === "否") return "F";
  if (grade === "" && pass === "") return "履修中";
  if (grade === "履修中") return "履修中";
  return null;
};

const parseQuotedRow = (line: string): string[] => {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
};

/** ArrayBuffer から KOAN CSV テキストへデコード（Shift_JIS / UTF-8 自動判定） */
export const decodeKoanCsvBuffer = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  for (const encoding of ["utf-8", "shift-jis", "euc-jp"] as const) {
    try {
      const text = new TextDecoder(encoding).decode(bytes);
      if (text.includes("科目詳細区分") || text.includes("開講科目名")) {
        return text.replace(/^\uFEFF/, "");
      }
    } catch {
      // try next encoding
    }
  }
  return new TextDecoder().decode(bytes).replace(/^\uFEFF/, "");
};

/** File から KOAN CSV テキストを読み込む */
export const readKoanCsvFile = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  return decodeKoanCsvBuffer(buffer);
};

/**
 * KOAN 成績CSVのテキストを科目リストへ変換する。
 */
export const parseGradesCsv = (csvText: string): ParseCsvResult => {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r\n|\n/)
    .filter((line) => line.trim() !== "");

  const headerIndex = lines.findIndex(
    (line) =>
      line.includes("科目詳細区分") &&
      line.includes("修得年度") &&
      line.includes("評語")
  );

  if (headerIndex === -1) {
    return {
      courses: [],
      errors: [
        {
          rowNumber: 1,
          reason:
            "KOAN成績CSVのヘッダー行が見つかりません。単位修得状況照会から出力したCSVかご確認ください。",
          raw: lines[0]?.slice(0, 200) ?? "",
        },
      ],
    };
  }

  const courses: Course[] = [];
  const errors: CsvRowError[] = [];

  lines.slice(headerIndex + 1).forEach((line, index) => {
    const rowNumber = headerIndex + 2 + index;
    const row = parseQuotedRow(line);
    if (row.length < 15) {
      errors.push({
        rowNumber,
        reason: `列数が不足しています（${row.length}列。15列必要）`,
        raw: line.slice(0, 200),
      });
      return;
    }

    const subjectGenre = row[5].trim();
    const subjectSubGenre = row[6].trim();
    const name = row[7].trim();
    const unitText = row[10].replaceAll(" ", "");
    const yearText = row[11].trim();
    const semester = row[12].trim();
    const gradeText = row[13].trim();
    const passOrFail = row[14].trim();

    if (name === "") {
      errors.push({ rowNumber, reason: "科目名が空です", raw: line.slice(0, 200) });
      return;
    }

    const unit = Number.parseFloat(unitText);
    if (Number.isNaN(unit)) {
      errors.push({
        rowNumber,
        reason: `単位数を数値として読めません（"${unitText}"）`,
        raw: line.slice(0, 200),
      });
      return;
    }

    const grade = mapKoanGrade(gradeText, passOrFail);
    if (grade === null) {
      errors.push({
        rowNumber,
        reason: `評語が不明です（"${gradeText}" / 合否="${passOrFail}"）`,
        raw: line.slice(0, 200),
      });
      return;
    }

    const year = Number.parseInt(yearText, 10);
    if (Number.isNaN(year)) {
      errors.push({
        rowNumber,
        reason: `修得年度を数値として読めません（"${yearText}"）`,
        raw: line.slice(0, 200),
      });
      return;
    }

    const id = subjectGenre
      ? `${subjectGenre}::${subjectSubGenre || name}`
      : name;

    const readingProgram = row[8].trim();
    const gymnastics = row[9].trim();

    courses.push({
      id,
      name,
      unit,
      grade,
      year,
      subjectGenre,
      subjectSubGenre,
      semester,
      readingProgram: readingProgram || undefined,
      gymnastics: gymnastics || undefined,
    });
  });

  return { courses, errors };
};

export { GRADE_TABLE_HEADER };
