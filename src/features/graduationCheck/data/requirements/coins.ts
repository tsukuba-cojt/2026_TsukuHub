/**
 * This file was split from the MPL-2.0-derived gradRequirementData.ts.
 * Licensed under the Mozilla Public License, v. 2.0 (MPL-2.0).
 * https://mozilla.org/MPL/2.0/
 */

import type { GradRequirement, GradRequirementTable } from "../../types";

type CoinsMajor = {
  label: string;
  coursePrefix: "GB20" | "GB30" | "GB40";
};

type CoinsRequirementId =
  | "coins-ss-22"
  | "coins-ss-23"
  | "coins-ss-26"
  | "coins-is-22"
  | "coins-is-23"
  | "coins-is-26"
  | "coins-im-22"
  | "coins-im-23"
  | "coins-im-26";

/**
 * 情報科学類の3主専攻は、必修実験と主専攻科目の番号以外は同じ要件。
 * 2022〜2025年度と2026年度では関連科目に数える科目番号の範囲が異なる。
 *
 * 根拠: 筑波大学「学群等履修細則」情報学群別表第1（情報科学類）。
 * https://www.tsukuba.ac.jp/education/ug-courses-directory/
 */
const buildCoinsRequirement = (
  major: CoinsMajor,
  enrollYear: "2022~2025" | 2026,
  relatedRule: "2022~2025" | "2026"
): GradRequirement => {
  const relatedIncludedCodes =
    relatedRule === "2026" ? ["GC", "GE"] : ["E", "F", "GC", "GE", "H"];
  const relatedExcludedCodes =
    relatedRule === "2026"
      ? ["GA", "GB", "GC", "GE", "*総合科目", "*教職に関する科目"]
      : ["E", "F", "G", "H", "*総合科目", "*教職に関する科目"];

  return {
    header: {
      department: "情報科学類",
      major: major.label,
      enrollYear,
    },
    courses: {
      compulsory: [
        `${major.label}実験A`,
        `${major.label}実験B`,
        "卒業研究A",
        "卒業研究B",
        "専門語学A",
        "専門語学B",
        "線形代数A//['線形代数1', '線形代数2']",
        "線形代数B",
        "微分積分A//['微積分1', '微積分2']",
        "微分積分B",
        "情報数学A",
        "専門英語基礎",
        "プログラミング入門A",
        "プログラミング入門B",
        "コンピュータとプログラミング",
        "データ構造とアルゴリズム",
        "データ構造とアルゴリズム実験",
        "論理回路",
        "論理回路演習",
        "ファーストイヤーセミナー",
        "学問への誘い",
        "体育::2",
        "必修英語::4",
        "情報::4",
      ],
      compulsorySumUnit: 54,
      select: [
        [
          [major.coursePrefix],
          16,
          34,
          false,
          `${major.label}主専攻科目`,
          0,
        ],
        [
          ["GB2", "GB3", "GB4", "GA4", "GB133"],
          0,
          18,
          false,
          "情報科学類専門科目・特別演習",
          0,
        ],
        [
          ["GB116", "GB123", "GB126", "GB128"],
          8,
          26,
          false,
          "確率論・統計学・数値計算法・論理系科目",
          1,
        ],
        [
          ["GB136"],
          2,
          26,
          false,
          "Computer Science in English A/B",
          1,
        ],
        [
          ["GB1"],
          4,
          26,
          false,
          "GB1で始まる科目（特別演習を除く）",
          1,
        ],
        [["GA1"], 8, 26, false, "GA1で始まる科目", 1],
        [["*学士基盤科目"], 1, 5, false, "学士基盤科目", 2],
        [["*体育"], 0, 4, false, "体育", 2],
        [["*外国語"], 0, 4, false, "外国語", 2],
        [["*国語"], 0, 4, false, "国語", 2],
        [["*芸術"], 0, 4, false, "芸術", 2],
        [
          relatedIncludedCodes,
          0,
          4,
          false,
          "関連科目（上限4単位）",
          3,
        ],
        [
          relatedExcludedCodes,
          6,
          10,
          true,
          "その他の関連科目",
          3,
        ],
      ],
      selectMinimumUnit: 71,
      enforceSelectMinimums: true,
      groups: [
        [0, 34, 34, "専門科目選択"],
        [1, 26, 26, "専門基礎科目選択"],
        [2, 1, 5, "共通科目選択"],
        [3, 6, 10, "関連科目選択"],
      ],
    },
  };
};

const coinsSoftwareScience: CoinsMajor = {
  label: "ソフトウェアサイエンス",
  coursePrefix: "GB20",
};
const coinsInformationSystems: CoinsMajor = {
  label: "情報システム",
  coursePrefix: "GB30",
};
const coinsIntelligentMedia: CoinsMajor = {
  label: "知能情報メディア",
  coursePrefix: "GB40",
};

/** 2023〜2026の全12表を画像照合。根拠・未表現条件は curriculum/audits/coins.md。 */
const buildAuditedCoinsRequirement = (major: CoinsMajor, revised: boolean): GradRequirement => {
  const requirement = buildCoinsRequirement(major, revised ? 2026 : "2022~2025", revised ? "2026" : "2022~2025");
  requirement.header.enrollYear = revised ? 2026 : "2023~2025";
  const scopedRequired: Record<string, string> = {
    卒業研究A: "情報科学卒業研究A::3",
    卒業研究B: "情報科学卒業研究B::3",
    専門語学A: "情報科学専門語学A::2",
    専門語学B: "情報科学専門語学B::2",
  };
  requirement.courses.compulsory = requirement.courses.compulsory.map((name) => scopedRequired[name] ?? name);
  const seminars = ["GB13312", "GB13322", "GB13332"];
  const designated = ["確率論", "統計学", "数値計算法", "論理と形式化", "論理システム", "論理システム演習"];
  const common = ["*総合科目", "*体育", "*外国語", "*国語", "*芸術", "*情報"];
  requirement.courses.select = [
    // 16は所属主専攻に限定されない。余剰をその他専門へ配分しても同じ単位は二重加算しない。
    [["GB2", "GB3", "GB4", "GA4", ...seminars], 34, 34, false, "情報科学類専門科目・特別演習", 0, {
      minimumIncludedUnits: [{ codes: ["GB20", "GB30", "GB40"], minimum: 16, label: "GB20・GB30・GB40から16単位" }],
    }],
    // 指定8＋英語2＋その他GB1 4。指定・英語の余剰もGB1の4へ使える。
    [["GB1"], 14, 26, false, "GB1専門基礎（指定8・英語2を含む）", 1, {
      excludeCodes: seminars,
      minimumIncludedUnits: [{ courseNames: designated, minimum: 8, label: "指定6科目から8単位" },
        { courseNames: ["Computer Science in English A", "Computer Science in English B"], minimum: 2, label: "Computer Science in English 2単位" }],
    }],
    [["GA1"], 8, 26, false, "GA1で始まる科目", 1],
    [["*学士基盤科目"], 1, 5, false, "学士基盤科目", 2],
    [["*体育"], 0, 4, false, "体育", 2],
    [["*外国語"], 0, 4, false, "外国語", 2],
    [["*国語", "*芸術"], 0, 4, false, "国語・芸術", 2],
    [revised ? ["GC", "GE"] : ["E", "F", "GC", "GE", "H"], 0, 4, false, "関連科目（上限4単位）", 3,
      { excludeEquivalentCodes: ["GB"] }],
    [[...(revised ? ["GA", "GB", "GC", "GE"] : ["E", "F", "G", "H"]), ...common, "*教職に関する科目"],
      6, 10, true, "その他の関連科目", 3],
  ];
  return requirement;
};

export const coinsRequirements = {
  "coins-ss-22": buildCoinsRequirement(
    coinsSoftwareScience,
    "2022~2025",
    "2022~2025"
  ),
  "coins-ss-23": buildAuditedCoinsRequirement(coinsSoftwareScience, false),
  "coins-ss-26": buildAuditedCoinsRequirement(coinsSoftwareScience, true),
  "coins-is-22": buildCoinsRequirement(
    coinsInformationSystems,
    "2022~2025",
    "2022~2025"
  ),
  "coins-is-23": buildAuditedCoinsRequirement(coinsInformationSystems, false),
  "coins-is-26": buildAuditedCoinsRequirement(coinsInformationSystems, true),
  "coins-im-22": buildCoinsRequirement(
    coinsIntelligentMedia,
    "2022~2025",
    "2022~2025"
  ),
  "coins-im-23": buildAuditedCoinsRequirement(coinsIntelligentMedia, false),
  "coins-im-26": buildAuditedCoinsRequirement(coinsIntelligentMedia, true),
} satisfies Pick<GradRequirementTable, CoinsRequirementId>;
