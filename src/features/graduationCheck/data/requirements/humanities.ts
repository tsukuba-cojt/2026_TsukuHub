import type { GradRequirement, GradRequirementTable } from "../../types";

// 根拠: audits/humanities.md。番号帯は指定候補であり、学類長の指定一覧は未確認。
const majorSpecs = {
  philosophy: { label: "哲学", primary: ["AB61", "AB62", "AB63", "AC54", "AC55"],
    foundation: ["AB5", "AB60", "AC50"], oldMaximum: 15,
    fields: ["哲学・倫理学", "宗教学"] },
  history: { label: "史学", primary: ["AB71", "AB72", "AB73", "AB74", "AB75", "AB61", "AB91", "AC60", "AC61", "AC62", "EE21"],
    foundation: ["AB5", "AB70"], oldMaximum: 17,
    fields: ["日本史", "ユーラシア史", "歴史地理学"] },
  archaeology: { label: "考古学・民俗学", primary: ["AB81", "AB82", "AB83", "AB84", "AB85", "AB86", "AC60", "AC62"],
    foundation: ["AB5", "AB80", "AC50"], oldMaximum: 13,
    fields: ["先史学・考古学", "民俗学・文化人類学"] },
  linguistics: { label: "言語学", primary: ["AB72", "AB91", "AB92", "AB93", "AB94", "AB95", "AB96", "AB97", "AB98", "AB99"],
    foundation: ["AB5", "AB90"], oldMaximum: 18,
    fields: ["一般言語学", "応用言語学", "日本語学", "英語学"] },
};

const build = (key: keyof typeof majorSpecs, version: 2022 | 2023 | 2024 | 2025): GradRequirement => {
  const spec = majorSpecs[key];
  const modern = version >= 2025;
  const foundationMaximum = spec.oldMaximum + (modern ? 3 : 0);
  const primaryMinimum = key === "linguistics" ? 18 : 20;
  const primary = key === "philosophy" && version === 2022 ? ["AB61", "AB62", "AB63"] : spec.primary;
  const secondary = version >= 2024 ? ["AB6", "AB7", "AB8", "AB9", "AC5", "AC6", "EE21"]
    : ["AB6", "AB7", "AB8", "AB9", ...(key === "philosophy"
      ? [...(version === 2023 ? ["AC54", "AC55"] : []), "AC60", "AC62", "AC64", "AC65"]
      : ["AC60", "AC61", "AC62"]), "EE21"];
  const thesisFields = spec.fields.map((field) => field === "日本史" ? "日本史学" : field === "ユーラシア史" ? "ユーラシア史学" : field);
  const names = (label: string, minimum: number, alternatives: string[]) =>
    `${label}::${minimum}//${JSON.stringify(alternatives)}`;
  const foundationCodes = [...spec.foundation, ...(modern ? ["AC56", "AE56"] : [])];
  // 考古学・民俗学の追加枠はAB5のみ。他の専門基礎候補は合計11単位枠内。
  const limitedFoundation = [...(key === "archaeology" ? ["AB80", "AC50"] : []), ...(modern ? ["AC56", "AE56"] : [])];
  const unrestrictedFoundation = spec.foundation.filter((code) => !limitedFoundation.includes(code));
  const enrollYear = modern ? "2025~2026" : version === 2024 ? 2024
    : key === "philosophy" ? version : "2022~2023";
  return {
    header: { department: "人文学類", major: `${spec.label}主専攻`, enrollYear },
    courses: {
      compulsory: [
        names("卒業論文（指定候補）", 6, thesisFields.flatMap((field) => [`卒業論文(${field})`, `卒業論文（${field}）`])),
        names("研究-a（指定候補）", 2, spec.fields.map((field) => `${field}研究-a`)),
        names("研究-b（指定候補）", 2, spec.fields.map((field) => `${field}研究-b`)),
        "ファーストイヤーセミナー//['フレッシュマンセミナー']", "学問への誘い",
        "体育::2", "外国語::8", "情報::4", "国語::2",
      ],
      compulsorySumUnit: 28, selectMinimumUnit: 96, enforceSelectMinimums: true,
      select: [
        // 基礎の指定候補を先に割り当て、AC5等の広い専門候補との二重計上を防ぐ。
        ...(limitedFoundation.length ? [[limitedFoundation, 0, 11, false, "11単位枠内の専門基礎指定候補", 1] as GradRequirement["courses"]["select"][number]] : []),
        [unrestrictedFoundation, 0, foundationMaximum, false, "主専攻の専門基礎指定候補", 1],
        [[...new Set([...secondary, ...primary])], 44,
          78, false, "人文学の専門指定候補", 0, { excludeCodes: foundationCodes,
            minimumIncludedUnits: [{ codes: primary, minimum: primaryMinimum,
              label: "主専攻の専門指定候補（内数）" }] }],
        [["*学士基盤科目"], 1, 3, false, "学士基盤科目", 2],
        [["*体育", "*外国語", "*芸術"], 0, 14, false, "その他の共通科目", 2],
        [["AA2", "AC", "AE", "B", "Y"], 4, 32, false, "人文・文化学群等の指定関連科目", 3],
        [["C", "E", "F", "G", "H", "W"], 2, 30, false, "他学群の指定関連科目", 3],
        [["8"], 0, 10, false, "特設自由科目", 3],
        [["*教職に関する科目"], 0, 10, false, "教職科目", 3],
        [["*博物館に関する科目"], 0, 10, false, "博物館科目", 3],
      ],
      groups: [[0, 44, 78, "専門科目選択"], [1, 11, foundationMaximum, "専門基礎科目選択"],
        [2, 1, 17, "共通科目選択"], [3, 6, 34, "関連科目選択"]],
    },
  };
};

export const humanitiesRequirements = {
  "humanities-philosophy-22": build("philosophy", 2022),
  "humanities-philosophy-23": build("philosophy", 2023),
  "humanities-philosophy-24": build("philosophy", 2024),
  "humanities-philosophy-25": build("philosophy", 2025),
  "humanities-history-22": build("history", 2022),
  "humanities-history-24": build("history", 2024),
  "humanities-history-25": build("history", 2025),
  "humanities-archaeology-22": build("archaeology", 2022),
  "humanities-archaeology-24": build("archaeology", 2024),
  "humanities-archaeology-25": build("archaeology", 2025),
  "humanities-linguistics-22": build("linguistics", 2022),
  "humanities-linguistics-24": build("linguistics", 2024),
  "humanities-linguistics-25": build("linguistics", 2025),
} satisfies Partial<GradRequirementTable>;
