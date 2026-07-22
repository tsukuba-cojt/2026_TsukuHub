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
          { admissionYears: [2021], requirementId: "mast-21" },
          { admissionYears: [2022, 2023, 2024], requirementId: "mast-22" },
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
          { admissionYears: [2021], requirementId: "klis-ksc-21" },
          { admissionYears: [2022, 2023, 2024], requirementId: "klis-ksc-22" },
        ],
      },
      {
        key: "klis-kis",
        label: "知識情報システム主専攻",
        requirements: [
          { admissionYears: [2021], requirementId: "klis-kis-21" },
          { admissionYears: [2022, 2023, 2024], requirementId: "klis-kis-22" },
        ],
      },
      {
        key: "klis-irm",
        label: "情報資源経営主専攻",
        requirements: [
          { admissionYears: [2021], requirementId: "klis-irm-21" },
          { admissionYears: [2022, 2023, 2024], requirementId: "klis-irm-22" },
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
 * 入学年度セレクトの選択肢。要件データ1件（RequirementEntry）＝選択肢1件。
 * 要件データが複数年をまとめている場合（例: 2022〜2024）は年度を分割せず
 * まとめた表記のまま1件として出す。
 */
export type AdmissionYearOption = {
  /** セレクトの value（この要件データが対象とする最初の入学年度） */
  value: number;
  /** 表示名（単年なら「2021年度」、複数年なら「2022〜2024年度」） */
  label: string;
  /** この選択肢が対象とする入学年度 */
  years: number[];
};

const toAdmissionYearOption = (entry: RequirementEntry): AdmissionYearOption => {
  const years = [...entry.admissionYears].sort((a, b) => a - b);
  const label =
    years.length === 1
      ? `${years[0]}年度`
      : `${years[0]}〜${years[years.length - 1]}年度`;
  return { value: years[0], label, years };
};

/**
 * 入学年度セレクトの選択肢を作る。
 * 専攻まで選ばれていればその専攻の対応年度、学類のみなら学類内の全専攻を
 * まとめた対応年度に絞る（どちらも要件データが存在する年度のみ）。
 */
export const listAdmissionYearOptions = (
  department: SupportedDepartment | undefined,
  major: SupportedMajor | undefined
): AdmissionYearOption[] => {
  const requirements = major
    ? major.requirements
    : (department?.majors ?? []).flatMap((m) => m.requirements);
  // 専攻をまたいで同じ年度区切りが重なる場合は1件にまとめる
  const options = new Map<string, AdmissionYearOption>();
  for (const requirement of requirements) {
    const option = toAdmissionYearOption(requirement);
    options.set(option.years.join(","), option);
  }
  return [...options.values()].sort((a, b) => a.value - b.value);
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
