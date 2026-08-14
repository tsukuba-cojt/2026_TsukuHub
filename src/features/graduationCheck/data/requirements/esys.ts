import type { GradRequirement, GradRequirementTable } from "../../types";

type EsysRequirementId = "esys-ies-22" | "esys-eme-22";

type EsysMajor = {
  label: string;
  compulsory: string[];
  selectRules: GradRequirement["courses"]["select"];
};

const commonCompulsory = [
  "数学リテラシー1",
  "数学リテラシー2",
  "線形代数1",
  "線形代数2",
  "線形代数3",
  "微積分1",
  "微積分2",
  "微積分3",
  "力学1",
  "力学2",
  "力学3",
  "電磁気学1",
  "電磁気学2",
  "電磁気学3",
  "工学システム原論",
  "線形代数総論A",
  "線形代数総論B",
  "解析学総論",
  "常微分方程式",
  "力学総論",
  "電磁気学総論",
  "材料力学基礎",
  "熱力学基礎",
  "流体力学基礎",
  "複素解析",
  "プログラミング序論A",
  "プログラミング序論B",
  "ファーストイヤーセミナー",
  "学問への誘い",
  "体育::3",
  "必修英語::4",
  "情報::4",
];

const commonSelectRules: GradRequirement["courses"]["select"] = [
  [["*学士基盤科目"], 1, 3, false, "学士基盤科目", 2],
  [["*体育"], 0, 1, false, "体育", 2],
  [["*初修外国語"], 0, 4, false, "第2外国語（初修外国語）", 2],
  [["*芸術"], 0, 1, false, "芸術", 2],
  [["*国語"], 0, 1, false, "国語", 2],
];

const relatedSelectRules: GradRequirement["courses"]["select"] = [
  [
    [],
    0,
    1,
    false,
    "工学システム概論",
    3,
    { includeCourseNames: ["工学システム概論"] },
  ],
  [
    ["*博物館に関する科目", "*教職に関する科目", "*自由科目特設"],
    0,
    15,
    false,
    "資格・特設自由科目",
    3,
  ],
  [
    [
      "FA",
      "FG",
      "FF2",
      "FF3",
      "FF4",
      "FF5",
      "GB2",
      "GB3",
      "GB4",
      "FBA146",
      "FBA147",
      "FBA148",
      "FBA149",
      "FBA15",
      "FBA16",
      "GA15",
      "*総合科目",
      "*教職に関する科目",
      "*博物館に関する科目",
      "*自由科目特設",
    ],
    6,
    15,
    true,
    "他学群又は他学類の授業科目",
    3,
  ],
];

const majors: Record<EsysRequirementId, EsysMajor> = {
  "esys-ies-22": {
    label: "知的・機能工学システム",
    compulsory: [
      "プログラミング序論C",
      "プログラミング序論D",
      "工学システム基礎実験A",
      "工学システム基礎実験B",
      "知的・機能工学システム実験",
      "卒業研究A//['卒業研究a']",
      "卒業研究B//['卒業研究b']",
      "工学者のための倫理",
      "専門英語A",
      "専門英語B",
      "専門英語演習",
    ],
    selectRules: [
      [["FG11", "FG21"], 6, 49, false, "設計・システム系", 0],
      [["FG12", "FG22"], 1, 49, false, "材料・バイオ系", 0],
      [["FG13", "FG23"], 1, 49, false, "実務系", 0],
      [["FG17", "FG24", "FG25"], 16, 49, false, "主専攻科目", 0],
      [
        ["FG", "FF2", "FF3", "FF4", "FF5", "GB2", "GB3", "GB4", "FA00", "FJ"],
        0,
        49,
        false,
        "その他の専門科目",
        0,
        { excludeCourseNames: ["工学システム概論"] },
      ],
    ],
  },
  "esys-eme-22": {
    label: "エネルギー・メカニクス",
    compulsory: [
      "工学システム基礎実験A",
      "工学システム基礎実験B",
      "エネルギー・メカニクス専門実験",
      "エネルギー・メカニクス応用実験",
      "卒業研究A//['卒業研究a']",
      "卒業研究B//['卒業研究b']",
      "工学者のための倫理",
      "専門英語A",
      "専門英語B",
      "専門英語演習",
      "数値計算法",
    ],
    selectRules: [
      [["FG11", "FG41"], 1, 49, false, "設計・システム系", 0],
      [["FG12", "FG42"], 1, 49, false, "材料・バイオ系", 0],
      [["FG13", "FG43"], 1, 49, false, "実務系", 0],
      [["FG17", "FG44", "FG45"], 23, 49, false, "主専攻科目", 0],
      [
        [
          "FG",
          "FF2",
          "FF3",
          "FF4",
          "FF5",
          "GB2",
          "GB3",
          "GB4",
          "FH",
          "YA",
          "YB",
          "FA00",
          "FJ",
        ],
        0,
        49,
        false,
        "その他の専門科目",
        0,
        { excludeCourseNames: ["工学システム概論"] },
      ],
    ],
  },
};

/**
 * 2022〜2026年度の筑波大学「学群等履修細則」理工学群別表第1を照合済み。
 * 各年度とも工学システム学類の2主専攻は同じ卒業要件表を使用している。
 * https://www.tsukuba.ac.jp/education/ug-courses-directory/
 */
const buildEsysRequirement = (major: EsysMajor): GradRequirement => ({
  header: {
    department: "工学システム学類",
    major: major.label,
    enrollYear: "2022~2026",
  },
  courses: {
    compulsory: [...major.compulsory, ...commonCompulsory],
    compulsorySumUnit: 69,
    select: [
      ...major.selectRules,
      ...commonSelectRules,
      ...relatedSelectRules,
    ],
    selectMinimumUnit: 56,
    enforceSelectMinimums: true,
    groups: [
      [0, 40, 49, "専門科目選択"],
      [1, 0, 0, "専門基礎科目選択"],
      [2, 1, 10, "共通科目選択"],
      [3, 6, 15, "関連科目選択"],
    ],
  },
});

export const esysRequirements = {
  "esys-ies-22": buildEsysRequirement(majors["esys-ies-22"]),
  "esys-eme-22": buildEsysRequirement(majors["esys-eme-22"]),
} satisfies Pick<GradRequirementTable, EsysRequirementId>;
