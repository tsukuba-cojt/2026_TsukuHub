import type { GradRequirement, GradRequirementTable } from "../../types";
import { appliedBasicCourses, appliedFoundationCourses } from "../appliedScienceCourses";

type AppliedScienceRequirementId =
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
const historicalAppliedScienceRequirements = {
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
};

const buildAuditedAppliedScience = (key: keyof typeof majors, modern: boolean): GradRequirement => {
  const major = majors[key];
  const digit = major.primaryPrefix[2];
  const requirement = buildAppliedScienceRequirement(major, modern ? "2024~2026" : "2022~2023");
  requirement.header.enrollYear = modern ? "2024~2026" : 2023;
  const basics = appliedBasicCourses.flatMap(({ codes }) => codes);
  requirement.courses.compulsory = ["応用理工・基礎実験学::1", `応用理工${digit}・専攻実験A::2`, `応用理工${digit}・専攻実験B::2`,
    `応用理工${digit}・卒業研究A::4`, `応用理工${digit}・卒業研究B::4`,
    ...appliedFoundationCourses.map(({ name, units }) => `応用理工・${name}::${units}`),
    ...(!modern ? appliedBasicCourses.map(({ name }) => `応用理工・${name === "微積分1" ? "微積分1（2023）" : name}::1`) : []),
    ...commonCompulsory.map((name) => name === "必修英語::4" ? "英語::4" : name)];
  // 主専攻開設範囲を特定できないFF全体は使わず、確認できる他主専攻選択群と明記科目に限定。
  const otherMajors = Object.values(majors).filter((candidate) => candidate !== major).flatMap((candidate) => [candidate.primaryPrefix, candidate.secondaryPrefix]);
  requirement.courses.select[2] = [[...otherMajors, "FA00", "FF13103", "FF13203", "FF14003", "FF14103"], 0, 4, false, "実習・輪講・他主専攻科目", 0, { includeCourseNames: [major.seminar] }];
  if (modern) requirement.courses.select[4] = [basics, 15, 17, false, "数学・物理・化学の基礎科目", 1];
  const relatedIndex = modern ? 8 : 7;
  requirement.courses.select[relatedIndex] = [["FF", "FA00", "FA45", ...basics, "*総合科目", "8", "9"], 12, 16, true, "他学群・他学類の科目", 3];
  requirement.courses.select[relatedIndex + 1] = [["8", "9"], 0, 4, false, "教職・博物館・特設自由科目", 3];
  return requirement;
};

export const appliedScienceRequirements = {
  ...historicalAppliedScienceRequirements,
  "applied-physics-23": buildAuditedAppliedScience("physics", false),
  "applied-physics-24": buildAuditedAppliedScience("physics", true),
  "applied-electron-23": buildAuditedAppliedScience("electron", false),
  "applied-electron-24": buildAuditedAppliedScience("electron", true),
  "applied-materials-23": buildAuditedAppliedScience("materials", false),
  "applied-materials-24": buildAuditedAppliedScience("materials", true),
  "applied-molecule-23": buildAuditedAppliedScience("molecule", false),
  "applied-molecule-24": buildAuditedAppliedScience("molecule", true),
} satisfies Pick<GradRequirementTable, AppliedScienceRequirementId>;
