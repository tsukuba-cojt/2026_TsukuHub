import type { GradRequirement, GradRequirementTable } from "../../types";

type PolicyPlanningRequirementId =
  | "policy-economics-22"
  | "policy-engineering-22"
  | "policy-urban-22";

type PolicyMajor = {
  label: string;
  compulsory: string[];
  compulsorySumUnit: number;
  selectMinimumUnit: number;
  specializedMinimum: number;
  specializedMaximum: number;
};

const majors: Record<string, PolicyMajor> = {
  economics: {
    label: "社会経済システム",
    compulsory: ["卒業研究A", "卒業研究B"],
    compulsorySumUnit: 29,
    selectMinimumUnit: 95,
    specializedMinimum: 52,
    specializedMaximum: 77,
  },
  engineering: {
    label: "経営工学",
    compulsory: ["問題発見と解決", "卒業研究A", "卒業研究B"],
    compulsorySumUnit: 31,
    selectMinimumUnit: 93,
    specializedMinimum: 50,
    specializedMaximum: 75,
  },
  urban: {
    label: "都市計画",
    compulsory: [
      "都市計画情報演習",
      "都市計画演習",
      "卒業研究A",
      "卒業研究B",
    ],
    compulsorySumUnit: 36,
    selectMinimumUnit: 88,
    specializedMinimum: 45,
    specializedMaximum: 70,
  },
};

const foundationNames = [
  "（共）数学リテラシー1",
  "（共）数学リテラシー2",
  "（共）線形代数1",
  "（共）線形代数2",
  "（共）線形代数3",
  "（共）微積分1",
  "（共）微積分2",
  "（共）微積分3",
  "（社工）統計学",
  "経済学の数理",
  "経済学の実証",
  "会計と経営",
  "社会と最適化",
  "都市計画入門",
  "都市数理",
];

const buildPolicyRequirement = (major: PolicyMajor): GradRequirement => ({
  header: {
    department: "社会工学類",
    major: major.label,
    enrollYear: "2022~2026",
  },
  courses: {
    compulsory: [
      ...major.compulsory,
      "社会工学演習",
      "社会工学英語",
      "プログラミング入門A",
      "プログラミング入門B",
      "ファーストイヤーセミナー//['フレッシュマンセミナー']",
      "学問への誘い",
      "外国語::4",
      "情報::4",
      "体育::3",
    ],
    compulsorySumUnit: major.compulsorySumUnit,
    select: [
      [
        ["FH", "FA00"],
        major.specializedMinimum,
        major.specializedMaximum,
        false,
        `${major.label}専門科目`,
        0,
      ],
      [
        [],
        11,
        16,
        false,
        "社会工学専門基礎科目",
        1,
        { includeCourseNames: foundationNames },
      ],
      [["*学士基盤科目"], 1, 3, false, "学士基盤科目", 2],
      [
        ["*体育", "*外国語", "*情報", "*国語", "*芸術"],
        0,
        4,
        false,
        "その他の共通科目",
        2,
      ],
      [
        [
          "FH",
          "FA00",
          "*総合科目",
          "*体育",
          "*外国語",
          "*情報",
          "*国語",
          "*芸術",
          "*教職に関する科目",
          "*博物館に関する科目",
        ],
        6,
        20,
        true,
        "他学群・他学類の関連科目",
        3,
      ],
    ],
    selectMinimumUnit: major.selectMinimumUnit,
    enforceSelectMinimums: true,
    groups: [
      [0, major.specializedMinimum, major.specializedMaximum, "専門科目選択"],
      [1, 11, 16, "専門基礎科目選択"],
      [2, 1, 7, "共通科目選択"],
      [3, 6, 20, "関連科目選択"],
    ],
  },
});

/** 根拠: 筑波大学「学群等履修細則」社会工学類別表（2022〜2026年度）。 */
export const policyPlanningRequirements = {
  "policy-economics-22": buildPolicyRequirement(majors.economics),
  "policy-engineering-22": buildPolicyRequirement(majors.engineering),
  "policy-urban-22": buildPolicyRequirement(majors.urban),
} satisfies Pick<GradRequirementTable, PolicyPlanningRequirementId>;
