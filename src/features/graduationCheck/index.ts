/**
 * 卒業要件チェック 判定エンジン（ロジック層）
 *
 * 成績CSVを入力して判定結果オブジェクトを返す純粋関数群。
 * 判定はすべてクライアント内で完結し、成績をサーバーへ送信しない。
 *
 * 使い方:
 *   const { courses, errors } = parseGradesCsv(csvText);
 *   const ids = resolveRequirementIds("情報メディア創成学類", 2023); // → ["mast-22"]
 *   const report = checkGraduation(courses, ids[0]);
 *
 * 判定ロジックは Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker, MPL-2.0) を踏襲している。
 * 詳細は同ディレクトリの README.md を参照。
 */

export { parseGradesCsv } from "./parseCsv";
export {
  checkGraduation,
  listSupportedRequirements,
  resolveRequirementIds,
} from "./checkGraduation";
export { calcGpa, calcARatePercent, GPA_MAX } from "./gpa";
export { categoryLabels, categoryOrder } from "./categoryMapping";
export type {
  CategoryKey,
  CategoryResult,
  CompulsoryResult,
  Course,
  CsvRowError,
  GradRequirement,
  GraduationCheckReport,
  Grade,
  ParseCsvResult,
  RequirementId,
  SelectResult,
  UnitProgress,
} from "./types";
