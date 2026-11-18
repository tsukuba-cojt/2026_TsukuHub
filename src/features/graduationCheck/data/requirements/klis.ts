import type { GradRequirement } from "../../types";

// 根拠・2026合計の利用者指定補正: curriculum/audits/klis.md。
const namedRequired = (name: string, units: number) => `${name}::${units}//['${name}']`;
const buildKlis = (major: string, index: 1 | 2 | 3, revised = false): GradRequirement => {
  const own = `GE${index + 5}`;
  const other = ["GA4", "GE4", ...["GE6", "GE7", "GE8"].filter((prefix) => prefix !== own)];
  return {
    header: { department: "知識情報・図書館学類", major, enrollYear: revised ? 2026 : "2023~2025" },
    courses: {
      compulsory: ["知識卒業研究A::3", "知識卒業研究B::3",
        // 正式番号未確認の卒業論文は自動で同名他学類科目へ結び付けず、既存5分類で確認・入力する。
        ...(revised ? ["卒業論文（番号確認待ち）::2//[]"] : []),
        namedRequired(`専門英語B-${index}`, 1), namedRequired(`専門英語C-${index}`, 1),
        namedRequired(`${major}実習A`, 1), namedRequired(`${major}実習B`, 1),
        ...["知識情報概論", "アカデミックスキルズ", "プログラミング入門B", "専門英語A1", "専門英語A2"].map((name) => namedRequired(name, 1)),
        ...["プログラミング入門A", "情報数学A", "統計", "哲学"].map((name) => namedRequired(name, 2)),
        "知識情報演習I::2", "知識情報演習II::2", "知識情報演習III::2",
        "ファーストイヤーセミナー", "学問への誘い", "情報::4", "体育::2", "必修英語::4"],
      compulsorySumUnit: revised ? 43 : 41,
      selectMinimumUnit: revised ? 81 : 83,
      enforceSelectMinimums: true,
      select: [
        [[own], 16, 44, false, "自主専攻科目", 0],
        [other, 8, 44, false, "その他指定専門科目", 0, { excludeEquivalentCodes: [own] }],
        [["GA1", "GE2", "GE3"], revised ? 30 : 32, revised ? 50 : 52, false, "GA1, GE2, GE3", 1],
        [["*学士基盤科目"], 1, 21, false, "学士基盤科目", 2],
        [["*体育", "*外国語", "*国語", "*芸術"], 0, 21, false, "その他の共通科目", 2],
        [["GB", "GC"], 0, 26, false, "GB, GC", 3],
        [["GA", "GB", "GC", "GE", "*総合科目", "*体育", "*外国語", "*情報", "*国語", "*芸術", "*教職に関する科目"],
          6, 26, true, "他学群の授業科目", 3],
      ],
      groups: [[0, 24, 44, "専門科目選択"], [1, revised ? 30 : 32, revised ? 50 : 52, "専門基礎科目選択"],
        [2, 1, 21, "共通科目選択"], [3, 6, 26, "関連科目選択"]],
    },
  };
};

export const klisRequirements = {
  "klis-ksc-23": buildKlis("知識科学", 1),
  "klis-kis-23": buildKlis("知識情報システム", 2),
  "klis-irm-23": buildKlis("情報資源経営", 3),
  "klis-ksc-26": buildKlis("知識科学", 1, true),
  "klis-kis-26": buildKlis("知識情報システム", 2, true),
  "klis-irm-26": buildKlis("情報資源経営", 3, true),
};
