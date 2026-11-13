import type { GradRequirement, SelectRequirementTuple } from "../../types";

// 根拠と未表現条件: curriculum/audits/earth.md。2022版はlifeEnvironmental.tsに履歴として保持。
const intro = ["ファーストイヤーセミナー//['フレッシュマンセミナー']", "学問への誘い"];
const commonTags = ["*総合科目", "*体育", "*外国語", "*情報", "*国語", "*芸術"];
const credentials = ["*教職に関する科目", "*博物館に関する科目"];
const namedSpecialized = ["地球基礎数学・物理学", "地球基礎化学", "地球統計学", "地球情報学", "地球学野外調査法"];
const foundationCodes = ["FB", "FC", "FE", "EB", "EC", "EE1", "EG0", "EG1", "EG2", "EG3", "EG4", "EG5", "EG6", "EG70"];
const namedFoundation = [
  "数学概論", "数学リテラシー1", "数学リテラシー2",
  "微積分演習S", "微積分演習F", "線形代数演習S", "線形代数演習F",
  "微積分1", "微積分2", "微積分3", "線形代数1", "線形代数2", "線形代数3",
  "微分積分A", "線形代数A", "物理学概論", "力学1", "力学2", "力学3",
  "電磁気学1", "電磁気学2", "電磁気学3", "化学概論", "化学1", "化学2", "化学3",
  "生物学序説", "遺伝学概論", "分子細胞生物学概論", "系統分類・進化学概論",
  "動物生理学概論", "植物生理学概論", "生態学概論", "生物資源の開発・生産と持続利用",
  "生物資源としての遺伝子とゲノム", "生物資源と環境", "生物資源学にみる食品科学・技術の最前線",
  "フィールド文化領域比較文化研究", "文化人類学概論", "歴史地理学概説-a", "歴史地理学概説-b",
  "文化地理学概論", "応用理工学概論", "工学システム概論", "物理学序説", "化学序説",
];

const regular = (year: 2023 | 2024 | 2025 | 2026, evolution = false): GradRequirement => {
  const old = year <= 2024;
  const specialized = year === 2026 && !evolution ? 41 : 40;
  const foundation = old ? 18 : 16;
  const related = old ? 4 : 6;
  const maximum = specialized === 41 ? 69 : 68;
  const required = specialized === 41 ? 32 : 33;
  const foundationNames = [...namedFoundation,
    ...(year === 2023 ? ["微積分I", "微積分II", "微積分III", "線形代数I", "線形代数II", "線形代数III"] : []),
    ...(old ? [] : ["地域地理学I", "地域地理学II"])];
  const specializedRules: SelectRequirementTuple[] = evolution ? [
    [["EE3"], 18, year === 2023 ? 59 : 44.5, false, "地球進化学分野", 0],
    [["EE2", ...(year === 2023 ? ["EE4"] : ["EG9"])], 9, 50, false, "地球環境学分野等", 0,
      { includeCourseNames: namedSpecialized }],
  ] : [
    [["EE2"], 10, year === 2023 ? 68 : 64, false, "地球環境学分野", 0],
    ...(year === 2026 ? [[["EG9"], 1, 25, false, "生物圏環境学分野", 0] as SelectRequirementTuple] : []),
    [["EE3", ...(year === 2023 ? ["EE4", "EG8", "EG9"] : year === 2026 ? [] : ["EG9"])],
      0, year === 2026 ? 40 : 58, false, "地球進化学分野等", 0, { includeCourseNames: namedSpecialized }],
  ];
  const relatedRules: SelectRequirementTuple[] = old ? [
    [["AB", "AC", "FF", "FG", "FH", ...credentials], 4, 32, false, "指定関連科目", 3,
      { excludeCourseNames: foundationNames }],
    [["AB", "AC", "EB", "EC", "EE", "EG", "FB", "FC", "FE", "FF", "FG", "FH", ...commonTags, ...credentials],
      0, 28, true, "その他の関連科目", 3, { includeCourseNames: foundationNames }],
  ] : [
    [credentials, 0, 34, false, "教職・博物館科目", 3],
    [["E", "FB", "FC", "FE", ...commonTags, ...credentials], 0, 34, true, "関連科目", 3,
      { includeCourseNames: foundationNames }],
  ];
  return {
    header: { department: "地球学類", major: evolution ? "地球進化学" : "地球環境学",
      enrollYear: evolution && year === 2025 ? "2025~2026" : year },
    courses: {
      compulsory: ["地球学卒業研究::12", "地球学専門英語2A",
        ...(specialized === 41 ? [] : ["地球学専門英語2B"]),
        "地球環境学1", "地球環境学2", "地球進化学1", "地球進化学2", "地球学実験",
        "地球学専門英語1A", "地球学専門英語1B", ...intro, "体育::2", "英語::4", "情報::4"],
      compulsorySumUnit: required,
      selectMinimumUnit: 124 - required,
      enforceSelectMinimums: true,
      select: [
        ...specializedRules,
        [[...foundationCodes, ...(year === 2023 ? ["FA", "GA", "EG71"] : [])], foundation, old ? 46 : 44,
          false, "地球学専門基礎科目", 1, { includeCourseNames: foundationNames }],
        [["*学士基盤科目"], 1, 5, false, "学士基盤科目", 2],
        [["*体育", "*外国語", "*国語", "*芸術"], 0, year === 2023 ? 25 : 24, false, "その他の共通科目", 2],
        ...relatedRules,
      ],
      groups: [[0, specialized, maximum, "専門科目選択"], [1, foundation, old ? 46 : 44, "専門基礎科目選択"],
        [2, 1, year === 2023 ? 26 : 29, "共通科目選択"], [3, related, old ? 32 : 34, "関連科目選択"]],
    },
  };
};

const fieldNames = (year: number) => [
  ...["I", "II", "III", "IV", "V", "VI"].map((suffix) => `地球環境学野外実験${suffix}`),
  ...["A", "B", "C", "D", "E", "F", ...(year === 2023 ? ["G"] : [])].map((suffix) => `地球進化学野外実験${suffix}`),
];
const interdisciplinary = (year: 2023 | 2024 | 2026): GradRequirement => {
  const legacy = year === 2023;
  const selectedFoundation = ["EG02", ...(legacy ? ["EG8"] : ["EG5", "EE1", "EB11251"]),
    "EB11151", "EB11351", "EB11651", "EB11751", "EB11851"];
  const freeFoundation = ["EG1", "EG5", "EG8", "EE1", "EB16063", "EB50211", "EB60014", "EB62011", "EB72911", "EB74111", "EB74211", "EB83161"];
  const excludedFoundation = legacy ? [...selectedFoundation, ...freeFoundation] : selectedFoundation;
  const fields = fieldNames(year);
  const specialtyCodes = ["EG6", "EG9", "EB5", "EB6", "EB7", "EB8", "EC2", "EC3", "EC4", "EE2", "EE3", ...(legacy ? ["EE4"] : [])];
  const specializedRules: SelectRequirementTuple[] = legacy ? [
    [specialtyCodes, 42, 63, false, "専門選択17＋専門自由25〜46", 0, {
      includeCourseNames: fields, excludeCodes: excludedFoundation,
      // 野外6もEG9に含まれる。別枠のEG9 11との二重利用を避け、合計17を要求する。
      minimumIncludedUnits: [{ codes: ["EG9"], minimum: 17, label: "野外6＋EG9選択11" },
        { courseNames: fields, minimum: 6, label: "野外実験6" }],
    }],
  ] : [
    [[], year === 2026 ? 3 : 6, 19, false, "地球環境学・地球進化学野外実験", 0, { includeCourseNames: fields }],
    [specialtyCodes, year === 2026 ? 44 : 41, 55, false, "その他専門（EG9内数11）", 0, {
      excludeCodes: excludedFoundation, excludeCourseNames: fields,
      minimumIncludedUnits: [{ codes: ["EG9"], minimum: 11, label: "野外実験を除くEG9" }],
    }],
  ];
  const foundationRules: SelectRequirementTuple[] = legacy ? [
    [[...selectedFoundation, ...freeFoundation], 18, 39, false, "専門基礎選択8＋自由10〜31", 1, {
      minimumIncludedUnits: [{ codes: selectedFoundation, minimum: 8, label: "専門基礎選択8" },
        { codes: [...freeFoundation, ...selectedFoundation], minimum: 10, label: "専門基礎自由10（選択余剰を含む）" }],
    }],
  ] : [[selectedFoundation, 11.5, 25.5, false, "学際専門基礎科目", 1]];
  return {
    header: { department: "地球学類", major: "生命環境学際", enrollYear: year === 2024 ? "2024~2025" : year },
    courses: {
      compulsory: ["地球学際研究演習::3", "地球学演習A", "地球学演習B", "地球学際卒業研究::12", "論文作成",
        "地球と生命の進化", "地球環境学入門", "地球学基礎実験",
        ...(legacy ? ["地球学ファーストイヤーセミナーI//['地球学ファーストイヤーセミナーⅠ']",
          "地球学ファーストイヤーセミナーII//['地球学ファーストイヤーセミナーⅡ']"] : []),
        ...intro, "体育::2", "外国語::4", "情報::4", "芸術::1"],
      compulsorySumUnit: legacy ? 43 : 41.5,
      selectMinimumUnit: legacy ? 81 : 82.5,
      enforceSelectMinimums: true,
      select: [...specializedRules, ...foundationRules,
        [["*総合科目"], 1, 1, false, "必修を除く総合科目", 2],
        [["*体育", "*芸術", "*外国語"], 0, 15, false, "その他の共通科目", 2],
        [["EA", "EB", "EC", "EE", "EG", ...commonTags], legacy ? 6 : 9, legacy ? 14 : 23, true, "関連科目", 3]],
      groups: [[0, legacy ? 42 : 47, legacy ? 63 : 61, "専門科目選択"],
        [1, legacy ? 18 : 11.5, legacy ? 39 : 25.5, "専門基礎科目選択"],
        [2, 1, 15, "共通科目選択"], [3, legacy ? 6 : 9, legacy ? 14 : 23, "関連科目選択"]],
    },
  };
};

export const earthRequirements = {
  "earth-environment-23": regular(2023),
  "earth-environment-24": regular(2024),
  "earth-environment-25": regular(2025),
  "earth-environment-26": regular(2026),
  "earth-evolution-23": regular(2023, true),
  "earth-evolution-24": regular(2024, true),
  // 既存26版を、意味の等しい2025年度にも適用する。
  "earth-evolution-26": regular(2025, true),
  "earth-interdisciplinary-23": interdisciplinary(2023),
  "earth-interdisciplinary-24": interdisciplinary(2024),
  "earth-interdisciplinary-26": interdisciplinary(2026),
};
