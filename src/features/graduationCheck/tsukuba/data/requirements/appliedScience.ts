import type { GradRequirement, GradRequirementTable } from "../../../core/types";

type AppliedScienceRequirementId =
  | "applied-physics-22"
  | "applied-physics-24"
  | "applied-electron-22"
  | "applied-electron-24"
  | "applied-materials-22"
  | "applied-materials-24"
  | "applied-molecule-22"
  | "applied-molecule-24";

type AppliedScienceMajor = {
  label: string;
  experiment: string;
  primaryPrefix: string;
  secondaryPrefix: string;
  seminar: string;
};

const foundationCompulsory = [
  "応用理工学概論",
  "熱力学",
  "解析学A",
  "解析学B",
  "解析学C",
  "線形代数A",
  "線形代数B",
  "力学A",
  "電磁気学A",
  "電磁気学B",
  "電磁気学C",
  "化学A",
  "化学B",
  "応用理工物理学実験",
  "応用理工化学実験",
  "専門英語1",
  "専門英語2",
  "専門英語3",
];

const foundationBasics = [
  "数学リテラシー1",
  "数学リテラシー2",
  "微積分1",
  "微積分2",
  "微積分3",
  "線形代数1",
  "線形代数2",
  "線形代数3",
  "力学1",
  "力学2",
  "力学3",
  "電磁気学1",
  "電磁気学2",
  "電磁気学3",
  "化学1",
  "化学2",
  "化学3",
];

const commonCompulsory = [
  "ファーストイヤーセミナー//['フレッシュマンセミナー']",
  "学問への誘い",
  "体育::3",
  "必修英語::4",
  "情報::4",
];

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

const buildAppliedScienceRequirement = (
  major: AppliedScienceMajor,
  variant: "2022~2023" | "2024~2026"
): GradRequirement => {
  const modern = variant === "2024~2026";

  return {
    header: {
      department: "応用理工学類",
      major: major.label,
      enrollYear: variant,
    },
    courses: {
      compulsory: [
        "基礎実験学",
        `${major.experiment}A`,
        `${major.experiment}B`,
        "卒業研究A",
        "卒業研究B",
        ...foundationCompulsory,
        ...(!modern ? foundationBasics : []),
        ...commonCompulsory,
      ],
      compulsorySumUnit: modern ? 49 : 66,
      select: [
        [[major.primaryPrefix], 12, 16, false, `${major.label}の専門科目`, 0],
        [
          ["FF16", major.secondaryPrefix],
          23,
          27,
          false,
          "理工学群共通・主専攻関連科目",
          0,
        ],
        [
          ["FF", "FA00"],
          0,
          4,
          false,
          "実習・輪講・他主専攻科目",
          0,
          {
            includeCourseNames: [
              "インターンシップI",
              "インターンシップII",
              "応用理工学特別実習I",
              "応用理工学特別実習II",
              major.seminar,
            ],
            excludeCodes: ["FF15"],
          },
        ],
        [["FF15"], 6, 9, false, "FF15で始まる専門基礎科目", 1],
        ...(modern
          ? [namedRule(foundationBasics, 15, 17, "数学・物理・化学の基礎科目", 1)]
          : []),
        [["*学士基盤科目"], 1, 1, false, "学士基盤科目", 2],
        [
          ["*外国語", "*国語", "*芸術"],
          0,
          4,
          false,
          "外国語・国語・芸術",
          2,
        ],
        [["*体育"], 0, 1, false, "体育", 2],
        [
          [
            "FF",
            "FA00",
            "*総合科目",
            "*体育",
            "*外国語",
            "*情報",
            "*国語",
            "*芸術",
            "*教職に関する科目",
            "*博物館に関する科目",
            "*自由科目特設",
          ],
          12,
          16,
          true,
          "他学群・他学類の科目",
          3,
        ],
        [
          ["*教職に関する科目", "*博物館に関する科目", "*自由科目特設"],
          0,
          4,
          false,
          "教職・博物館・特設自由科目",
          3,
        ],
      ],
      selectMinimumUnit: modern ? 75 : 58,
      enforceSelectMinimums: true,
      groups: [
        [0, 35, 39, "専門科目選択"],
        [1, modern ? 21 : 6, modern ? 26 : 9, "専門基礎科目選択"],
        [2, 1, 5, "共通科目選択"],
        [3, 12, 16, "関連科目選択"],
      ],
    },
  };
};

const majors = {
  physics: {
    label: "応用物理",
    experiment: "応用物理専攻実験",
    primaryPrefix: "FF25",
    secondaryPrefix: "FF26",
    seminar: "応用物理学輪講",
  },
  electron: {
    label: "電子・量子工学",
    experiment: "電子・量子工学専攻実験",
    primaryPrefix: "FF35",
    secondaryPrefix: "FF36",
    seminar: "電子・量子工学輪講",
  },
  materials: {
    label: "物性工学",
    experiment: "物性工学専攻実験",
    primaryPrefix: "FF45",
    secondaryPrefix: "FF46",
    seminar: "物性工学輪講",
  },
  molecule: {
    label: "物質・分子工学",
    experiment: "物質・分子工学専攻実験",
    primaryPrefix: "FF55",
    secondaryPrefix: "FF56",
    seminar: "物質・分子工学輪講",
  },
} satisfies Record<string, AppliedScienceMajor>;

/**
 * 根拠: 筑波大学「学群等履修細則」理工学群別表第1（2022〜2026年度）。
 * 2024年度から17単位分が専門基礎の必修から選択へ移っている。
 * https://www.tsukuba.ac.jp/education/ug-courses-directory/
 */
export const appliedScienceRequirements = {
  "applied-physics-22": buildAppliedScienceRequirement(
    majors.physics,
    "2022~2023"
  ),
  "applied-physics-24": buildAppliedScienceRequirement(
    majors.physics,
    "2024~2026"
  ),
  "applied-electron-22": buildAppliedScienceRequirement(
    majors.electron,
    "2022~2023"
  ),
  "applied-electron-24": buildAppliedScienceRequirement(
    majors.electron,
    "2024~2026"
  ),
  "applied-materials-22": buildAppliedScienceRequirement(
    majors.materials,
    "2022~2023"
  ),
  "applied-materials-24": buildAppliedScienceRequirement(
    majors.materials,
    "2024~2026"
  ),
  "applied-molecule-22": buildAppliedScienceRequirement(
    majors.molecule,
    "2022~2023"
  ),
  "applied-molecule-24": buildAppliedScienceRequirement(
    majors.molecule,
    "2024~2026"
  ),
} satisfies Pick<GradRequirementTable, AppliedScienceRequirementId>;
