import type { GradRequirement, GradRequirementTable } from "../../types";

type PolicyPlanningRequirementId =
  | "policy-economics-22"
  | "policy-engineering-22"
  | "policy-urban-22";
type AuditedPolicyId = "policy-economics-23" | "policy-engineering-23" | "policy-engineering-26" | "policy-urban-23" | "policy-urban-26";

type PolicyMajor = {
  label: string;
  compulsory: string[];
  compulsorySumUnit: number;
  selectMinimumUnit: number;
  specializedMinimum: number;
  specializedMaximum: number;
  specializedRules: Array<{
    codes: string[];
    minimum: number;
    label: string;
  }>;
};

const economicsCodes = ["FH24", "FH26", "FH27"];
const engineeringCodes = ["FH32", "FH33", "FH34"];
const urbanCodes = ["FH46", "FH47", "FH48"];
const specifiedSpecializedCodes = [
  ...economicsCodes,
  ...engineeringCodes,
  ...urbanCodes,
];

const majors: Record<string, PolicyMajor> = {
  economics: {
    label: "社会経済システム",
    compulsory: ["卒業研究A", "卒業研究B"],
    compulsorySumUnit: 29,
    selectMinimumUnit: 95,
    specializedMinimum: 52,
    specializedMaximum: 77,
    specializedRules: [
      {
        codes: economicsCodes,
        minimum: 16,
        label: "社会経済システム主専攻科目",
      },
      {
        codes: [...engineeringCodes, ...urbanCodes],
        minimum: 8,
        label: "経営工学・都市計画科目",
      },
    ],
  },
  engineering: {
    label: "経営工学",
    compulsory: ["問題発見と解決", "卒業研究A", "卒業研究B"],
    compulsorySumUnit: 31,
    selectMinimumUnit: 93,
    specializedMinimum: 50,
    specializedMaximum: 75,
    specializedRules: [
      {
        codes: engineeringCodes,
        minimum: 16,
        label: "経営工学主専攻科目",
      },
      {
        codes: [...economicsCodes, ...urbanCodes],
        minimum: 8,
        label: "社会経済システム・都市計画科目",
      },
    ],
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
    specializedRules: [
      {
        codes: urbanCodes,
        minimum: 3,
        label: "都市計画主専攻科目",
      },
      {
        codes: [...economicsCodes, ...engineeringCodes],
        minimum: 8,
        label: "社会経済システム・経営工学科目",
      },
    ],
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
      ...major.specializedRules.map(
        ({ codes, minimum, label }): GradRequirement["courses"]["select"][number] => [
          codes,
          minimum,
          major.specializedMaximum,
          false,
          label,
          0,
        ],
      ),
      [
        ["FH2", "FH3", "FH4", "FA00"],
        0,
        major.specializedMaximum,
        false,
        "その他の社会工学類専門科目",
        0,
        { excludeCodes: specifiedSpecializedCodes },
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
        ["A", "B", "C"],
        2,
        20,
        false,
        "A・B・Cで始まる関連科目",
        3,
      ],
      [
        ["E", "F", "G", "H"],
        2,
        20,
        false,
        "E・F・G・Hで始まる関連科目",
        3,
        { excludeCodes: ["FA0", "FA45", "FH"] },
      ],
      [
        [
          "*教職に関する科目",
          "*博物館に関する科目",
          "*自由科目特設",
        ],
        0,
        4,
        false,
        "教職・博物館・特設自由科目",
        3,
      ],
      [
        [
          "A",
          "B",
          "C",
          "E",
          "F",
          "G",
          "H",
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
          "*自由科目特設",
        ],
        0,
        20,
        true,
        "その他の他学群・他学類科目",
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

const exercises = {
  economics: ["FH24012", "FH26012", "FH27012"],
  engineering: ["FH32012", "FH33012", "FH34012"],
  urban: ["FH46002", "FH46012", "FH47012", "FH48002", "FH48012"],
};

/** 全行・年度差と番号対応: curriculum/audits/policy-planning.md。22版は比較履歴。 */
const auditedPolicy = (key: keyof typeof exercises, revised = false): GradRequirement => {
  const major = majors[key];
  const requirement = buildPolicyRequirement(major);
  requirement.header.enrollYear = revised ? 2026 : key === "economics" ? "2023~2026" : "2023~2025";
  const units: Record<string, number> = { 問題発見と解決: 2, 都市計画情報演習: 3, 都市計画演習: 4, 社会工学演習: 3, 社会工学英語: 2, プログラミング入門A: 2, プログラミング入門B: 1 };
  requirement.courses.compulsory = requirement.courses.compulsory.map((entry) => {
    if (entry === "卒業研究A") return "社会工学卒業研究A::4";
    if (entry === "卒業研究B") return "社会工学卒業研究B::4";
    if (entry === "外国語::4") return "英語::4";
    return units[entry] === undefined ? entry : `${entry}::${units[entry]}//['${entry}']`;
  });
  const own = major.specializedRules[0];
  const specialized: GradRequirement["courses"]["select"] = [[own.codes, 16, major.specializedMaximum, false, own.label, 0, {
    minimumIncludedUnits: [{ codes: exercises[key], minimum: key === "urban" && !revised ? 7 : 2, label: "主専攻科目内の演習" }],
  }]];
  if (key === "engineering" && revised) {
    specialized.push([economicsCodes, 1, 3, false, "社会経済システム科目", 0], [urbanCodes, 8, major.specializedMaximum, false, "都市計画科目", 0]);
  } else {
    const peer = major.specializedRules[1];
    specialized.push([peer.codes, 8, major.specializedMaximum, false, peer.label, 0]);
  }
  specialized.push([["FH2", "FH3", "FH4", "FA00"], 0, major.specializedMaximum, false, "その他の社会工学類専門科目", 0, { excludeCodes: specifiedSpecializedCodes }]);
  requirement.courses.select = [...specialized,
    [["FA011", "FA012", "FA013", "FA014", "FA015", "FA016", "FA017", "FA018", "FH608", "FH61111", "FH61121", "FH61131", "FH61141", "FH61151", "FH61161"],
      11, 16, false, "社会工学専門基礎科目", 1, { includeCourseNames: foundationNames }],
    [["*学士基盤科目"], 1, 3, false, "学士基盤科目", 2],
    [["*体育", "*外国語", "*国語", "*芸術"], 0, 4, false, "その他の共通科目", 2],
    [["FA0", "FA45", "FH", "8", "9", "*総合科目"], 6, 20, true, "他学群・他学類科目（資格等を除く）", 3, {
      minimumIncludedUnits: [{ codes: ["A", "B", "C"], minimum: 2, label: "A・B・Cから2単位" },
        { codes: ["E", "F", "G", "H"], minimum: 2, label: "E・F・G・Hから2単位（FA0・FA45・FHを除く）" }],
    }],
    [["8", "9"], 0, 4, false, "教職・博物館・特設自由科目", 3],
  ];
  return requirement;
};

export const policyPlanningRequirements = {
  "policy-economics-22": buildPolicyRequirement(majors.economics),
  "policy-engineering-22": buildPolicyRequirement(majors.engineering),
  "policy-urban-22": buildPolicyRequirement(majors.urban),
  "policy-economics-23": auditedPolicy("economics"),
  "policy-engineering-23": auditedPolicy("engineering"),
  "policy-engineering-26": auditedPolicy("engineering", true),
  "policy-urban-23": auditedPolicy("urban"),
  "policy-urban-26": auditedPolicy("urban", true),
} satisfies Pick<GradRequirementTable, PolicyPlanningRequirementId | AuditedPolicyId>;
