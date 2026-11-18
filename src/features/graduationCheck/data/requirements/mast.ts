import type { GradRequirement } from "../../types";

/** 根拠: curriculum/audits/mast.md。2023/2024と2025/2026をそれぞれ全行・注記で比較した。 */
const mastRequirement = (revised: boolean): GradRequirement => ({
  header: { department: "情報メディア創成学類", major: "情報メディア創成", enrollYear: revised ? "2025~2026" : "2023~2024" },
  courses: {
    compulsory: [
      "情報メディア卒業研究A::3", "情報メディア卒業研究B::3", "情報メディア実験A", "情報メディア実験B",
      "情報メディア専門英語A::1", "情報メディア専門英語B::1",
      "微分積分A//['微積分1', '微積分2']", "微分積分B", "線形代数A//['線形代数1', '線形代数2']", "線形代数B",
      "情報数学A", "確率と統計", "プログラミング入門A", "プログラミング入門B",
      ...(revised ? ["コンピュータリテラシー"] : []), "プログラミング", "コンピュータシステムとOS",
      "データ構造とアルゴリズム", "データ構造とアルゴリズム実習", "データ工学概論",
      "ファーストイヤーセミナー", "学問への誘い", "情報::4", "体育::2", "必修英語::4",
    ],
    compulsorySumUnit: revised ? 51 : 50,
    selectMinimumUnit: revised ? 73 : 74,
    select: [
      [["GC5", "GA4"], 20, 35, false, "GC5, GA4", 0],
      [["GC2", "GA1"], revised ? 31 : 32, revised ? 46 : 47, false, "GC2, GA1", 1],
      [["*学士基盤科目"], 1, 4, false, "学士基盤科目", 2],
      [["*体育"], 0, 2, false, "体育", 2],
      [["*外国語"], 0, 6, false, "外国語", 2],
      [["*国語"], 0, 2, false, "国語", 2],
      [["*芸術"], 0, 6, false, "芸術", 2],
      [["GB", "GE"], 0, 9, false, "GB, GE", 3],
      // 表は博物館＋自由科目（特設）を同じ0〜9枠とする。8の未記載例外は追加しない。
      [["*博物館に関する科目", "8"], 0, 9, false, "博物館・自由科目（特設）", 3],
      [["GA", "GB", "GC", "GE", "8", "*総合科目", "*体育", "*外国語", "*情報", "*国語", "*芸術",
        "*教職に関する科目", "*博物館に関する科目"], 6, 15, true, "他学群の授業科目", 3],
    ],
    enforceSelectMinimums: true,
    groups: [[0, 20, 35, "専門科目選択"], [1, revised ? 31 : 32, revised ? 46 : 47, "専門基礎科目選択"],
      [2, 1, 10, "共通科目選択"], [3, 6, 15, "関連科目選択"]],
  },
});

export const mastRequirements = {
  "mast-23": mastRequirement(false),
  "mast-25": mastRequirement(true),
};
