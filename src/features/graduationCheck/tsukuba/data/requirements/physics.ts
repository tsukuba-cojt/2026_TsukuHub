import type { GradRequirement, GradRequirementTable } from "../../../core/types";

type PhysicsRequirementId = "physics-22" | "physics-25";

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

const buildPhysicsRequirement = (
  enrollYear: "2022~2024" | "2025~2026",
  specializedRanges: {
    quantum: [number, number];
    fcc: [number, number];
  }
): GradRequirement => ({
  header: {
    department: "物理学類",
    major: "物理学",
    enrollYear,
  },
  courses: {
    compulsory: [
      "物理学実験I",
      "物理学実験II",
      "卒業研究",
      "物理学入門",
      "ファーストイヤーセミナー//['フレッシュマンセミナー']",
      "学問への誘い",
      "体育::2",
      "必修英語::4",
      "情報::4",
    ],
    compulsorySumUnit: 33,
    select: [
      namedRule(
        ["量子力学序論", "量子力学I", "量子力学II", "量子力学III"],
        specializedRanges.quantum[0],
        specializedRanges.quantum[1],
        "量子力学",
        0
      ),
      namedRule(
        ["熱物理学", "統計力学I", "統計力学II"],
        5,
        8,
        "熱・統計力学",
        0
      ),
      namedRule(
        ["専門電磁気学I", "専門電磁気学II", "専門電磁気学III"],
        2,
        6,
        "専門電磁気学",
        0
      ),
      [
        ["FCC2", "FCC3", "FCC4"],
        specializedRanges.fcc[0],
        specializedRanges.fcc[1],
        false,
        "FCC2〜FCC4",
        0,
      ],
      namedRule(
        ["力学1", "力学2", "力学3", "電磁気学1", "電磁気学2", "電磁気学3", "物理学概論"],
        5,
        7,
        "物理基礎",
        1
      ),
      namedRule(
        [
          "微積分1",
          "微積分2",
          "微分積分A",
          "微積分3",
          "線形代数1",
          "線形代数2",
          "線形代数A",
          "線形代数3",
          "数学リテラシー1",
          "数学リテラシー2",
        ],
        4,
        8,
        "数学基礎",
        1
      ),
      [["FA", "FB", "FC", "FE", "EE"], 16, 34, false, "理工系基礎", 1],
      [["*学士基盤科目"], 1, 6, false, "学士基盤科目", 2],
      [
        ["*総合科目", "*体育", "*外国語", "*情報", "*国語", "*芸術"],
        0,
        18,
        false,
        "その他の共通科目",
        2,
      ],
      [["A", "B", "C"], 6, 8, false, "A・B・Cで始まる科目", 3],
      [
        [
          "A",
          "B",
          "C",
          "FA",
          "FB",
          "FC",
          "FE",
          "EE",
          "*総合科目",
          "*教職に関する科目",
        ],
        0,
        18,
        true,
        "その他の関連科目",
        3,
      ],
    ],
    selectMinimumUnit: 91,
    enforceSelectMinimums: true,
    groups: [
      [0, 35, 59, "専門科目選択"],
      [1, 25, 49, "専門基礎科目選択"],
      [2, 1, 24, "共通科目選択"],
      [3, 6, 24, "関連科目選択"],
    ],
  },
});

/**
 * 根拠: 筑波大学「学群等履修細則」理工学群別表第1（2022〜2026年度）。
 * 2025年度から量子力学群とFCC2〜FCC4群の単位範囲が変更されている。
 * https://www.tsukuba.ac.jp/education/ug-courses-directory/
 */
export const physicsRequirements = {
  "physics-22": buildPhysicsRequirement("2022~2024", {
    quantum: [5, 11],
    fcc: [23, 47],
  }),
  "physics-25": buildPhysicsRequirement("2025~2026", {
    quantum: [6, 10],
    fcc: [22, 48],
  }),
} satisfies Pick<GradRequirementTable, PhysicsRequirementId>;
