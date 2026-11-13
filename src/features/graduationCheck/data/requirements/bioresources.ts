import type { GradRequirement } from "../../types";
import namedCourses from "../bioresourcesFoundationCourses.json";

const practical = ["seminar", "experiment", "practicum"] as const;
const studentCourseOptions = [
  { key: "agrobiology", label: "農林生物学コース", codes: ["EC31"] },
  { key: "biochemistry", label: "応用生命化学コース", codes: ["EC32"] },
  { key: "environmental-engineering", label: "環境工学コース", codes: ["EC33"] },
  { key: "socioeconomics", label: "社会経済学コース", codes: ["EC34"] },
];
const commonIntro = ["ファーストイヤーセミナー//['フレッシュマンセミナー']", "学問への誘い"];
const interdisciplinaryFoundationCodes = (modern: boolean) => [
  "EG02", "EG5", "EG7", "EB11151", "EB11351", "EB11651", "EB11751", "EB11851",
  modern ? "EB09113" : "EB09103", "BE21861",
];

const build = (version: 2022 | 2023 | 2025 | 2026, interdisciplinary: boolean): GradRequirement => {
  const legacy = version === 2022;
  const modernCommon = version >= 2025;
  const foundationNames = namedCourses.foundation.filter((name) => version !== 2026 || !["経済学I", "経済学II"].includes(name));
  const foundationMinimum = interdisciplinary ? legacy ? 14 : 15 : legacy ? 17 : 18;
  const compulsorySumUnit = interdisciplinary ? legacy ? 29 : 28 : legacy ? 30 : 29;
  const specializedMinimum = interdisciplinary ? 45 : 53;
  const commonRules: GradRequirement["courses"]["select"] = interdisciplinary
    ? [
        [["*学士基盤科目"], 1, 3, false, "学士基盤科目", 2],
        ...(modernCommon ? [
          [["*体育", "*外国語", "*芸術"], 0, 6, false, "その他の共通科目", 2,
            { excludeCodes: ["39"] }] as GradRequirement["courses"]["select"][number],
        ] : [
          [["*体育"], 0, 1, false, "選択体育", 2] as GradRequirement["courses"]["select"][number],
          [["*外国語"], 0, 4, false, "選択外国語", 2,
            { excludeCodes: ["39"] }] as GradRequirement["courses"]["select"][number],
          [["*芸術"], 0, 1, false, "選択芸術", 2] as GradRequirement["courses"]["select"][number],
        ]),
      ]
    : [
        [["*学士基盤科目"], 1, 3, false, "学士基盤科目", 2],
        ...(modernCommon ? [
          [["*体育", "*芸術", "*初修外国語"], 0, 6, false, "その他の共通科目", 2] as GradRequirement["courses"]["select"][number],
        ] : [
          [["*体育"], 0, 1, false, "選択体育", 2] as GradRequirement["courses"]["select"][number],
          [["*芸術"], 0, 1, false, "選択芸術", 2] as GradRequirement["courses"]["select"][number],
          [["*初修外国語"], 0, 4, false, "選択初修外国語", 2] as GradRequirement["courses"]["select"][number],
        ]),
      ];
  const foundationRules: GradRequirement["courses"]["select"] = interdisciplinary
    ? [[interdisciplinaryFoundationCodes(modernCommon), foundationMinimum, 28, false, "学際専門基礎科目", 1]]
    : [
        [[], 3, 4, false, "生物資源導入科目", 1, { includeCourseNames: namedCourses.introductions }],
        [[], legacy ? 14 : 15, 21, false, "指定専門基礎科目", 1, {
          includeCourseNames: foundationNames,
          minimumIncludedUnits: [
            { courseNames: foundationNames, instructionMethods: ["lecture"], minimum: 11, label: "専門基礎の講義11単位" },
            { courseNames: foundationNames, instructionMethods: [...practical], minimum: 1, label: "専門基礎の実験・実習・演習1単位" },
          ],
        }],
      ];
  const specializedRules: GradRequirement["courses"]["select"] = interdisciplinary
    ? [
        [["EG6"], 25, 32, false, "EG6専門科目", 0],
        [["EG9", "EC2", "EC3", "EC4", "BB", "EB", "EE", "FF", "FH", "BE22231"], 20, 27, false, "学際のその他専門科目", 0,
          { excludeCodes: interdisciplinaryFoundationCodes(modernCommon), excludeEquivalentCodes: ["EG4", "EG5", "EG6", ...interdisciplinaryFoundationCodes(modernCommon)] }],
      ]
    : [[
        ["EC2", "EC3", "EC4", "BB", "EB", "EE", "EG", "FF", "FH"], 53, 62, false, "生物資源専門科目", 0,
        { minimumIncludedUnits: [
          { codes: ["EC2"], minimum: legacy ? 21 : 19, label: "EC2専門科目" },
          { codes: ["EC2"], bioresourcesCore: true, minimum: legacy ? 10 : 8, label: "EC2基幹科目" },
          { codes: ["EC2"], instructionMethods: [...practical], minimum: 3, label: "EC2の実験・実習・演習3単位" },
          ...(legacy ? [{ codes: ["EC3"], minimum: 16, label: "EC3専門科目" }] : []),
          { codes: ["EC3"], studentCourse: true, minimum: 12, label: "所属コースのEC3専門科目" },
          { codes: ["EC3"], studentCourse: true, instructionMethods: [...practical], minimum: 4, label: "所属コースの実験・実習・演習4単位" },
        ] },
      ]];
  return {
    header: { department: "生物資源学類", major: interdisciplinary ? "生命環境学際" : "生物資源科学",
      enrollYear: version === 2023 ? "2023~2024" : version === 2025 && interdisciplinary ? "2025~2026" : version },
    courses: {
      compulsory: [
        ...(interdisciplinary ? ["研究演習I::2//['研究演習I', '研究演習Ⅰ']", "研究演習II::2//['研究演習II', '研究演習Ⅱ']"] : ["生物資源専門語学I::2", "生物資源専門語学II::2"]),
        "生物資源卒業研究I::5//['卒業研究I', '卒業研究Ⅰ']", "生物資源卒業研究II::5//['卒業研究II', '卒業研究Ⅱ']", "生物資源科学演習",
        ...(legacy ? ["生物資源科学実習"] : []), ...commonIntro,
        interdisciplinary ? "体育::2" : "体育::3", interdisciplinary ? "日本語::4" : "英語::4", "情報::4",
        ...(interdisciplinary ? ["芸術::1"] : ["国語I::1//['国語I', '国語Ⅰ']"]),
      ],
      compulsorySumUnit, selectMinimumUnit: 124 - compulsorySumUnit,
      select: [
        ...foundationRules, ...specializedRules, ...commonRules,
        [["EC", "EB", "EE", "EG", "EZA", "BB", "FF", "FH", "1", "2", "3", "4", "6",
          ...(interdisciplinary ? ["BE21861", "BE22231", "*教職に関する科目", "*博物館に関する科目"] : ["*教職に関する科目", "*博物館に関する科目"])],
          interdisciplinary ? 13 : 10, interdisciplinary ? 21 : 26, true, "関連科目", 3],
      ],
      enforceSelectMinimums: true,
      ...(!interdisciplinary ? { studentCourseOptions } : {}),
      ...(interdisciplinary ? { aggregateRequirements: [{ group: 3, sourceGroups: [2, 3], minimum: 22, label: "学際の共通・関連選択合計22単位" }] } : {}),
      groups: [
        [0, specializedMinimum, interdisciplinary ? 59 : 62, "専門科目選択"],
        [1, foundationMinimum, interdisciplinary ? 28 : 25, "専門基礎科目選択"],
        [2, 1, 9, "共通科目選択"], [3, interdisciplinary ? 13 : 10, interdisciplinary ? 21 : 26, "関連科目選択"],
      ],
    },
  };
};

export const bioresourcesRequirements = {
  "bioresources-22": build(2022, false),
  "bioresources-24": build(2023, false),
  "bioresources-25": build(2025, false),
  "bioresources-26": build(2026, false),
  "bioresources-interdisciplinary-22": build(2022, true),
  "bioresources-interdisciplinary-24": build(2023, true),
  "bioresources-interdisciplinary-25": build(2025, true),
};
