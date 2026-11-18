import type { GradRequirement, GradRequirementTable } from "../../types";
import { bioresourcesRequirements } from "./bioresources";
import { earthRequirements } from "./earth";

type LifeEnvironmentalRequirementId =
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
  | "earth-interdisciplinary-26";

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

const biologyRequirement = (revised: boolean): GradRequirement => ({
  header: {
    department: "生物学類",
    major: "生物学",
    enrollYear: revised ? "2024~2026" : "2022~2023",
  },
  courses: {
    compulsory: [
      "専門語学(英語)BI",
      "専門語学(英語)BII",
      "専門語学(英語)BIII",
      "科学コミュニケーション",
      "専門語学(英語)DI",
      "専門語学(英語)DII",
      "専門語学(英語)DIII",
      "生物学演習",
      "生物学研究法",
      "卒業研究",
      "論文作成・プレゼンテーション",
      "系統分類・進化学概論",
      "分子細胞生物学概論",
      "遺伝学概論",
      "生態学概論",
      "動物生理学概論",
      "植物生理学概論",
      "基礎生物学実験::3//['基礎生物学実験I', '基礎生物学実験II', '基礎生物学実験III']",
      "専門語学(英語)AI",
      "専門語学(英語)AII",
      "クラスセミナー",
      ...commonIntro,
      "情報::4",
      ...(!revised ? ["英語::4"] : []),
    ],
    compulsorySumUnit: revised ? 40 : 44,
    select: [
      [biologySpecializedCodes, 40, 62, false, "生物学専門科目", 0,
        { maximumIncludedCourses: [{ codes: ["EB169"], maximum: 1 }] }],
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
        revised ? 21 : 17,
        43,
        true,
        "関連科目",
        3,
      ],
    ],
    selectMinimumUnit: revised ? 84 : 80,
    enforceSelectMinimums: true,
    courseCountRequirements: [
      { label: "実験・実習4科目以上", group: 0, codes: biologySpecializedCodes,
        instructionMethods: ["experiment", "practicum"], minimum: 4 },
      { label: "実習1科目以上", group: 0, codes: biologySpecializedCodes,
        instructionMethods: ["practicum"], minimum: 1 },
    ],
    groups: [
      [0, 40, 62, "専門科目選択"],
      [1, 0, 0, "専門基礎科目選択"],
      [2, 1, 29, "共通科目選択"],
      [3, revised ? 21 : 17, 43, "関連科目選択"],
    ],
  },
});

type EarthVariant = {
  major: "地球環境学" | "地球進化学" | "生命環境学際";
  enrollYear: "2022~2023" | "2024~2025" | "2024~2026" | "2026";
  ruleVersion: "legacy" | "2024" | "2026";
  compulsorySumUnit: number;
  selectMinimumUnit: number;
  categoryMinimums: [number, number, number, number];
};

const earthSpecializedNamedCourses = [
  "地球基礎数学・物理学",
  "地球基礎化学",
  "地球統計学",
  "地球情報学",
  "地球学野外調査法",
];

const earthFoundationCodes = [
  "FB",
  "FC",
  "FE",
  "EB",
  "EC",
  "EE1",
  "EG0",
  "EG1",
  "EG2",
  "EG3",
  "EG4",
  "EG5",
  "EG6",
  "EG70",
];

const earthCommonRules: GradRequirement["courses"]["select"] = [
  [["*学士基盤科目"], 1, 5, false, "学士基盤科目", 2],
  [
    ["*体育", "*外国語", "*情報", "*国語", "*芸術"],
    0,
    24,
    false,
    "その他の共通科目",
    2,
  ],
];

const buildEarthRequirement = ({
  major,
  enrollYear,
  ruleVersion,
  compulsorySumUnit,
  selectMinimumUnit,
  categoryMinimums,
}: EarthVariant): GradRequirement => {
  const interdisciplinary = major === "生命環境学際";
  const evolution = major === "地球進化学";
  const [specialized, foundation, common, related] = categoryMinimums;
  const modern = ruleVersion !== "legacy" && !interdisciplinary;
  const specializedMaximum =
    ruleVersion === "2024" ? 68 : ruleVersion === "2026" ? (evolution ? 68 : 69) : 69;
  const foundationMaximum = ruleVersion === "2024" ? 46 : 44;
  const relatedMaximum = ruleVersion === "2024" ? 32 : 34;

  const specializedRules: GradRequirement["courses"]["select"] = modern
    ? evolution
      ? [
          [["EE3"], 18, 44.5, false, "地球進化学分野", 0],
          [
            ["EE2", "EG9"],
            9,
            50,
            false,
            "地球環境学分野等",
            0,
            { includeCourseNames: earthSpecializedNamedCourses },
          ],
        ]
      : ruleVersion === "2026"
        ? [
            [["EE2"], 10, 64, false, "地球環境学分野", 0],
            [["EG9"], 1, 25, false, "生物圏環境学分野", 0],
            [
              ["EE3"],
              0,
              40,
              false,
              "地球進化学分野等",
              0,
              { includeCourseNames: earthSpecializedNamedCourses },
            ],
          ]
        : [
            [["EE2"], 10, 64, false, "地球環境学分野", 0],
            [
              ["EE3", "EG9"],
              0,
              58,
              false,
              "地球進化学・生物圏環境学分野等",
              0,
              { includeCourseNames: earthSpecializedNamedCourses },
            ],
          ]
    : [
        [
          interdisciplinary
            ? ["EG9", "EC2", "EC3", "EC4", "EB", "EE"]
            : ["EE2", "EE3", "EG9"],
          specialized,
          69,
          false,
          "地球学専門科目",
          0,
        ],
      ];

  const foundationRules: GradRequirement["courses"]["select"] = modern
    ? [
        [
          earthFoundationCodes,
          foundation,
          foundationMaximum,
          false,
          "地球学専門基礎科目",
          1,
        ],
      ]
    : [
        [
          ["EE1", "EB11", "EG02", "EG5"],
          foundation,
          44,
          false,
          "地球学専門基礎科目",
          1,
        ],
      ];

  const relatedRules: GradRequirement["courses"]["select"] = modern
    ? ruleVersion === "2024"
      ? [
          [
            [
              "AB",
              "AC",
              "FF",
              "FG",
              "FH",
              "*教職に関する科目",
              "*博物館に関する科目",
            ],
            4,
            32,
            false,
            "指定関連科目",
            3,
          ],
          [
            [
              "AB",
              "AC",
              "EB",
              "EC",
              "EE",
              "EG",
              "FB",
              "FC",
              "FE",
              "FF",
              "FG",
              "FH",
              "*総合科目",
              "*体育",
              "*外国語",
              "*情報",
              "*国語",
              "*芸術",
              "*教職に関する科目",
              "*博物館に関する科目",
            ],
            0,
            28,
            true,
            "その他の関連科目",
            3,
          ],
        ]
      : [
          [
            ["*教職に関する科目", "*博物館に関する科目"],
            0,
            34,
            false,
            "教職・博物館科目",
            3,
          ],
          [
            [
              "E",
              "FB",
              "FC",
              "FE",
              "*総合科目",
              "*体育",
              "*外国語",
              "*情報",
              "*国語",
              "*芸術",
              "*教職に関する科目",
              "*博物館に関する科目",
            ],
            0,
            34,
            true,
            "関連科目",
            3,
          ],
        ]
    : [
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
      ];

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
            "地球学専門英語2A",
            ...(ruleVersion === "2026" && !evolution
              ? []
              : ["地球学専門英語2B"]),
            "地球環境学1",
            "地球環境学2",
            "地球進化学1",
            "地球進化学2",
            "地球学実験",
            "地球学専門英語1A",
            "地球学専門英語1B",
            ...commonIntro,
            "体育::2",
            "外国語::4",
            "情報::4",
          ],
      compulsorySumUnit,
      select: [
        ...specializedRules,
        ...foundationRules,
        ...(modern
          ? earthCommonRules
          : [[
              ["*学士基盤科目"],
              common,
              29,
              false,
              "共通科目",
              2,
            ] as GradRequirement["courses"]["select"][number]]),
        ...relatedRules,
      ],
      selectMinimumUnit,
      enforceSelectMinimums: true,
      groups: [
        [0, specialized, specializedMaximum, "専門科目選択"],
        [1, foundation, foundationMaximum, "専門基礎科目選択"],
        [2, common, 29, "共通科目選択"],
        [3, related, relatedMaximum, "関連科目選択"],
      ],
    },
  };
};

/** 根拠: 筑波大学「学群等履修細則」生命環境学群別表（2022〜2026年度）。 */
export const lifeEnvironmentalRequirements = {
  "biology-22": biologyRequirement(false),
  "biology-24": biologyRequirement(true),
  ...bioresourcesRequirements,
  "earth-environment-22": buildEarthRequirement({
    major: "地球環境学",
    enrollYear: "2022~2023",
    ruleVersion: "legacy",
    compulsorySumUnit: 29,
    selectMinimumUnit: 95,
    categoryMinimums: [45, 14, 1, 13],
  }),
  "earth-evolution-22": buildEarthRequirement({
    major: "地球進化学",
    enrollYear: "2022~2023",
    ruleVersion: "legacy",
    compulsorySumUnit: 30,
    selectMinimumUnit: 94,
    categoryMinimums: [40, 15, 1, 13],
  }),
  "earth-interdisciplinary-22": buildEarthRequirement({
    major: "生命環境学際",
    enrollYear: "2022~2023",
    ruleVersion: "legacy",
    compulsorySumUnit: 43,
    selectMinimumUnit: 81,
    categoryMinimums: [47, 10, 1, 13],
  }),
  ...earthRequirements,
} satisfies Pick<GradRequirementTable, LifeEnvironmentalRequirementId>;
