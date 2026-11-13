import type { GradRequirement, GradRequirementTable } from "../../types";
import { esysArchitectCourseCodes } from "../esysArchitectCourses";

type EsysRequirementId = "esys-ies-22" | "esys-eme-22" | "esys-ies-23" | "esys-eme-23" | "esys-ies-24" | "esys-eme-24";
type LegacyEsysId = "esys-ies-22" | "esys-eme-22";

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

const majors: Record<LegacyEsysId, EsysMajor> = {
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
 * 旧22版の比較履歴。現行の全行・注記監査と指定条件の残件は curriculum/audits/esys.md。
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

/** 2023と2024以降の専門英語B・演習の番号指定を区別する。 */
const buildAuditedEsys = (legacyId: LegacyEsysId, revised: boolean): GradRequirement => {
  const requirement = buildEsysRequirement(majors[legacyId]);
  const energy = legacyId === "esys-eme-22";
  requirement.header.enrollYear = revised ? "2024~2026" : 2023;
  const units: Record<string, number> = {
    線形代数総論B: 2, 常微分方程式: 2, 複素解析: 2, プログラミング序論A: 2, プログラミング序論C: 2,
    工学システム基礎実験A: 2, 工学システム基礎実験B: 2, "知的・機能工学システム実験": 6,
    "エネルギー・メカニクス専門実験": 3, "エネルギー・メカニクス応用実験": 3, 数値計算法: 3,
  };
  requirement.courses.compulsory = requirement.courses.compulsory.map((entry) => {
    if (entry.startsWith("卒業研究A")) return "工学システム卒業研究A::4";
    if (entry.startsWith("卒業研究B")) return "工学システム卒業研究B::4";
    if (entry === "専門英語A") return "工学専門英語A::1";
    if (entry === "専門英語B") return `${revised ? energy ? "エネメカ専門英語B" : "知的専門英語B" : "工学専門英語B"}::1`;
    if (entry === "専門英語演習") return `${revised ? energy ? "エネメカ専門英語演習" : "知的専門英語演習" : "工学専門英語演習"}::1`;
    if (entry.includes("::")) return entry;
    // 同名の並行クラスを複数取得しても公式表の1行の単位を超えて加算しない。
    return `${entry}::${units[entry] ?? 1}//['${entry}']`;
  });
  const pending = ["FJ", ...(energy ? ["FH", "YA", "YB"] : [])];
  requirement.courses.select = requirement.courses.select.map((rule) => {
    const copy = [...rule] as typeof rule;
    copy[0] = rule[0].filter((prefix) => !pending.includes(prefix));
    if (energy && rule[4] === "その他の専門科目") copy[0].push(...esysArchitectCourseCodes);
    if (rule[4] === "資格・特設自由科目") copy[0] = ["*博物館に関する科目", "*教職に関する科目", "8"];
    if (rule[4] === "他学群又は他学類の授業科目") {
      // 指定一覧が欠ける候補は、専門から関連へ推測振替しない。学校確認後又は手動5分類で処理する。
      copy[0] = [...copy[0].filter((prefix) => prefix !== "*自由科目特設"), "8", ...pending];
    }
    return copy;
  });
  return requirement;
};

export const esysRequirements = {
  "esys-ies-22": buildEsysRequirement(majors["esys-ies-22"]),
  "esys-eme-22": buildEsysRequirement(majors["esys-eme-22"]),
  "esys-ies-23": buildAuditedEsys("esys-ies-22", false),
  "esys-eme-23": buildAuditedEsys("esys-eme-22", false),
  "esys-ies-24": buildAuditedEsys("esys-ies-22", true),
  "esys-eme-24": buildAuditedEsys("esys-eme-22", true),
} satisfies Pick<GradRequirementTable, EsysRequirementId>;
