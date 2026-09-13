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

import type { RequirementId } from "../../core/types";

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
    key: "humanities",
    label: "人文学類",
    majors: [
      { key: "humanities-philosophy", label: "哲学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "humanities-philosophy-22" }] },
      { key: "humanities-history", label: "史学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "humanities-history-22" }] },
      { key: "humanities-archaeology", label: "考古学・民俗学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "humanities-archaeology-22" }] },
      { key: "humanities-linguistics", label: "言語学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "humanities-linguistics-22" }] },
    ],
  },
  {
    key: "comparative-culture",
    label: "比較文化学類",
    majors: [{ key: "comparative-culture", label: "比較文化主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "comparative-culture-22" }] }],
  },
  {
    key: "japanese-culture",
    label: "日本語・日本文化学類",
    majors: [{ key: "japanese-culture", label: "日本語・日本文化主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "japanese-culture-22" }] }],
  },
  {
    key: "social",
    label: "社会学類",
    majors: [
      { key: "social-sociology", label: "社会学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "social-sociology-22" }] },
      { key: "social-law", label: "法学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "social-law-22" }] },
      { key: "social-politics", label: "政治学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "social-politics-22" }] },
      { key: "social-economics", label: "経済学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "social-economics-22" }] },
    ],
  },
  {
    key: "international",
    label: "国際総合学類",
    majors: [
      { key: "international-relations", label: "国際関係学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "international-relations-22" }] },
      { key: "international-development", label: "国際開発学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "international-development-22" }] },
    ],
  },
  {
    key: "education",
    label: "教育学類",
    majors: [{ key: "education", label: "教育学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "education-22" }] }],
  },
  {
    key: "psychology",
    label: "心理学類",
    majors: [{ key: "psychology", label: "心理学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "psychology-22" }] }],
  },
  {
    key: "disability",
    label: "障害科学類",
    majors: [{ key: "disability", label: "障害科学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "disability-22" }] }],
  },
  {
    key: "medicine",
    label: "医学類",
    majors: [
      { key: "medicine", label: "医学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "medicine-22" }] },
      { key: "new-medicine", label: "新医学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "new-medicine-22" }] },
    ],
  },
  {
    key: "nursing",
    label: "看護学類",
    majors: [
      { key: "nursing", label: "看護師課程", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "nursing-22" }] },
      { key: "public-health-nursing", label: "保健師課程", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "public-health-nursing-22" }] },
    ],
  },
  {
    key: "medical-science",
    label: "医療科学類",
    majors: [
      { key: "medical-science", label: "医療科学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "medical-science-22" }] },
      { key: "international-medical-science", label: "国際医療科学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "international-medical-science-22" }] },
    ],
  },
  {
    key: "physical-education",
    label: "体育専門学群",
    majors: [{ key: "physical-education", label: "体育学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "physical-education-22" }] }],
  },
  {
    key: "art",
    label: "芸術専門学群",
    majors: [
      { key: "art-studies", label: "芸術学主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "art-studies-22" }] },
      { key: "japanese-art", label: "日本芸術主専攻", requirements: [{ admissionYears: [2022, 2023, 2024, 2025, 2026], requirementId: "japanese-art-22" }] },
    ],
  },
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
    key: "coins",
    label: "情報科学類",
    majors: [
      {
        key: "coins-ss",
        label: "ソフトウェアサイエンス主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025],
            requirementId: "coins-ss-22",
          },
          { admissionYears: [2026], requirementId: "coins-ss-26" },
        ],
      },
      {
        key: "coins-is",
        label: "情報システム主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025],
            requirementId: "coins-is-22",
          },
          { admissionYears: [2026], requirementId: "coins-is-26" },
        ],
      },
      {
        key: "coins-im",
        label: "知能情報メディア主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025],
            requirementId: "coins-im-22",
          },
          { admissionYears: [2026], requirementId: "coins-im-26" },
        ],
      },
    ],
  },
  {
    key: "esys",
    label: "工学システム学類",
    majors: [
      {
        key: "esys-ies",
        label: "知的・機能工学システム主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025, 2026],
            requirementId: "esys-ies-22",
          },
        ],
      },
      {
        key: "esys-eme",
        label: "エネルギー・メカニクス主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025, 2026],
            requirementId: "esys-eme-22",
          },
        ],
      },
    ],
  },
  {
    key: "math",
    label: "数学類",
    majors: [
      {
        key: "math",
        label: "数学",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025, 2026],
            requirementId: "math-22",
          },
        ],
      },
    ],
  },
  {
    key: "biology",
    label: "生物学類",
    majors: [
      {
        key: "biology",
        label: "生物学主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025, 2026],
            requirementId: "biology-22",
          },
        ],
      },
    ],
  },
  {
    key: "bioresources",
    label: "生物資源学類",
    majors: [
      {
        key: "bioresources",
        label: "生物資源科学主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023],
            requirementId: "bioresources-22",
          },
          {
            admissionYears: [2024, 2025, 2026],
            requirementId: "bioresources-24",
          },
        ],
      },
      {
        key: "bioresources-interdisciplinary",
        label: "生命環境学際主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023],
            requirementId: "bioresources-interdisciplinary-22",
          },
          {
            admissionYears: [2024, 2025, 2026],
            requirementId: "bioresources-interdisciplinary-24",
          },
        ],
      },
    ],
  },
  {
    key: "earth",
    label: "地球学類",
    majors: [
      {
        key: "earth-environment",
        label: "地球環境学主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023],
            requirementId: "earth-environment-22",
          },
          {
            admissionYears: [2024, 2025],
            requirementId: "earth-environment-24",
          },
          {
            admissionYears: [2026],
            requirementId: "earth-environment-26",
          },
        ],
      },
      {
        key: "earth-evolution",
        label: "地球進化学主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023],
            requirementId: "earth-evolution-22",
          },
          {
            admissionYears: [2024, 2025, 2026],
            requirementId: "earth-evolution-24",
          },
        ],
      },
      {
        key: "earth-interdisciplinary",
        label: "生命環境学際主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023],
            requirementId: "earth-interdisciplinary-22",
          },
          {
            admissionYears: [2024, 2025, 2026],
            requirementId: "earth-interdisciplinary-24",
          },
        ],
      },
    ],
  },
  {
    key: "physics",
    label: "物理学類",
    majors: [
      {
        key: "physics",
        label: "物理学",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024],
            requirementId: "physics-22",
          },
          {
            admissionYears: [2025, 2026],
            requirementId: "physics-25",
          },
        ],
      },
    ],
  },
  {
    key: "chem",
    label: "化学類",
    majors: [
      {
        key: "chem",
        label: "化学",
        requirements: [
          { admissionYears: [2022], requirementId: "chem-22" },
          { admissionYears: [2023, 2024], requirementId: "chem-23" },
          { admissionYears: [2025, 2026], requirementId: "chem-25" },
        ],
      },
    ],
  },
  {
    key: "applied-science",
    label: "応用理工学類",
    majors: [
      {
        key: "applied-physics",
        label: "応用物理主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023],
            requirementId: "applied-physics-22",
          },
          {
            admissionYears: [2024, 2025, 2026],
            requirementId: "applied-physics-24",
          },
        ],
      },
      {
        key: "applied-electron",
        label: "電子・量子工学主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023],
            requirementId: "applied-electron-22",
          },
          {
            admissionYears: [2024, 2025, 2026],
            requirementId: "applied-electron-24",
          },
        ],
      },
      {
        key: "applied-materials",
        label: "物性工学主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023],
            requirementId: "applied-materials-22",
          },
          {
            admissionYears: [2024, 2025, 2026],
            requirementId: "applied-materials-24",
          },
        ],
      },
      {
        key: "applied-molecule",
        label: "物質・分子工学主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023],
            requirementId: "applied-molecule-22",
          },
          {
            admissionYears: [2024, 2025, 2026],
            requirementId: "applied-molecule-24",
          },
        ],
      },
    ],
  },
  {
    key: "policy",
    label: "社会工学類",
    majors: [
      {
        key: "policy-economics",
        label: "社会経済システム主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025, 2026],
            requirementId: "policy-economics-22",
          },
        ],
      },
      {
        key: "policy-engineering",
        label: "経営工学主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025, 2026],
            requirementId: "policy-engineering-22",
          },
        ],
      },
      {
        key: "policy-urban",
        label: "都市計画主専攻",
        requirements: [
          {
            admissionYears: [2022, 2023, 2024, 2025, 2026],
            requirementId: "policy-urban-22",
          },
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
 * 入学年度セレクトの選択肢。
 * 要件データが複数年をまとめている場合（例: 2022〜2024）でも、
 * 実際にユーザーが入学した年度を時間割履歴へ保存できるよう年度ごとに1件ずつ出す。
 */
export type AdmissionYearOption = {
  /** セレクトの value（ユーザーが実際に入学した年度） */
  value: number;
  /** 表示名（例: 「2022年度」） */
  label: string;
  /** この選択肢が対象とする入学年度（互換用。常に単年） */
  years: number[];
};

const toAdmissionYearOptions = (
  entry: RequirementEntry
): AdmissionYearOption[] =>
  [...entry.admissionYears]
    .sort((a, b) => a - b)
    .map((year) => ({
      value: year,
      label: `${year}年度`,
      years: [year],
    }));

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
  // 専攻をまたいで同じ年度が重なる場合は1件にまとめる
  const options = new Map<number, AdmissionYearOption>();
  for (const requirement of requirements) {
    for (const option of toAdmissionYearOptions(requirement)) {
      options.set(option.value, option);
    }
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
