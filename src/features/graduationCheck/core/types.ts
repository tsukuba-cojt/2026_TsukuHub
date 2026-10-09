/**
 * 卒業要件チェック 判定エンジンの型定義
 *
 * 一部の型（Grade / Course / 要件データ形式）は Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker) の設計を踏襲している。
 * Licensed under the Mozilla Public License, v. 2.0 (MPL-2.0).
 * If a copy of the MPL was not distributed with this file, You can obtain one
 * at https://mozilla.org/MPL/2.0/.
 */

// ── 成績・科目 ──

/** TWINS 成績CSVの総合評価。不合格は D / F。P・認は合格だがGPA対象外 */
export type Grade =
  | "A+"
  | "A"
  | "B"
  | "C"
  | "D"
  | "P"
  | "F"
  | "認"
  | "履修中";

/** GPA計算の対象になる評価（P/認/履修中/F は対象外） */
export type GpaGrade = Exclude<Grade, "P" | "F" | "認" | "履修中">;

/** 成績CSVの1行をパースした科目 */
export type Course = {
  /** 科目番号（筑波）または KOAN 科目区分キー（大阪） */
  id: string;
  /** 科目名 */
  name: string;
  /** 単位数 */
  unit: number;
  /** 総合評価 */
  grade: Grade;
  /** 開講年度 */
  year: number;
  /** KOAN: 科目詳細区分 */
  subjectGenre?: string;
  /** KOAN: 科目小区分 */
  subjectSubGenre?: string;
  /** KOAN: 修得学期 */
  semester?: string;
  /** KOAN: リーディングプログラム科目 */
  readingProgram?: string;
  /** KOAN: 知のジムナスティックス科目 */
  gymnastics?: string;
  /** 授業カタログ解決後の科目番号（講義詳細リンク用） */
  catalogCourseNumber?: string;
};

/** CSVのパースに失敗した行（UIがエラー表示できる形で返す） */
export type CsvRowError = {
  /** CSV内の行番号（1始まり。ヘッダー行=1） */
  rowNumber: number;
  /** 失敗理由 */
  reason: string;
  /** 元の行の内容（先頭200文字） */
  raw: string;
};

export type ParseCsvResult = {
  courses: Course[];
  errors: CsvRowError[];
};

// ── 卒業要件データ ──

/**
 * 選択要件: [科目番号プレフィックス群, 最低単位, 最高単位, 除外要件か, 表示名, グループ番号]
 */
export type SelectRequirementTuple = [
  codes: string[],
  minimum: number,
  maximum: number,
  isExcludeRequirement: boolean,
  message: string,
  group: number,
  options?: {
    /** 科目番号だけで表せない選択科目を科目名の完全一致で追加する */
    includeCourseNames?: string[];
    /** プレフィックスには該当するが、この選択要件からは除外する科目名 */
    excludeCourseNames?: string[];
    /** プレフィックスには該当するが、この選択要件からは除外する科目番号プレフィックス */
    excludeCodes?: string[];
  },
];

/** 選択科目グループ: [グループ番号, 最低単位, 最高単位, グループ表示名] */
export type GroupTuple = [
  group: number,
  minimum: number,
  maximum: number,
  label: string,
];

export type GradRequirement = {
  header: {
    department: string;
    major: string;
    /** 対象の入学年度。単年は数値、範囲は "2022~2024" のような文字列 */
    enrollYear: number | string;
  };
  courses: {
    compulsory: string[];
    compulsorySumUnit: number;
    select: SelectRequirementTuple[];
    selectMinimumUnit: number;
    groups: GroupTuple[];
    /** true のとき、選択小区分ごとの最低単位も区分進捗に反映する */
    enforceSelectMinimums?: boolean;
  };
};

/** 要件データの選択キー（大学・学部 × 入学年度） */
export type RequirementId = string;

export type GradRequirementTable = Record<RequirementId, GradRequirement>;

// ── 判定の中間結果 ──

/** 必修科目1件（または科目群1件）の判定結果 */
export type CompulsoryResult = {
  name: string;
  /** タグ記法（::）による科目群要件か */
  isCourseGroup: boolean;
  passed: boolean;
  /** 科目群要件のときの必要単位数 */
  minimumUnit?: number;
  /** この要件にマッチした科目 */
  courses: Course[];
  /** 代替科目（//記法）で充足を試みたときの科目名一覧 */
  alternative?: string;
};

/** 選択要件1件の判定結果 */
export type SelectResult = {
  codes: string[];
  minimum: number;
  maximum: number;
  isExcludeRequirement: boolean;
  message: string;
  group: number;
  /** この要件にマッチした科目 */
  courses: Course[];
};

// ── 5区分の集計 ──

/** TsukuHub の要件5区分 */
export type CategoryKey =
  | "compulsory"
  | "specialized"
  | "specializedFoundation"
  | "common"
  | "related";

/** 単位数と割合の2系統集計。確定=履修中を除く / 見込み=履修中を含む */
export type UnitProgress = {
  /** 必要単位数 */
  requiredUnits: number;
  /** 取得済み単位（合格確定のみ。上限キャップ後） */
  earnedUnits: number;
  /** 見込み単位（履修中を合格扱いで含めた値。上限キャップ後） */
  prospectiveUnits: number;
  /** 取得割合(%)（確定。実値のまま100%超もあり得る） */
  percent: number;
  /** UI表示用に100でクランプした取得割合(%) */
  percentClamped: number;
  /** 見込み割合(%)（実値） */
  prospectivePercent: number;
  /** UI表示用に100でクランプした見込み割合(%) */
  prospectivePercentClamped: number;
};

export type CategoryResult = UnitProgress & {
  category: CategoryKey;
  /** 表示名（例: 必修科目 / 選択科目（専門）） */
  label: string;
  /** 選択区分の上限単位数（必修は undefined） */
  maxUnits?: number;
};

// ── 最終的な判定結果オブジェクト ──

export type GraduationCheckReport = {
  /** 使用した要件データの情報 */
  requirement: {
    id: RequirementId;
    department: string;
    major: string;
    /** 対象の入学年度。単年は数値、範囲は "2022~2024" のような文字列 */
    enrollYear: number | string;
  };
  /** 全体サマリー */
  summary: UnitProgress & {
    /** 不足単位数（確定ベース。0で下限） */
    shortageUnits: number;
    /** 見込みベースの不足単位数（0で下限） */
    prospectiveShortageUnits: number;
  };
  gpa: {
    /** GPA（対象科目が1つもない場合は null） */
    value: number | null;
    /** GPAの上限（A+ のレート） */
    max: number;
    /** GPA対象の総単位数（A+〜D） */
    targetUnits: number;
    /**
     * 取得単位中 A・A+ の割合(%)。
     * 分母・分子とも合格評価（A+/A/B/C）のみで、D・F・P・認・履修中は含まない。
     * 対象科目が1つもない場合は null
     */
    aRatePercent: number | null;
  };
  /** 5区分の集計（必修 → 専門 → 専門基礎 → 共通 → 関連 の順） */
  categories: CategoryResult[];
  /** 詳細（UIでの内訳表示・デバッグ用） */
  details: {
    compulsoryResults: CompulsoryResult[];
    selectResults: SelectResult[];
    /** どの要件にもマッチしなかった科目（卒業要件に含まれない単位） */
    uncountedCourses: Course[];
    /** 5区分に対応しないグループの単位数（集計対象外。グループ表示名→単位数） */
    unmappedGroupUnits: Record<string, number>;
  };
};
