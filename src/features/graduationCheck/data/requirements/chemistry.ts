import type { GradRequirement, GradRequirementTable } from "../../types";

type ChemistryRequirementId = "chem-22" | "chem-23" | "chem-25";

const namedRule = (
  courseNames: string[],
  minimum: number,
  maximum: number,
  message: string,
  group: number
): GradRequirement["courses"]["select"][number] => [
  [],
  minimum,
  maximum,
  false,
  message,
  group,
  { includeCourseNames: courseNames },
];

const analysisAndInorganic = [
  "分析化学",
  "無機化学I",
  "無機化学Ⅰ",
  "無機化学II",
  "無機化学Ⅱ",
  "無機元素化学",
  "放射化学",
];

const physicalChemistry = [
  "物理化学I",
  "物理化学Ⅰ",
  "物理化学II",
  "物理化学Ⅱ",
  "物理化学III",
  "物理化学Ⅲ",
  "物理化学IV",
  "物理化学Ⅳ",
];

const organicChemistry = [
  "有機化学I",
  "有機化学Ⅰ",
  "有機化学II",
  "有機化学Ⅱ",
  "有機化学III",
  "有機化学Ⅲ",
  "有機化学IV",
  "有機化学Ⅳ",
];

const mathAndPhysics = [
  "微積分1",
  "微積分2",
  "微積分3",
  "微分積分A",
  "線形代数1",
  "線形代数2",
  "線形代数3",
  "線形代数A",
  "力学1",
  "力学2",
  "力学3",
  "電磁気学1",
  "電磁気学2",
  "電磁気学3",
];

const scienceFoundationNames = [
  "化学基礎セミナー",
  "化学序説",
  "生物学序説",
  "遺伝学概論",
  "分子細胞生物学概論",
  "系統分類・進化学概論",
  "生態学概論",
  "動物生理学概論",
  "植物生理学概論",
  "地球環境学1",
  "地球環境学2",
  "地球進化学1",
  "地球進化学2",
];

const commonCompulsory = [
  "ファーストイヤーセミナー//['フレッシュマンセミナー']",
  "学問への誘い",
  "体育::2",
  "必修英語::4",
  "情報::4",
];

type ChemistryVariant = {
  enrollYear: "2022" | "2023~2024" | "2025~2026";
  compulsory: string[];
  compulsorySumUnit: number;
  specializedFlexibleMinimum: number;
  specializedFlexibleMaximum: number;
  foundationMathMinimum: number;
  foundationOtherMinimum: number;
  foundationOtherMaximum: number;
  commonMaximum: number;
  includeSafetyCourse: boolean;
};

const buildChemistryRequirement = ({
  enrollYear,
  compulsory,
  compulsorySumUnit,
  specializedFlexibleMinimum,
  specializedFlexibleMaximum,
  foundationMathMinimum,
  foundationOtherMinimum,
  foundationOtherMaximum,
  commonMaximum,
  includeSafetyCourse,
}: ChemistryVariant): GradRequirement => ({
  header: {
    department: "化学類",
    major: "化学",
    enrollYear,
  },
  courses: {
    compulsory: [
      ...compulsory,
      "化学1",
      "化学2",
      "化学3",
      ...commonCompulsory,
      ...(includeSafetyCourse
        ? ["事例に学ぶ環境安全衛生と化学物質"]
        : []),
    ],
    compulsorySumUnit,
    select: [
      namedRule(analysisAndInorganic, 6, 6, "分析化学・無機化学", 0),
      namedRule(physicalChemistry, 6, 6, "物理化学", 0),
      namedRule(organicChemistry, 6, 6, "有機化学", 0),
      [
        ["FE12", "FE13", "FE14"],
        specializedFlexibleMinimum,
        specializedFlexibleMaximum,
        false,
        "その他の化学専門科目",
        0,
        { excludeCourseNames: ["化学基礎セミナー"] },
      ],
      namedRule(
        mathAndPhysics,
        foundationMathMinimum,
        foundationMathMinimum,
        "数学・物理学の基礎科目",
        1
      ),
      [
        ["FA", "FB", "FC", "FE11", "EB", "EC", "EE"],
        foundationOtherMinimum,
        foundationOtherMaximum,
        false,
        "その他の専門基礎科目",
        1,
        { includeCourseNames: scienceFoundationNames },
      ],
      [["*学士基盤科目"], 1, commonMaximum, false, "学士基盤科目", 2],
      [["A", "B"], 2, 2, false, "A・Bで始まる科目", 3],
      [
        [
          "A",
          "B",
          "FA",
          "FB",
          "FC",
          "FE",
          "EB",
          "EC",
          "EE",
          "*総合科目",
          "*教職に関する科目",
          "*博物館に関する科目",
          "*自由科目特設",
        ],
        7,
        9,
        true,
        "その他の関連科目",
        3,
      ],
    ],
    selectMinimumUnit: 124 - compulsorySumUnit,
    enforceSelectMinimums: true,
    groups: [
      [
        0,
        specializedFlexibleMinimum + 18,
        specializedFlexibleMaximum + 18,
        "専門科目選択",
      ],
      [1, 17, 30, "専門基礎科目選択"],
      [2, 1, commonMaximum, "共通科目選択"],
      [3, 9, 11, "関連科目選択"],
    ],
  },
});

/**
 * 根拠: 筑波大学「学群等履修細則」理工学群別表第1（2022〜2026年度）。
 * 2023年度に専門実験、2025年度に単位数と専門基礎科目の区分が変更されている。
 * https://www.tsukuba.ac.jp/education/ug-courses-directory/
 */
export const chemistryRequirements = {
  "chem-22": buildChemistryRequirement({
    enrollYear: "2022",
    compulsory: [
      "専門化学実験Ⅰ//['専門化学実験I']",
      "専門化学実験Ⅱ//['専門化学実験II']",
      "卒業研究",
    ],
    compulsorySumUnit: 43,
    specializedFlexibleMinimum: 23,
    specializedFlexibleMaximum: 33,
    foundationMathMinimum: 12,
    foundationOtherMinimum: 5,
    foundationOtherMaximum: 18,
    commonMaximum: 2,
    includeSafetyCourse: false,
  }),
  "chem-23": buildChemistryRequirement({
    enrollYear: "2023~2024",
    compulsory: [
      "物理化学専門実験",
      "無機・分析化学専門実験",
      "有機化学専門実験",
      "卒業研究",
    ],
    compulsorySumUnit: 42.5,
    specializedFlexibleMinimum: 24,
    specializedFlexibleMaximum: 34,
    foundationMathMinimum: 12,
    foundationOtherMinimum: 5,
    foundationOtherMaximum: 18,
    commonMaximum: 2,
    includeSafetyCourse: false,
  }),
  "chem-25": buildChemistryRequirement({
    enrollYear: "2025~2026",
    compulsory: [
      "物理化学専門実験",
      "無機・分析化学専門実験",
      "有機化学専門実験",
      "卒業研究",
    ],
    compulsorySumUnit: 42,
    specializedFlexibleMinimum: 24,
    specializedFlexibleMaximum: 34,
    foundationMathMinimum: 8,
    foundationOtherMinimum: 9,
    foundationOtherMaximum: 22,
    commonMaximum: 1,
    includeSafetyCourse: true,
  }),
} satisfies Pick<GradRequirementTable, ChemistryRequirementId>;
