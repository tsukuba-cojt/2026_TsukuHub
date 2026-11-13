import type { GradRequirement, GradRequirementTable } from "../../types";
import { humanitiesRequirements } from "./humanities";

type HumanitiesSocialRequirementId =
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
  | "international-development-23";

type RequirementSpec = {
  department: string;
  major: string;
  enrollYear?: number | string;
  compulsory: string[];
  compulsorySumUnit: number;
  selectMinimumUnit: number;
  minimums: [specialized: number, foundation: number, common: number, related: number];
  maximums: [specialized: number, foundation: number, common: number, related: number];
  specializedCodes: string[];
  foundationCodes: string[];
  specializedRules?: GradRequirement["courses"]["select"];
  foundationRules?: GradRequirement["courses"]["select"];
  relatedRules?: GradRequirement["courses"]["select"];
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

const buildCommonRules = (
  commonMaximum: number,
): GradRequirement["courses"]["select"] => [
  [["*学士基盤科目"], 1, commonMaximum, false, "学士基盤科目", 2],
  [
    ["*体育", "*外国語", "*情報", "*国語", "*芸術"],
    0,
    commonMaximum,
    false,
    "その他の共通科目",
    2,
  ],
];

const buildRequirement = (spec: RequirementSpec): GradRequirement => {
  const [specialized, foundation, common, related] = spec.minimums;
  const [specializedMax, foundationMax, commonMax, relatedMax] = spec.maximums;
  const ownCodes = [...spec.specializedCodes, ...spec.foundationCodes];

  return {
    header: {
      department: spec.department,
      major: spec.major,
      enrollYear: spec.enrollYear ?? "2022~2026",
    },
    courses: {
      compulsory: spec.compulsory,
      compulsorySumUnit: spec.compulsorySumUnit,
      select: [
        ...(spec.specializedRules ?? [
          [
            spec.specializedCodes,
            specialized,
            specializedMax,
            false,
            `${spec.major}の専門科目`,
            0,
          ],
        ]),
        ...(spec.foundationRules ?? [
          [
            spec.foundationCodes,
            foundation,
            foundationMax,
            false,
            `${spec.department}の専門基礎科目`,
            1,
          ],
        ]),
        ...buildCommonRules(commonMax),
        ...(spec.relatedRules ?? [
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
        ]),
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

const socialFoundationCompulsory2022 = ["社会学概論", "現代社会論", "法学概論", "民事法概論", "政治学概論", "国際政治史", "経済学基礎論", "現代経済史"];
const socialFoundationCompulsory = ["社会学基礎論", "現代社会論", "法学概論", "民事法概論", "政治学概論", "国際政治史", "経済学基礎論", "現代経済史"];

const comparativeSpecializedCodes = [
  "AC6",
  "AB98A11",
  "AB98A21",
  "AB98B11",
  "AB98B21",
  "AB98F52",
  "AB98G72",
  "AB98G82",
  "AB85A11",
  "AB85A21",
  "AB84E12",
  "AB84E52",
  "EE21301",
  "EE21321",
  "EE21411",
  "EE21401",
  "AB61",
  "AB62",
  "AB63",
  "AE13G41",
];

const comparativeSpecializedRules: GradRequirement["courses"]["select"] = [
  [["AC67"], 2, 2, false, "卒業論文基礎演習", 0],
  [
    comparativeSpecializedCodes,
    42,
    74,
    false,
    "比較文化学類専門科目",
    0,
    { excludeCodes: ["AC67", "AB62K", "AB63K"] },
  ],
];

const comparativeFoundationRules = (
  include2026Equivalents: boolean,
): GradRequirement["courses"]["select"] => [
  [
    include2026Equivalents ? ["AC56", "AB5", "AE56"] : ["AC56"],
    3,
    6,
    false,
    "比較文化研究",
    1,
  ],
  [["AC50"], 4, 24, false, "概論", 1],
  [["AC51"], 2, 17, false, "専門導入基礎演習", 1],
  [["AC53"], 1, 6, false, "第一専門外国語II", 1],
  [["AC54", "AC55", "AB98F42"], 1, 13, false, "第二専門外国語等", 1],
];

const comparativeRelatedRules: GradRequirement["courses"]["select"] = [
  [["AA2", "AB", "AE", "B", "Y"], 4, 36, false, "指定関連科目（第1群）", 3],
  [["C", "E", "F", "G", "H", "W"], 2, 34, false, "指定関連科目（第2群）", 3],
  [
    [
      "AC",
      "AA2",
      "AB",
      "AE",
      "B",
      "C",
      "E",
      "F",
      "G",
      "H",
      "W",
      "Y",
      "*総合科目",
      "*体育",
      "*外国語",
      "*情報",
      "*国語",
      "*芸術",
    ],
    0,
    32,
    true,
    "その他の関連科目",
    3,
  ],
];

const comparativeCultureRequirement = (
  enrollYear: number | string,
  include2026Equivalents: boolean,
): GradRequirement =>
  buildRequirement({
    department: "比較文化学類",
    major: "比較文化主専攻",
    enrollYear,
    compulsory: [
      "卒業論文",
      "卒業論文演習",
      "比較文化第一専門外国語::2",
      ...humanitiesCommon,
    ],
    compulsorySumUnit: 29,
    selectMinimumUnit: 95,
    minimums: [44, 11, 1, 6],
    maximums: [76, 43, 19, 38],
    specializedCodes: comparativeSpecializedCodes,
    specializedRules: comparativeSpecializedRules,
    foundationCodes: include2026Equivalents
      ? ["AC5", "AB5", "AE56"]
      : ["AC5"],
    foundationRules: comparativeFoundationRules(include2026Equivalents),
    relatedRules: comparativeRelatedRules,
  });

const numberedCodes = (prefix: string, from: number, to: number): string[] =>
  Array.from({ length: to - from + 1 }, (_, index) => `${prefix}${from + index}`);

const japaneseSpecializedRules = (
  ae13Ae14Minimum: number,
): GradRequirement["courses"]["select"] => [
  [
    ["AE13", "AE14"],
    ae13Ae14Minimum,
    55,
    false,
    "日本語・日本文化専門科目（AE13・AE14）",
    0,
    {
      minimumIncludedUnits: [
        {
          codes: ["AE14"],
          minimum: 1,
          label: "AE14で始まる専門科目（内数）",
        },
      ],
    },
  ],
  [["AE10A"], 1, 1, false, "AE10A", 0],
  [["AE10B"], 3, 3, false, "AE10B", 0],
  [["AE10C"], 3, 3, false, "AE10C", 0],
  [["AE10D"], 3, 3, false, "AE10D", 0],
  [["AE10E"], 3, 3, false, "AE10E", 0],
  [
    [
      ...numberedCodes("AB6", 1, 9),
      ...numberedCodes("AB7", 1, 9),
      ...numberedCodes("AB8", 1, 9),
      ...numberedCodes("AB9", 1, 9),
      ...numberedCodes("AC6", 0, 6),
      ...numberedCodes("BB11", 1, 9),
      "BB16",
      "BB19",
    ],
    0,
    20,
    false,
    "他学類開設の指定専門科目",
    0,
  ],
];

const japaneseFoundationRules = (
  ae56Units: number,
): GradRequirement["courses"]["select"] => [
  [["AE56"], ae56Units, ae56Units, false, "AE56", 1],
  [["AE53"], 3, 3, false, "AE53", 1],
  [["AE54"], 3, 3, false, "AE54", 1],
  [
    ["AE5", "AB50", "AB60", "AB70", "AB80", "AB90", "AC50", "AC56", "BB110"],
    6,
    20,
    false,
    "指定専門基礎科目",
    1,
  ],
];

const japaneseRelatedRules: GradRequirement["courses"]["select"] = [
  [["A", "B", "C", "W", "Y"], 4, 32, false, "A・B・C・W・Yで始まる関連科目", 3],
  [["E", "F", "G", "H"], 2, 30, false, "E・F・G・Hで始まる関連科目", 3],
  [
    ["*自由科目特設", "*教職に関する科目", "*博物館に関する科目"],
    0,
    14,
    false,
    "8・9で始まる関連科目",
    3,
  ],
];

const japaneseCultureRequirement = (
  enrollYear: number | string,
  ae13Ae14Minimum: number,
  ae56Units: number,
): GradRequirement =>
  buildRequirement({
    department: "日本語・日本文化学類",
    major: "日本語・日本文化主専攻",
    enrollYear,
    compulsory: ["卒業論文", "日本語・日本文化研究法", ...humanitiesCommon],
    compulsorySumUnit: 26,
    selectMinimumUnit: 98,
    minimums: [ae13Ae14Minimum + 13, ae56Units + 12, 1, 6],
    maximums: [75, ae56Units + 26, 11, 34],
    specializedCodes: ["AE10", "AE13", "AE14", "AB6", "AB7", "AB8", "AB9", "AC6", "BB1"],
    specializedRules: japaneseSpecializedRules(ae13Ae14Minimum),
    foundationCodes: ["AE5", "AB5", "AB6", "AB7", "AB8", "AB9", "AC5", "BB110"],
    foundationRules: japaneseFoundationRules(ae56Units),
    relatedRules: japaneseRelatedRules,
  });

const socialRelatedRules = (): GradRequirement["courses"]["select"] => [
  [
    ["E", "F", "G"],
    2,
    26,
    false,
    "E・F・Gで始まる関連科目",
    3,
  ],
  [
    [
      "A",
      "BC",
      "C",
      "H",
      "W",
      "Y",
      "V",
      "*自由科目特設",
      "*博物館に関する科目",
    ],
    10,
    34,
    false,
    "A・BC・C・H・W・Y・V・8・99で始まる関連科目",
    3,
  ],
  [
    ["*教職に関する科目"],
    0,
    8,
    false,
    "教職に関する科目",
    3,
  ],
  [
    ["BA", "BE"],
    0,
    12,
    false,
    "社会学類の専門基礎指定を除くBA・BE科目",
    3,
  ],
];

const socialFrontlineCourses = [
  "社会学の最前線",
  "法学の最前線",
  "政治学の最前線",
  "経済学の最前線",
];

const socialFrontlineTutorials = socialFrontlineCourses.map(
  (name) => `${name}チュートリアル`,
);

const socialFoundationRules = (
  ownCompulsoryStart: number,
  foundationCompulsory: string[],
): GradRequirement["courses"]["select"] => [
  [
    [],
    6,
    12,
    false,
    "他主専攻の概論・基礎論（6科目）",
    1,
    {
      includeCourseNames: foundationCompulsory.filter(
        (_, index) => index < ownCompulsoryStart || index >= ownCompulsoryStart + 2,
      ),
    },
  ],
  [
    [],
    2,
    4,
    false,
    "社会学類4主専攻の最前線科目",
    1,
    { includeCourseNames: socialFrontlineCourses },
  ],
  [
    [],
    0,
    4,
    false,
    "社会学類4主専攻の最前線チュートリアル",
    1,
    { includeCourseNames: socialFrontlineTutorials },
  ],
];

type SocialMajor = "社会学主専攻" | "法学主専攻" | "政治学主専攻" | "経済学主専攻";

/** 2023〜2026年度KdBでBB4科目との同一科目関係が確認できるBC・FH科目。 */
const economicsDesignatedExternalCodes = [
  "BC11411",
  "BC11451",
  "BC11751",
  "BC11791",
  "BC11861",
  "BC11871",
  "BC11891",
  "BC11971",
  "BC11981",
  "BC12121",
  "BC12701",
  "BC12731",
  "BC12851",
  "BC16011",
  "FH25051",
  "FH25061",
  "FH26021",
  "FH27061",
  "FH48021",
];

const socialRequirement = (
  enrollYear: number | string,
  major: SocialMajor,
): GradRequirement => {
  const majorIndex = ([
    "社会学主専攻",
    "法学主専攻",
    "政治学主専攻",
    "経済学主専攻",
  ] satisfies SocialMajor[]).indexOf(major);
  const ownCompulsoryStart = majorIndex * 2;
  const foundationCompulsory =
    enrollYear === 2022
      ? socialFoundationCompulsory2022
      : socialFoundationCompulsory;
  const otherFoundationNames = {
    excludeCourseNames: foundationCompulsory,
  };

  if (major === "社会学主専攻") {
    return buildRequirement({
      department: "社会学類",
      major,
      enrollYear,
      compulsory: ["卒業論文", "卒業論文演習", "社会学研究法", ...foundationCompulsory.slice(0, 2), ...socialCommon],
      compulsorySumUnit: 32,
      selectMinimumUnit: 94,
      minimums: [49, 8, 1, 12],
      maximums: [74, 20, 15, 36],
      specializedCodes: ["BB1", "BB2", "BB3", "BB4"],
      specializedRules: [
        [
          ["BB1"],
          30,
          56,
          false,
          "社会学主専攻科目",
          0,
          {
            ...otherFoundationNames,
            minimumIncludedUnits: [
              { codes: ["BB16", "BB19"], minimum: 12, label: "社会調査実習・社会学演習（内数）" },
              { codes: ["BB16"], minimum: 6, label: "社会学演習（内数）" },
            ],
          },
        ],
        [["BB2", "BB3", "BB4"], 19, 44, false, "他主専攻科目", 0, otherFoundationNames],
      ],
      foundationCodes: ["BA", "BE"],
      foundationRules: socialFoundationRules(ownCompulsoryStart, foundationCompulsory),
      relatedRules: socialRelatedRules(),
    });
  }

  if (major === "法学主専攻") {
    return buildRequirement({
      department: "社会学類",
      major,
      enrollYear,
      compulsory: [...foundationCompulsory.slice(2, 4), ...socialCommon],
      compulsorySumUnit: 20,
      selectMinimumUnit: 106,
      minimums: [61, 8, 1, 12],
      maximums: [84, 20, 15, 36],
      specializedCodes: ["BB1", "BB2", "BB3", "BB4", "AB00", "AB60", "BC11"],
      specializedRules: [
        [
          ["BB2"],
          40,
          62,
          false,
          "法学主専攻科目",
          0,
          {
            ...otherFoundationNames,
            minimumIncludedUnits: [
              {
                courseNames: ["憲法I", "憲法II", "民法総則", "刑法総論"],
                minimum: 4,
                label: "憲法I・II、民法総則、刑法総論（内数）",
              },
              { courseIdSuffixes: ["2"], minimum: 6, label: "BB2の演習科目（内数）" },
            ],
          },
        ],
        [["BB1", "BB3", "BB4"], 21, 42, false, "他主専攻科目", 0, otherFoundationNames],
        [["AB00", "AB60", "BC11"], 0, 10, false, "指定された他学類科目", 0],
      ],
      foundationCodes: ["BA", "BE"],
      foundationRules: socialFoundationRules(ownCompulsoryStart, foundationCompulsory),
      relatedRules: socialRelatedRules(),
    });
  }

  if (major === "政治学主専攻") {
    return buildRequirement({
      department: "社会学類",
      major,
      enrollYear,
      compulsory: [...foundationCompulsory.slice(4, 6), ...socialCommon],
      compulsorySumUnit: 20,
      selectMinimumUnit: 106,
      minimums: [61, 8, 1, 12],
      maximums: [84, 20, 15, 36],
      specializedCodes: ["BB1", "BB2", "BB3", "BB4"],
      specializedRules: [
        [["BB31"], 24, 42, false, "政治学主専攻科目（政治学）", 0],
        [["BB32"], 6, 12, false, "政治学主専攻科目（国際関係）", 0],
        [["BB1", "BB2", "BB4"], 31, 54, false, "他主専攻科目", 0, otherFoundationNames],
      ],
      foundationCodes: ["BA", "BE"],
      foundationRules: socialFoundationRules(ownCompulsoryStart, foundationCompulsory),
      relatedRules: socialRelatedRules(),
    });
  }

  return buildRequirement({
    department: "社会学類",
    major,
    enrollYear,
    compulsory: [...foundationCompulsory.slice(6, 8), ...socialCommon],
    compulsorySumUnit: 20,
    selectMinimumUnit: 106,
    minimums: [61, 8, 1, 12],
    maximums: [84, 20, 15, 36],
    specializedCodes: ["BB1", "BB2", "BB3", "BB4", ...economicsDesignatedExternalCodes],
    specializedRules: [
      [
        ["BB4", ...economicsDesignatedExternalCodes],
        32,
        62,
        false,
        "経済学主専攻科目等（BC・FHは別途指定科目のみ）",
        0,
        {
          ...otherFoundationNames,
          minimumIncludedUnits: [
            {
              courseNames: ["ミクロ経済学", "マクロ経済学", "経済統計論"],
              minimum: 4,
              label: "ミクロ・マクロ経済学、経済統計論（内数）",
            },
            { courseIdSuffixes: ["2"], minimum: 8, label: "経済学演習（内数）" },
          ],
        },
      ],
      [["BB1", "BB2", "BB3"], 29, 50, false, "他主専攻科目", 0, otherFoundationNames],
    ],
    foundationCodes: ["BA", "BE"],
    foundationRules: socialFoundationRules(ownCompulsoryStart, foundationCompulsory),
    relatedRules: socialRelatedRules(),
  });
};

const internationalRelatedRules: GradRequirement["courses"]["select"] = [
  [
    ["BA", "*自由科目特設", "*博物館に関する科目"],
    0,
    5,
    false,
    "社会・国際学群共通・特設自由・博物館科目",
    3,
  ],
  [["A", "BB", "C"], 3, 20, false, "A・BB・Cで始まる関連科目", 3],
  [["E", "F", "G", "H", "W", "Y"], 3, 20, false, "E・F・G・H・W・Yで始まる関連科目", 3],
  [["*教職に関する科目"], 0, 12, false, "教職に関する科目", 3],
];

const internationalRequirement = (
  enrollYear: number | string,
  major: "国際関係学主専攻" | "国際開発学主専攻",
): GradRequirement => {
  const isRelations = major === "国際関係学主専攻";
  return buildRequirement({
    department: "国際総合学類",
    major,
    enrollYear,
    compulsory: ["卒業論文", "国際学I", "国際学II", "国際学III", "国際学IV", ...socialCommon],
    compulsorySumUnit: 26,
    selectMinimumUnit: 100,
    minimums: [38, 14, 1, 6],
    maximums: [83, 46, 15, 35],
    specializedCodes: ["BC11", "BC12", "BC13", "BC15", "BC16", "BE22"],
    specializedRules: [
      [
        ["BC11", "BC12", "BC16", "BE22"],
        32,
        70,
        false,
        "国際専門科目（BC11・BC12・BC16・BE22）",
        0,
        {
          minimumIncludedUnits: [
            {
              codes: isRelations ? ["BC11", "BC16"] : ["BC12"],
              minimum: 14,
              label: isRelations
                ? "国際関係学の指定専門科目（内数）"
                : "国際開発学の指定専門科目（内数）",
            },
          ],
        },
      ],
      [["BC13"], 6, 9, false, "国際専門科目（BC13）", 0],
      [["BC15"], 0, 4, false, "国際専門科目（BC15）", 0],
    ],
    foundationCodes: ["BC51", "BE21", "EDS", "ED", "BB050", "FH611", "FG10641", "GA12", "BA92"],
    foundationRules: [
      [["BC51", "BE21"], 10, 28, false, "国際専門基礎科目（BC51・BE21）", 1],
      [["EDS", "ED"], 4, 4, false, "英語による討論科目", 1],
      [["BB050", "FH611", "FG10641", "GA12", "BA92"], 0, 14, false, "その他の指定専門基礎科目", 1],
    ],
    relatedRules: internationalRelatedRules,
  });
};

/** 根拠: 筑波大学「学群等履修細則」別表第1（2022〜2026年度）。 */
export const humanitiesSocialRequirements = {
  ...humanitiesRequirements,
  "comparative-culture-23": comparativeCultureRequirement("2023~2025", false),
  "comparative-culture-26": comparativeCultureRequirement(2026, true),
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
    relatedRules: [
      [
        ["A", "B", "C", "W", "Y"],
        4,
        32,
        false,
        "A・B・C・W・Yで始まる関連科目",
        3,
      ],
      [
        ["E", "F", "G", "H"],
        2,
        30,
        false,
        "E・F・G・Hで始まる関連科目",
        3,
      ],
      [
        [
          "*自由科目特設",
          "*教職に関する科目",
          "*博物館に関する科目",
        ],
        0,
        14,
        false,
        "8・9で始まる関連科目",
        3,
      ],
    ],
  }),
  "japanese-culture-23": japaneseCultureRequirement("2023~2025", 35, 4),
  "japanese-culture-26": japaneseCultureRequirement(2026, 30, 2),
  "social-sociology-22": socialRequirement(2022, "社会学主専攻"),
  "social-sociology-23": socialRequirement("2023~2026", "社会学主専攻"),
  "social-law-22": socialRequirement(2022, "法学主専攻"),
  "social-law-23": socialRequirement("2023~2026", "法学主専攻"),
  "social-politics-22": socialRequirement(2022, "政治学主専攻"),
  "social-politics-23": socialRequirement("2023~2026", "政治学主専攻"),
  "social-economics-22": socialRequirement(2022, "経済学主専攻"),
  "social-economics-23": socialRequirement("2023~2026", "経済学主専攻"),
  "international-relations-22": internationalRequirement(2022, "国際関係学主専攻"),
  "international-relations-23": internationalRequirement("2023~2026", "国際関係学主専攻"),
  "international-development-22": internationalRequirement(2022, "国際開発学主専攻"),
  "international-development-23": internationalRequirement("2023~2026", "国際開発学主専攻"),
} satisfies Pick<GradRequirementTable, HumanitiesSocialRequirementId>;
