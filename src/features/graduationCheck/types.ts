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
  /** 科目番号 */
  id: string;
  /** 科目名 */
  name: string;
  /** 単位数 */
  unit: number;
  /** 総合評価 */
  grade: Grade;
  /** 開講年度 */
  year: number;
  /** 同じ開講年度の静的授業カタログで「同一」とされる別科目番号 */
  equivalentCourseIds?: string[];
  /** 成績CSVとは別に、開講年度の固定カタログから補完する属性。欠損は判定不能。 */
  catalogInstructionMethod?: "lecture" | "seminar" | "experiment" | "practicum" | "other";
  /** 固定KdBに「基幹科目」と明記されている生物資源EC2科目。未確認はundefined。 */
  catalogBioresourcesCore?: true;
};

export type GraduationStudentContext = { courseKey?: string };
export type StudentCourseOption = { key: string; label: string; codes: string[] };

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
    excludeEquivalentCodes?: string[];
    /** 指定番号群から計上する科目数の上限。同一授業・再履修は1科目とする。 */
    maximumIncludedCourses?: { codes: string[]; maximum: number }[];
    /** 親要件に割り当てた単位の内数として、特定コード群に要求する最低単位 */
    minimumIncludedUnits?: {
      /** 親要件内でさらに絞り込む科目番号プレフィックス。suffixesとはOR条件 */
      codes?: string[];
      /** 親要件内でさらに絞り込む科目番号末尾。codesとはOR条件 */
      courseIdSuffixes?: string[];
      /** 親要件内でさらに絞り込む科目名（完全一致）。他の条件とはOR条件 */
      courseNames?: string[];
      /** 既存の番号・名称条件とANDで評価する、固定カタログ由来の授業形態。 */
      instructionMethods?: NonNullable<Course["catalogInstructionMethod"]>[];
      /** 所属コースの番号群へ絞る。未選択・不正なキーは確認不能。 */
      studentCourse?: boolean;
      bioresourcesCore?: boolean;
      minimum: number;
      label: string;
    }[];
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
    studentCourseOptions?: StudentCourseOption[];
    aggregateRequirements?: { group: number; sourceGroups: number[]; minimum: number; label: string }[];
    /** 単位合計とは独立した、選択科目の科目数条件。 */
    courseCountRequirements?: {
      label: string;
      group: number;
      codes: string[];
      instructionMethods: NonNullable<Course["catalogInstructionMethod"]>[];
      minimum: number;
    }[];
  };
};

/** 要件データの選択キー（学類・主専攻 × 入学年度） */
export type RequirementId =
  | "mast-21"
  | "mast-22"
  | "mast-23"
  | "mast-25"
  | "coins-ss-22"
  | "coins-ss-23"
  | "coins-ss-26"
  | "coins-is-22"
  | "coins-is-23"
  | "coins-is-26"
  | "coins-im-22"
  | "coins-im-23"
  | "coins-im-26"
  | "esys-ies-22"
  | "esys-ies-23"
  | "esys-ies-24"
  | "esys-eme-22"
  | "esys-eme-23"
  | "esys-eme-24"
  | "math-22"
  | "math-23"
  | "math-24"
  | "physics-22"
  | "physics-23"
  | "physics-24"
  | "physics-26"
  | "physics-25"
  | "chem-22"
  | "chem-23"
  | "chem-24"
  | "chem-25"
  | "chem-26"
  | "applied-physics-22"
  | "applied-physics-23"
  | "applied-physics-24"
  | "applied-electron-22"
  | "applied-electron-23"
  | "applied-electron-24"
  | "applied-materials-22"
  | "applied-materials-23"
  | "applied-materials-24"
  | "applied-molecule-22"
  | "applied-molecule-23"
  | "applied-molecule-24"
  | "biology-22"
  | "biology-24"
  | "bioresources-22"
  | "bioresources-24"
  | "bioresources-25"
  | "bioresources-26"
  | "bioresources-interdisciplinary-22"
  | "bioresources-interdisciplinary-24"
  | "bioresources-interdisciplinary-25"
  | "earth-environment-22"
  | "earth-environment-23"
  | "earth-environment-24"
  | "earth-environment-25"
  | "earth-environment-26"
  | "earth-evolution-22"
  | "earth-evolution-23"
  | "earth-evolution-24"
  | "earth-evolution-26"
  | "earth-interdisciplinary-22"
  | "earth-interdisciplinary-23"
  | "earth-interdisciplinary-24"
  | "earth-interdisciplinary-26"
  | "policy-economics-22"
  | "policy-economics-23"
  | "policy-engineering-22"
  | "policy-engineering-23"
  | "policy-engineering-26"
  | "policy-urban-22"
  | "policy-urban-23"
  | "policy-urban-26"
  | "humanities-philosophy-22"
  | "humanities-philosophy-23"
  | "humanities-philosophy-24"
  | "humanities-philosophy-25"
  | "humanities-history-22"
  | "humanities-history-24"
  | "humanities-history-25"
  | "humanities-archaeology-22"
  | "humanities-archaeology-24"
  | "humanities-archaeology-25"
  | "humanities-linguistics-22"
  | "humanities-linguistics-24"
  | "humanities-linguistics-25"
  | "comparative-culture-23"
  | "comparative-culture-26"
  | "japanese-culture-22"
  | "japanese-culture-23"
  | "japanese-culture-26"
  | "social-sociology-22"
  | "social-sociology-23"
  | "social-law-22"
  | "social-law-23"
  | "social-politics-22"
  | "social-politics-23"
  | "social-economics-22"
  | "social-economics-23"
  | "international-relations-22"
  | "international-relations-23"
  | "international-development-22"
  | "international-development-23"
  | "education-22"
  | "education-23"
  | "psychology-22"
  | "psychology-23"
  | "disability-22"
  | "disability-23"
  | "medicine-22"
  | "medicine-26"
  | "new-medicine-22"
  | "new-medicine-26"
  | "nursing-22"
  | "nursing-25"
  | "nursing-26"
  | "public-health-nursing-22"
  | "public-health-nursing-25"
  | "public-health-nursing-26"
  | "medical-science-22"
  | "medical-science-24"
  | "medical-science-25"
  | "medical-science-26"
  | "international-medical-science-22"
  | "international-medical-science-24"
  | "international-medical-science-25"
  | "international-medical-science-26"
  | "physical-education-22"
  | "physical-education-26"
  | "art-studies-22"
  | "japanese-art-22"
  | "klis-ksc-21"
  | "klis-ksc-23"
  | "klis-ksc-26"
  | "klis-ksc-22"
  | "klis-kis-21"
  | "klis-kis-23"
  | "klis-kis-26"
  | "klis-kis-22"
  | "klis-irm-21"
  | "klis-irm-23"
  | "klis-irm-26"
  | "klis-irm-22";

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
  /** 利用者が未分類科目をこの区分へ手動分類した結果か */
  isManualClassification?: boolean;
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
  /** 親要件の単位を二重計上せずに判定する内数条件 */
  minimumIncludedResults?: {
    codes?: string[];
    courseIdSuffixes?: string[];
    courseNames?: string[];
    minimum: number;
    label: string;
    courses: Course[];
    unknownCourses?: Course[];
  }[];
  /** 利用者が未分類科目をこの区分へ手動分類した結果か */
  isManualClassification?: boolean;
};

/** 1科目がどの規則に該当し、最終的にどこへ割り当てられたかの監査情報。 */
export type SelectAllocationCandidate = {
  /** select 配列内の定義順（0始まり）。競合時は小さい規則が優先される */
  ruleIndex: number;
  label: string;
  group: number;
  category: Exclude<CategoryKey, "compulsory"> | null;
};

export type AllocationTrace = {
  course: Course;
  assigned:
    | { kind: "compulsory"; label: string }
    | ({ kind: "select" } & SelectAllocationCandidate)
    | { kind: "uncounted" };
  /** 必修でなければ、消し込み前に該当した選択要件を定義順ですべて保持する */
  selectCandidates: SelectAllocationCandidate[];
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

/**
 * 区分合計とは別に判定する、必修1件または選択小区分1件の進捗。
 * 必修科目名だけでは必要単位数を特定できないため、その場合の minimumUnits は null とする。
 */
export type RequirementItemProgress = {
  /** 同一レポート内で安定した識別子 */
  id: string;
  kind: "compulsory" | "select";
  label: string;
  category: CategoryKey | null;
  minimumUnits: number | null;
  maximumUnits: number | null;
  earnedUnits: number;
  prospectiveUnits: number;
  isSatisfied: boolean;
  isProspectivelySatisfied: boolean;
  courses: Course[];
  /** 利用者が未分類科目をこの区分へ手動分類した進捗か */
  isManualClassification: boolean;
  attributeEvaluation?: {
    status: "satisfied" | "unsatisfied" | "unknown";
    prospectiveStatus: "satisfied" | "unsatisfied" | "unknown";
    unknownUnits: number;
    prospectiveUnknownUnits: number;
  };
  /** 科目数条件の場合のみ設定。単位数へ換算しない。 */
  courseCount?: {
    minimum: number;
    earned: number;
    prospective: number;
    unknown: number;
    prospectiveUnknown: number;
    status: "satisfied" | "unsatisfied" | "unknown";
    prospectiveStatus: "satisfied" | "unsatisfied" | "unknown";
  };
};

export type CategoryResult = UnitProgress & {
  category: CategoryKey;
  /** 表示名（例: 必修科目 / 選択科目（専門）） */
  label: string;
  /** 選択区分の上限単位数（必修は undefined） */
  maxUnits?: number;
  /** 区分合計と、その区分内の全個別要件を確定単位で満たしたか */
  isSatisfied: boolean;
  /** 区分合計と、その区分内の全個別要件を見込み単位で満たしたか */
  isProspectivelySatisfied: boolean;
  /** 未充足の個別要件数（区分合計の不足は含めない） */
  unsatisfiedRequirementCount: number;
  /** 見込みでも未充足の個別要件数（区分合計の不足は含めない） */
  prospectivelyUnsatisfiedRequirementCount: number;
};

// ── 最終的な判定結果オブジェクト ──

export type GraduationCheckReport = {
  /** 省略時は従来の詳細判定。画面では five-category を使用する。 */
  evaluationMode?: "five-category" | "detailed";
  studentContext?: GraduationStudentContext;
  /** 使用した要件データの情報 */
  requirement: {
    id: RequirementId;
    department: string;
    major: string;
    /** 対象の入学年度。単年は数値、範囲は "2022~2024" のような文字列 */
    enrollYear: number | string;
  };
  /** 成績CSVの開講年度を使った年度別静的カタログの検証状況 */
  catalogVerification: {
    source: "transcript_academic_year";
    verifiedAcademicYears: number[];
    unsupportedAcademicYears: number[];
  };
  /** 全体サマリー */
  summary: UnitProgress & {
    /** 不足単位数（確定ベース。0で下限） */
    shortageUnits: number;
    /** 見込みベースの不足単位数（0で下限） */
    prospectiveShortageUnits: number;
    /** evaluationModeの条件を満たしたか。five-categoryでは総単位と区分下限のみ。 */
    isSatisfied: boolean;
    /** 履修中を含めてevaluationModeの条件を満たすか。卒業可否の確定ではない。 */
    isProspectivelySatisfied: boolean;
    /** 確定単位で未充足の個別要件数 */
    unsatisfiedRequirementCount: number;
    /** 見込み単位でも未充足の個別要件数 */
    prospectivelyUnsatisfiedRequirementCount: number;
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
    /** 5区分の合算とは独立して判定した、必修・選択の個別要件 */
    requirementItems: RequirementItemProgress[];
    /** どの要件にもマッチしなかった科目（卒業要件に含まれない単位） */
    uncountedCourses: Course[];
    /** 5区分に対応しないグループの単位数（集計対象外。グループ表示名→単位数） */
    unmappedGroupUnits: Record<string, number>;
    /** 誤分類・要件重複を追跡するための、科目ごとの割り当て経路 */
    allocationTraces: AllocationTrace[];
  };
};
