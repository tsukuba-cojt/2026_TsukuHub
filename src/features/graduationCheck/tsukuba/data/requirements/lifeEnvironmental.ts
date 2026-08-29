import type { GradRequirement, GradRequirementTable } from "../../../core/types";

type LifeEnvironmentalRequirementId =
  | "biology-22"
  | "bioresources-22"
  | "bioresources-24"
  | "bioresources-interdisciplinary-22"
  | "bioresources-interdisciplinary-24"
  | "earth-environment-22"
  | "earth-environment-24"
  | "earth-environment-26"
  | "earth-evolution-22"
  | "earth-evolution-24"
  | "earth-interdisciplinary-22"
  | "earth-interdisciplinary-24";

const commonIntro = [
  "ファーストイヤーセミナー//['フレッシュマンセミナー']",
  "学問への誘い",
];

const commonElectives: GradRequirement["courses"]["select"] = [
  [["*学士基盤科目"], 1, 5, false, "学士基盤科目", 2],
  [
    ["*体育", "*外国語", "*情報", "*国語", "*芸術"],
    0,
    28,
    false,
    "その他の共通科目",
    2,
  ],
];

const biologySpecializedCodes = [
  "EB15",
  "EB16",
  "EB17",
  "EB18",
  "EB19",
  "EB2",
  "EB3",
  "EB4",
  "EB5",
  "EB6",
  "EB7",
  "EB8",
  "EB9",
];

const biologyRequirement: GradRequirement = {
  header: {
    department: "生物学類",
    major: "生物学",
    enrollYear: "2022~2026",
  },
  courses: {
    compulsory: [
      "専門語学（英語）BI",
      "専門語学（英語）BII",
      "専門語学（英語）BIII",
      "科学コミュニケーション",
      "専門語学（英語）DI",
      "専門語学（英語）DII",
      "専門語学（英語）DIII",
      "生物学演習",
      "生物学研究法",
      "卒業研究",
      "系統分類・進化学概論",
      "分子細胞生物学概論",
      "遺伝学概論",
      "生態学概論",
      "動物生理学概論",
      "植物生理学概論",
      "基礎生物学実験",
      "専門語学（英語）AI",
      "専門語学（英語）AII",
      "クラスセミナー",
      ...commonIntro,
      "情報::4",
    ],
    compulsorySumUnit: 40,
    select: [
      [biologySpecializedCodes, 40, 62, false, "生物学専門科目", 0],
      ...commonElectives,
      [
        [
          "EB",
          "EC",
          "EE",
          "FA",
          "FB",
          "FC",
          "FE",
          "FF",
          "FG",
          "FJ",
          "G",
          "HB",
          "HE",
          "*総合科目",
          "*体育",
          "*外国語",
          "*情報",
          "*国語",
          "*芸術",
          "*教職に関する科目",
          "*博物館に関する科目",
        ],
        21,
        43,
        true,
        "関連科目",
        3,
      ],
    ],
    selectMinimumUnit: 84,
    enforceSelectMinimums: true,
    groups: [
      [0, 40, 62, "専門科目選択"],
      [1, 0, 0, "専門基礎科目選択"],
      [2, 1, 29, "共通科目選択"],
      [3, 21, 43, "関連科目選択"],
    ],
  },
};

type BioresourcesVariant = {
  enrollYear: "2022~2023" | "2024~2026";
  interdisciplinary: boolean;
  compulsorySumUnit: number;
  selectMinimumUnit: number;
  specializedMinimum: number;
  foundationMinimum: number;
  relatedMinimum: number;
};

const buildBioresourcesRequirement = ({
  enrollYear,
  interdisciplinary,
  compulsorySumUnit,
  selectMinimumUnit,
  specializedMinimum,
  foundationMinimum,
  relatedMinimum,
}: BioresourcesVariant): GradRequirement => ({
  header: {
    department: "生物資源学類",
    major: interdisciplinary ? "生命環境学際" : "生物資源科学",
    enrollYear,
  },
  courses: {
    compulsory: interdisciplinary
      ? [
          "研究演習I",
          "研究演習II",
          "卒業研究I",
          "卒業研究II",
          "生物資源科学演習",
          ...commonIntro,
          "体育::2",
          "外国語::4",
          "情報::4",
          "芸術::1",
        ]
      : [
          "専門語学I",
          "専門語学II",
          "卒業研究I",
          "卒業研究II",
          "生物資源科学演習",
          ...commonIntro,
          "体育::3",
          "外国語::4",
          "情報::4",
          "国語I",
        ],
    compulsorySumUnit,
    select: [
      [
        interdisciplinary
          ? ["EG6", "EG9", "EC2", "EC3", "EC4", "BB", "EB", "EE", "FF", "FH"]
          : ["EC2", "EC3", "EC4", "BB", "EB", "EE", "EG", "FP", "FH"],
        specializedMinimum,
        interdisciplinary ? 59 : 62,
        false,
        "生物資源専門科目",
        0,
      ],
      [
        ["EG02", "EG5", "EG7", "EB11", "EB21"],
        foundationMinimum,
        28,
        false,
        "生物資源専門基礎科目",
        1,
      ],
      ...commonElectives,
      [
        [
          "EC",
          "EB",
          "EE",
          "EG",
          "EZA",
          "BB",
          "FP",
          "FH",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "*教職に関する科目",
          "*博物館に関する科目",
        ],
        relatedMinimum,
        26,
        true,
        "関連科目",
        3,
      ],
    ],
    selectMinimumUnit,
    enforceSelectMinimums: true,
    groups: [
      [0, specializedMinimum, interdisciplinary ? 59 : 62, "専門科目選択"],
      [1, foundationMinimum, 28, "専門基礎科目選択"],
      [2, 1, 29, "共通科目選択"],
      [3, relatedMinimum, 26, "関連科目選択"],
    ],
  },
});

type EarthVariant = {
  major: "地球環境学" | "地球進化学" | "生命環境学際";
  enrollYear: "2022~2023" | "2024~2025" | "2024~2026" | "2026";
  compulsorySumUnit: number;
  selectMinimumUnit: number;
  categoryMinimums: [number, number, number, number];
};

const buildEarthRequirement = ({
  major,
  enrollYear,
  compulsorySumUnit,
  selectMinimumUnit,
  categoryMinimums,
}: EarthVariant): GradRequirement => {
  const interdisciplinary = major === "生命環境学際";
  const evolution = major === "地球進化学";
  const [specialized, foundation, common, related] = categoryMinimums;

  return {
    header: { department: "地球学類", major, enrollYear },
    courses: {
      compulsory: interdisciplinary
        ? [
            "研究演習A",
            "研究演習B",
            "地球科学演習A",
            "地球科学演習B",
            "卒業研究A",
            "卒業研究B",
            "論文作成",
            "地球と生命の進化",
            "地球環境学入門",
            "地球学基礎実験",
            ...commonIntro,
            "体育::2",
            "外国語::4",
            "情報::4",
            "芸術::1",
          ]
        : [
            "卒業研究",
            evolution ? "地球科学専門実習2A" : "地球科学専門実習2A",
            "地球科学専門実習2B",
            "地球環境学1",
            "地球環境学2",
            "地球進化学1",
            "地球進化学2",
            "地球学実験",
            "地球科学専門英語1A",
            "地球科学専門英語1B",
            ...commonIntro,
            "体育::2",
            "外国語::4",
            "情報::4",
          ],
      compulsorySumUnit,
      select: [
        [
          interdisciplinary
            ? ["EG9", "EC2", "EC3", "EC4", "EB", "EE"]
            : evolution
              ? ["EE2", "EE3", "EE9"]
              : ["EE2", "EE3", "EE9"],
          specialized,
          69,
          false,
          "地球学専門科目",
          0,
        ],
        [
          ["EE1", "EB11", "EG02", "EG5"],
          foundation,
          44,
          false,
          "地球学専門基礎科目",
          1,
        ],
        [["*学士基盤科目"], common, 29, false, "共通科目", 2],
        [
          [
            "EA",
            "EB",
            "EC",
            "EE",
            "EG",
            "*総合科目",
            "*体育",
            "*外国語",
            "*情報",
            "*国語",
            "*芸術",
            "*教職に関する科目",
            "*博物館に関する科目",
          ],
          related,
          34,
          true,
          "関連科目",
          3,
        ],
      ],
      selectMinimumUnit,
      enforceSelectMinimums: true,
      groups: [
        [0, specialized, 69, "専門科目選択"],
        [1, foundation, 44, "専門基礎科目選択"],
        [2, common, 29, "共通科目選択"],
        [3, related, 34, "関連科目選択"],
      ],
    },
  };
};

/** 根拠: 筑波大学「学群等履修細則」生命環境学群別表（2022〜2026年度）。 */
export const lifeEnvironmentalRequirements = {
  "biology-22": biologyRequirement,
  "bioresources-22": buildBioresourcesRequirement({
    enrollYear: "2022~2023",
    interdisciplinary: false,
    compulsorySumUnit: 30,
    selectMinimumUnit: 94,
    specializedMinimum: 53,
    foundationMinimum: 17,
    relatedMinimum: 10,
  }),
  "bioresources-24": buildBioresourcesRequirement({
    enrollYear: "2024~2026",
    interdisciplinary: false,
    compulsorySumUnit: 29,
    selectMinimumUnit: 95,
    specializedMinimum: 53,
    foundationMinimum: 18,
    relatedMinimum: 10,
  }),
  "bioresources-interdisciplinary-22": buildBioresourcesRequirement({
    enrollYear: "2022~2023",
    interdisciplinary: true,
    compulsorySumUnit: 43,
    selectMinimumUnit: 81,
    specializedMinimum: 46,
    foundationMinimum: 10,
    relatedMinimum: 13,
  }),
  "bioresources-interdisciplinary-24": buildBioresourcesRequirement({
    enrollYear: "2024~2026",
    interdisciplinary: true,
    compulsorySumUnit: 28,
    selectMinimumUnit: 96,
    specializedMinimum: 45,
    foundationMinimum: 15,
    relatedMinimum: 13,
  }),
  "earth-environment-22": buildEarthRequirement({
    major: "地球環境学",
    enrollYear: "2022~2023",
    compulsorySumUnit: 29,
    selectMinimumUnit: 95,
    categoryMinimums: [45, 14, 1, 13],
  }),
  "earth-environment-24": buildEarthRequirement({
    major: "地球環境学",
    enrollYear: "2024~2025",
    compulsorySumUnit: 28,
    selectMinimumUnit: 96,
    categoryMinimums: [45, 15, 1, 13],
  }),
  "earth-environment-26": buildEarthRequirement({
    major: "地球環境学",
    enrollYear: "2026",
    compulsorySumUnit: 32,
    selectMinimumUnit: 92,
    categoryMinimums: [41, 16, 1, 6],
  }),
  "earth-evolution-22": buildEarthRequirement({
    major: "地球進化学",
    enrollYear: "2022~2023",
    compulsorySumUnit: 30,
    selectMinimumUnit: 94,
    categoryMinimums: [40, 15, 1, 13],
  }),
  "earth-evolution-24": buildEarthRequirement({
    major: "地球進化学",
    enrollYear: "2024~2026",
    compulsorySumUnit: 33,
    selectMinimumUnit: 91,
    categoryMinimums: [40, 16, 1, 6],
  }),
  "earth-interdisciplinary-22": buildEarthRequirement({
    major: "生命環境学際",
    enrollYear: "2022~2023",
    compulsorySumUnit: 43,
    selectMinimumUnit: 81,
    categoryMinimums: [47, 10, 1, 13],
  }),
  "earth-interdisciplinary-24": buildEarthRequirement({
    major: "生命環境学際",
    enrollYear: "2024~2026",
    compulsorySumUnit: 41.5,
    selectMinimumUnit: 82.5,
    categoryMinimums: [47, 11.5, 1, 9],
  }),
} satisfies Pick<GradRequirementTable, LifeEnvironmentalRequirementId>;
