import type { GradRequirement, GradRequirementTable } from "../../types";

type HumanitiesSocialRequirementId =
  | "humanities-philosophy-22"
  | "humanities-history-22"
  | "humanities-archaeology-22"
  | "humanities-linguistics-22"
  | "comparative-culture-22"
  | "japanese-culture-22"
  | "social-sociology-22"
  | "social-law-22"
  | "social-politics-22"
  | "social-economics-22"
  | "international-relations-22"
  | "international-development-22";

type RequirementSpec = {
  department: string;
  major: string;
  compulsory: string[];
  compulsorySumUnit: number;
  selectMinimumUnit: number;
  minimums: [specialized: number, foundation: number, common: number, related: number];
  maximums: [specialized: number, foundation: number, common: number, related: number];
  specializedCodes: string[];
  foundationCodes: string[];
};

const freshman = ["ファーストイヤーセミナー", "学問への誘い"];
const humanitiesCommon = [
  ...freshman,
  "体育::2",
  "外国語::8",
  "情報::4",
  "国語::2",
];
const socialCommon = [...freshman, "体育::2", "外国語::8", "情報::4"];

const buildRequirement = (spec: RequirementSpec): GradRequirement => {
  const [specialized, foundation, common, related] = spec.minimums;
  const [specializedMax, foundationMax, commonMax, relatedMax] = spec.maximums;
  const ownCodes = [...spec.specializedCodes, ...spec.foundationCodes];

  return {
    header: {
      department: spec.department,
      major: spec.major,
      enrollYear: "2022~2026",
    },
    courses: {
      compulsory: spec.compulsory,
      compulsorySumUnit: spec.compulsorySumUnit,
      select: [
        [
          spec.specializedCodes,
          specialized,
          specializedMax,
          false,
          `${spec.major}の専門科目`,
          0,
        ],
        [
          spec.foundationCodes,
          foundation,
          foundationMax,
          false,
          `${spec.department}の専門基礎科目`,
          1,
        ],
        [["*学士基盤科目", "*体育", "*外国語", "*情報", "*国語", "*芸術"], common, commonMax, false, "共通科目", 2],
        [
          [
            ...ownCodes,
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
          relatedMax,
          true,
          "他学群・他学類等の関連科目",
          3,
        ],
      ],
      selectMinimumUnit: spec.selectMinimumUnit,
      enforceSelectMinimums: true,
      groups: [
        [0, specialized, specializedMax, "専門科目選択"],
        [1, foundation, foundationMax, "専門基礎科目選択"],
        [2, common, commonMax, "共通科目選択"],
        [3, related, relatedMax, "関連科目選択"],
      ],
    },
  };
};

const humanitiesMajor = (
  major: string,
  compulsoryPrefix: string,
  specializedCodes: string[],
  foundationCodes: string[]
): GradRequirement =>
  buildRequirement({
    department: "人文学類",
    major,
    compulsory: [
      `卒業論文（${compulsoryPrefix}）`,
      `${compulsoryPrefix}研究-a`,
      `${compulsoryPrefix}研究-b`,
      ...humanitiesCommon,
    ],
    compulsorySumUnit: 28,
    selectMinimumUnit: 96,
    minimums: [44, 11, 1, 6],
    maximums: [78, 21, 17, 34],
    specializedCodes,
    foundationCodes,
  });

const socialFoundationCompulsory = ["社会学概論", "現代社会論", "法学概論", "民事法概論", "政治学概論", "国際政治史", "経済学基礎論", "現代経済史"];

/** 根拠: 筑波大学「学群等履修細則」別表第1（2022〜2026年度）。 */
export const humanitiesSocialRequirements = {
  "humanities-philosophy-22": humanitiesMajor(
    "哲学主専攻",
    "哲学",
    ["AB61", "AB62", "AB63", "AB64", "AC54", "AC55"],
    ["AB5", "AB60", "AC50", "AC56", "AE56"]
  ),
  "humanities-history-22": humanitiesMajor(
    "史学主専攻",
    "史学",
    ["AB71", "AB72", "AB73", "AB74", "AB75", "AB61", "AB91", "AC60", "AC61", "AC62", "EE21"],
    ["AB5", "AB6", "AB8", "AB9", "AC5", "AC6", "AE"]
  ),
  "humanities-archaeology-22": humanitiesMajor(
    "考古学・民俗学主専攻",
    "考古学・民俗学",
    ["AB81", "AB82", "AB83", "AB84", "AB85", "AB86", "AC60", "AC62"],
    ["AB5", "AB6", "AB7", "AB9", "AC5", "AC6", "AE"]
  ),
  "humanities-linguistics-22": humanitiesMajor(
    "言語学主専攻",
    "言語学",
    ["AE72", "AB91", "AB92", "AB93", "AB94", "AB95", "AB96", "AB97", "AB98", "AB99"],
    ["AB5", "AB6", "AB7", "AB8", "AC5", "AC6", "AE5", "AE6"]
  ),
  "comparative-culture-22": buildRequirement({
    department: "比較文化学類",
    major: "比較文化主専攻",
    compulsory: ["卒業論文", "比較文化演習", ...humanitiesCommon, "比較文化概論"],
    compulsorySumUnit: 29,
    selectMinimumUnit: 95,
    minimums: [44, 11, 1, 6],
    maximums: [76, 43, 19, 38],
    specializedCodes: ["AC7", "AC8", "AC9"],
    foundationCodes: ["AC5", "AC6", "AB", "AE"],
  }),
  "japanese-culture-22": buildRequirement({
    department: "日本語・日本文化学類",
    major: "日本語・日本文化主専攻",
    compulsory: ["卒業論文", "日本語・日本文化研究法", ...humanitiesCommon],
    compulsorySumUnit: 26,
    selectMinimumUnit: 98,
    minimums: [43, 14, 1, 6],
    maximums: [75, 28, 11, 34],
    specializedCodes: ["AE2", "AE3", "AE4", "AE7", "AE8", "AE9"],
    foundationCodes: ["AE1", "AE5", "AE6", "AB", "AC"],
  }),
  "social-sociology-22": buildRequirement({
    department: "社会学類",
    major: "社会学主専攻",
    compulsory: ["卒業論文", "卒業論文演習", "社会学研究法", ...socialFoundationCompulsory.slice(0, 2), ...socialCommon],
    compulsorySumUnit: 32,
    selectMinimumUnit: 94,
    minimums: [49, 8, 1, 12],
    maximums: [74, 20, 15, 36],
    specializedCodes: ["BB1", "BB2", "BB3", "BB4"],
    foundationCodes: ["BA", "BE"],
  }),
  "social-law-22": buildRequirement({
    department: "社会学類",
    major: "法学主専攻",
    compulsory: [...socialFoundationCompulsory.slice(2, 4), ...socialCommon],
    compulsorySumUnit: 20,
    selectMinimumUnit: 106,
    minimums: [61, 8, 1, 12],
    maximums: [84, 20, 15, 36],
    specializedCodes: ["BB1", "BB2", "BB3", "BB4", "AB00", "AB60", "BC11"],
    foundationCodes: ["BA", "BE"],
  }),
  "social-politics-22": buildRequirement({
    department: "社会学類",
    major: "政治学主専攻",
    compulsory: [...socialFoundationCompulsory.slice(4, 6), ...socialCommon],
    compulsorySumUnit: 20,
    selectMinimumUnit: 106,
    minimums: [61, 8, 1, 12],
    maximums: [84, 20, 15, 36],
    specializedCodes: ["BB1", "BB2", "BB3", "BB4"],
    foundationCodes: ["BA", "BE"],
  }),
  "social-economics-22": buildRequirement({
    department: "社会学類",
    major: "経済学主専攻",
    compulsory: [...socialFoundationCompulsory.slice(6, 8), ...socialCommon],
    compulsorySumUnit: 20,
    selectMinimumUnit: 106,
    minimums: [61, 8, 1, 12],
    maximums: [84, 20, 15, 36],
    specializedCodes: ["BB1", "BB2", "BB3", "BB4", "BC", "FH"],
    foundationCodes: ["BA", "BE"],
  }),
  "international-relations-22": buildRequirement({
    department: "国際総合学類",
    major: "国際関係学主専攻",
    compulsory: ["卒業論文", "国際学I", "国際学II", "国際学III", "国際学IV", ...socialCommon],
    compulsorySumUnit: 26,
    selectMinimumUnit: 100,
    minimums: [38, 14, 1, 6],
    maximums: [83, 46, 15, 35],
    specializedCodes: ["BC11", "BC12", "BC13", "BC15", "BC16", "BE22"],
    foundationCodes: ["BC51", "BE21", "BB050", "FH611", "FG16051", "GA12", "BA92"],
  }),
  "international-development-22": buildRequirement({
    department: "国際総合学類",
    major: "国際開発学主専攻",
    compulsory: ["卒業論文", "国際学I", "国際学II", "国際学III", "国際学IV", ...socialCommon],
    compulsorySumUnit: 26,
    selectMinimumUnit: 100,
    minimums: [38, 14, 1, 6],
    maximums: [83, 46, 15, 35],
    specializedCodes: ["BC11", "BC12", "BC13", "BC15", "BC16", "BE22"],
    foundationCodes: ["BC51", "BE21", "BB050", "FH611", "FG16051", "GA12", "BA92"],
  }),
} satisfies Pick<GradRequirementTable, HumanitiesSocialRequirementId>;
