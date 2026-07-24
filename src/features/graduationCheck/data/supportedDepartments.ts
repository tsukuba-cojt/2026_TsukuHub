/**
 * 卒業要件チェックが対応している「学類 → 専攻 → 入学年度 → 要件データキー」の一覧
 *
 * ステップ1のプルダウン（学類・専攻・入学年度）はこの1ファイルだけを参照する。
 * UI側は学類名・専攻名をハードコードしないため、対応学類・専攻が増えたときは
 * このファイルに1件追加するだけでプルダウンに反映される。
 *
 * 追加手順:
 * 1. data/gradRequirementData.ts に要件データを追加し、types.ts の RequirementId
 *    にそのキーを足す
 * 2. 下の supportedDepartments に
 *    - 既存の学類なら majors に専攻を1件追加
 *    - 新しい学類なら { key, label, majors: [...] } を1件追加
 * 3. 各専攻の requirements に { admissionYears, requirementId } を年度分だけ並べる
 *    （対応年度は専攻ごとに異なってよい。例: 知識情報・図書館学類は2024年度入学まで）
 */

import type { RequirementId } from "../types";

/** 対応入学年度と、それに対応する要件データキーの組 */
export type RequirementEntry = {
  /** この要件データが対象とする入学年度（年度単位で列挙する） */
  admissionYears: number[];
  requirementId: RequirementId;
};

/** 専攻（主専攻）1件 */
export type SupportedMajor = {
  /** 専攻セレクトの value。要件データキーの接頭辞に合わせる */
  key: string;
  /** 専攻セレクトの表示名 */
  label: string;
  requirements: RequirementEntry[];
};

/** 学類1件 */
export type SupportedDepartment = {
  /** 学類セレクトの value */
  key: string;
  /** 学類セレクトの表示名 */
  label: string;
  majors: SupportedMajor[];
};

/** 対応している学類・専攻（未対応の学類・専攻はまだ載せない） */
export const supportedDepartments: SupportedDepartment[] = [
  {
    key: "mast",
    label: "情報メディア創成学類",
    majors: [
      {
        key: "mast",
        label: "情報メディア創成主専攻",
        requirements: [
          { admissionYears: [2023, 2024], requirementId: "mast-22" },
          { admissionYears: [2025], requirementId: "mast-25" },
        ],
      },
    ],
  },
  {
    key: "klis",
    label: "知識情報・図書館学類",
    majors: [
      {
        key: "klis-ksc",
        label: "知識科学主専攻",
        requirements: [
          { admissionYears: [2023, 2024], requirementId: "klis-ksc-22" },
        ],
      },
      {
        key: "klis-kis",
        label: "知識情報システム主専攻",
        requirements: [
          { admissionYears: [2023, 2024], requirementId: "klis-kis-22" },
        ],
      },
      {
        key: "klis-irm",
        label: "情報資源経営主専攻",
        requirements: [
          { admissionYears: [2023, 2024], requirementId: "klis-irm-22" },
        ],
      },
    ],
  },
  {
    key: "coins",
    label: "情報科学類",
    majors: [
      {
        key: "coins-ss",
        label: "ソフトウェアサイエンス主専攻",
        requirements: [
          { admissionYears: [2023, 2024, 2025], requirementId: "coins-ss-23" },
          { admissionYears: [2026], requirementId: "coins-ss-26" },
        ],
      },
      {
        key: "coins-is",
        label: "情報システム主専攻",
        requirements: [
          { admissionYears: [2023, 2024, 2025], requirementId: "coins-is-23" },
          { admissionYears: [2026], requirementId: "coins-is-26" },
        ],
      },
      {
        key: "coins-im",
        label: "知能情報メディア主専攻",
        requirements: [
          { admissionYears: [2023, 2024, 2025], requirementId: "coins-im-23" },
          { admissionYears: [2026], requirementId: "coins-im-26" },
        ],
      },
    ],
  },
];

/** 学類キーから学類を引く（未対応・未選択なら undefined） */
export const findDepartment = (
  departmentKey: string
): SupportedDepartment | undefined =>
  supportedDepartments.find((department) => department.key === departmentKey);

/** 学類キー・専攻キーから専攻を引く（未対応・未選択なら undefined） */
export const findMajor = (
  departmentKey: string,
  majorKey: string
): SupportedMajor | undefined =>
  findDepartment(departmentKey)?.majors.find((major) => major.key === majorKey);

/**
 * 学類・専攻・入学年度から要件データキーを一意に引く。
 * 対応する要件データがなければ null（＝ステップ1の選択が未完了 or 対応外）。
 */
export const resolveRequirementId = (
  departmentKey: string,
  majorKey: string,
  admissionYear: number | string
): RequirementId | null => {
  const year = Number(admissionYear);
  const requirements = findMajor(departmentKey, majorKey)?.requirements ?? [];
  return (
    requirements.find((requirement) =>
      requirement.admissionYears.includes(year)
    )?.requirementId ?? null
  );
};

/**
 * 入学年度セレクトの選択肢。1年ごとに1件（単年表示）。
 * 複数の入学年度が同じ requirementId を指してよく、表示は年度単位・要件データは
 * エントリ単位で分離する。要件データが存在する年度だけを選択肢に出す。
 */
export type AdmissionYearOption = {
  /** セレクトの value（入学年度そのもの） */
  value: number;
  /** 表示名（例: 「2024年度」） */
  label: string;
};

/**
 * 入学年度セレクトの選択肢を作る。
 * 専攻まで選ばれていればその専攻の対応年度、学類のみなら学類内の全専攻を
 * まとめた対応年度から、要件データが存在する年度だけを新しい順に並べる。
 */
export const listAdmissionYearOptions = (
  department: SupportedDepartment | undefined,
  major: SupportedMajor | undefined
): AdmissionYearOption[] => {
  const years = major
    ? listMajorAdmissionYears(major)
    : department
      ? listDepartmentAdmissionYears(department)
      : [];
  // 新しい順（2026 → 2023）
  return [...years]
    .sort((a, b) => b - a)
    .map((year) => ({ value: year, label: `${year}年度` }));
};

/** 専攻が対応している入学年度（昇順・重複なし） */
export const listMajorAdmissionYears = (major: SupportedMajor): number[] =>
  [
    ...new Set(
      major.requirements.flatMap((requirement) => requirement.admissionYears)
    ),
  ].sort((a, b) => a - b);

/** 学類のいずれかの専攻が対応している入学年度（昇順・重複なし） */
export const listDepartmentAdmissionYears = (
  department: SupportedDepartment
): number[] =>
  [
    ...new Set(
      department.majors.flatMap((major) => listMajorAdmissionYears(major))
    ),
  ].sort((a, b) => a - b);
