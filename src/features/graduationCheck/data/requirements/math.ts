import type { GradRequirement, GradRequirementTable } from "../../types";

/**
 * 旧22版の比較履歴。現行の全行・注記監査と未表現条件は curriculum/audits/math.md。
 */
const legacyMathRequirements = {
  "math-22": {
    header: {
      department: "数学類",
      major: "数学",
      enrollYear: "2022~2026",
    },
    courses: {
      compulsory: [
        "卒業研究",
        "卒業予備研究",
        "数学外書輪講Ⅱ",
        "微積分系::2//['微積分1', '微積分2', '微分積分A']",
        "線形代数系::2//['線形代数1', '線形代数2', '線形代数A']",
        "数学リテラシー1",
        "数学リテラシー2",
        "ファーストイヤーセミナー//['フレッシュマンセミナー']",
        "学問への誘い",
        "体育::2",
        "必修英語::4",
        "情報::4",
      ],
      compulsorySumUnit: 32,
      select: [
        [["FB12", "FB13", "FB14"], 46, 70, false, "数学専門科目", 0],
        [
          ["FBA", "FC", "FE", "EE"],
          15,
          47,
          false,
          "数学専門基礎科目",
          1,
          {
            includeCourseNames: [
              "微積分3",
              "線形代数3",
              "生物学序説",
              "遺伝学概論",
              "分子細胞生物学概論",
              "系統分類・進化学概論",
              "生態学概論",
              "動物生理学概論",
              "植物生理学概論",
            ],
          },
        ],
        [["*学士基盤科目"], 1, 1, false, "学士基盤科目", 2],
        [
          ["*総合科目", "*体育", "*外国語", "*情報", "*国語", "*芸術"],
          0,
          16,
          false,
          "その他の共通科目",
          2,
        ],
        [
          [
            "FB",
            "FC",
            "FE",
            "EE",
            "*総合科目",
            "*教職に関する科目",
          ],
          6,
          16,
          true,
          "専門・専門基礎・共通以外の科目",
          3,
        ],
      ],
      // 区分ごとの最低は合計68単位だが、卒業には選択科目全体で92単位必要。
      selectMinimumUnit: 92,
      enforceSelectMinimums: true,
      groups: [
        [0, 46, 70, "専門科目選択"],
        [1, 15, 47, "専門基礎科目選択"],
        [2, 1, 17, "共通科目選択"],
        [3, 6, 16, "関連科目選択"],
      ],
    },
  },
} satisfies Pick<GradRequirementTable, "math-22">;

const buildAuditedMath = (legacyNames: boolean): GradRequirement => {
  const requirement: GradRequirement = structuredClone(legacyMathRequirements["math-22"]);
  requirement.header.enrollYear = legacyNames ? 2023 : "2024~2026";
  const calculus = ["微積分1", "微積分2", "微分積分A", ...(legacyNames ? ["微積分I", "微積分II", "微積分Ⅰ", "微積分Ⅱ"] : [])];
  const linear = ["線形代数1", "線形代数2", "線形代数A", ...(legacyNames ? ["線形代数I", "線形代数II", "線形代数Ⅰ", "線形代数Ⅱ"] : [])];
  // 移行前の取得・所属属性、2023の各組合せの上限は未接続。単位数だけで詳細承認にしない。
  requirement.courses.compulsory = ["数学卒業研究::9", "数学卒業予備研究::3", "数学外書輪講II::2",
    `微積分系::2//${JSON.stringify(calculus)}`, `線形代数系::2//${JSON.stringify(linear)}`,
    "数学リテラシー1::1//['数学リテラシー1']", "数学リテラシー2::1//['数学リテラシー2']",
    "ファーストイヤーセミナー//['フレッシュマンセミナー']", "学問への誘い", "体育::2", "必修英語::4", "情報::4"];
  const foundation = requirement.courses.select[1];
  requirement.courses.select = [requirement.courses.select[0], foundation,
    // 必須の学士基盤1もその他の学士基盤も同じ親へ配分し、余剰を失わない。
    [["*総合科目"], 1, 17, false, "共通科目（学士基盤1を含む）", 2, {
      minimumIncludedUnits: [{ codes: ["*学士基盤科目"], minimum: 1, label: "学士基盤科目1" }],
    }],
    [["FB12", "FB13", "FB14", "FBA", "FC", "FE", "EE", "*総合科目", "*教職に関する科目"], 6, 16, true,
      "専門・専門基礎・共通以外の科目（数学の教科指導法を含む）", 3, {
        includeCourseNames: foundation[6]?.includeCourseNames,
        // 否定条件のexceptは再包含。固定DBの数学の指導法3科目に限り、9系全体へ広げない。
        excludeCodes: ["9450101", "9450201", "9453001"],
      }],
  ];
  return requirement;
};

export const mathRequirements = {
  ...legacyMathRequirements,
  "math-23": buildAuditedMath(true),
  "math-24": buildAuditedMath(false),
} satisfies Pick<GradRequirementTable, "math-22" | "math-23" | "math-24">;
