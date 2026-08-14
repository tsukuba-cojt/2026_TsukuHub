import type { GradRequirement, GradRequirementTable } from "../../types";

type HumanHealthArtsRequirementId =
  | "education-22"
  | "psychology-22"
  | "disability-22"
  | "medicine-22"
  | "new-medicine-22"
  | "nursing-22"
  | "public-health-nursing-22"
  | "medical-science-22"
  | "international-medical-science-22"
  | "physical-education-22"
  | "art-studies-22"
  | "japanese-art-22";

type RequirementSpec = {
  department: string;
  major: string;
  compulsory: string[];
  compulsorySumUnit: number;
  selectMinimumUnit: number;
  minimums: [number, number, number, number];
  maximums: [number, number, number, number];
  specializedCodes: string[];
  foundationCodes: string[];
};

const commonCodes = ["*学士基盤科目", "*体育", "*外国語", "*情報", "*国語", "*芸術"];

const buildRequirement = (spec: RequirementSpec): GradRequirement => {
  const [specialized, foundation, common, related] = spec.minimums;
  const [specializedMax, foundationMax, commonMax, relatedMax] = spec.maximums;
  const ownCodes = [...spec.specializedCodes, ...spec.foundationCodes];
  return {
    header: { department: spec.department, major: spec.major, enrollYear: "2022~2026" },
    courses: {
      compulsory: spec.compulsory,
      compulsorySumUnit: spec.compulsorySumUnit,
      select: [
        [spec.specializedCodes, specialized, specializedMax, false, `${spec.major}の専門科目`, 0],
        [spec.foundationCodes, foundation, foundationMax, false, `${spec.department}の専門基礎科目`, 1],
        [commonCodes, common, commonMax, false, "共通科目", 2],
        [
          [...ownCodes, "*総合科目", "*体育", "*外国語", "*情報", "*国語", "*芸術", "*教職に関する科目", "*博物館に関する科目"],
          related,
          relatedMax,
          true,
          "他学群・他学類等の関連科目",
          3,
        ],
      ],
      selectMinimumUnit: spec.selectMinimumUnit,
      enforceSelectMinimums: true,
      groups: [
        [0, specialized, specializedMax, "専門科目選択"],
        [1, foundation, foundationMax, "専門基礎科目選択"],
        [2, common, commonMax, "共通科目選択"],
        [3, related, relatedMax, "関連科目選択"],
      ],
    },
  };
};

const humanCommon = ["ファーストイヤーセミナー", "学問への誘い", "体育::2", "外国語::7", "情報::4"];
const medicalCommon = ["ファーストイヤーセミナー", "学問への誘い", "体育::2", "英語::4", "情報::4", "国語::1"];

/** 根拠: 筑波大学「学群等履修細則」別表（2022〜2026年度）。 */
export const humanHealthArtsRequirements = {
  "education-22": buildRequirement({
    department: "教育学類",
    major: "教育学主専攻",
    compulsory: ["卒業研究", "人間学I", "人間学II", "学校の経営・制度・社会", "心理学概論", "障害科学I", "キャリアデザイン入門", "教育学研究法A", "教育学研究法B", "教育インターンシップ基礎論", "教育インターンシップ実践演習", "教育学実践演習", ...humanCommon],
    compulsorySumUnit: 38,
    selectMinimumUnit: 86,
    minimums: [42, 0, 1, 6],
    maximums: [79, 20, 38, 43],
    specializedCodes: ["CB2", "CC", "CE"],
    foundationCodes: ["CB1", "CC", "CE"],
  }),
  "psychology-22": buildRequirement({
    department: "心理学類",
    major: "心理学主専攻",
    compulsory: ["知覚・認知心理学", "学習・言語心理学", "感情・人格心理学", "神経・生理心理学", "社会・集団・家族心理学", "発達心理学", "臨床心理学概論", "卒業研究セミナー", "卒業研究", "人間学I", "心理学概論", "キャリアデザイン入門", "心理学研究法", "心理学統計法I", "心理学統計法II", "心理学統計法実習", "心理学実験セミナー", "心理学実験", "心理学研究実習I", ...humanCommon],
    compulsorySumUnit: 59,
    selectMinimumUnit: 65,
    minimums: [21, 0, 1, 6],
    maximums: [58, 13, 28, 33],
    specializedCodes: ["CC5", "CC6", "CC7", "CC8", "CC9"],
    foundationCodes: ["CC1", "CC2", "CC3", "CC4", "CB1"],
  }),
  "disability-22": buildRequirement({
    department: "障害科学類",
    major: "障害科学主専攻",
    compulsory: ["卒業研究I", "卒業研究II", "人間学I", "障害科学I", "障害科学II", "キャリアデザイン入門", "Current Topics in Disability Sciences", "教育基礎論又は学校の経営・制度・社会", "心理学概論", "障害科学実践入門", "障害者福祉論I", "障害者福祉論II", "障害科学セミナー", "障害者教育基礎理論I", "障害者教育基礎理論II", "心理学統計法I", "障害科学研究法入門", "障害科学研究法実習", ...humanCommon],
    compulsorySumUnit: 46,
    selectMinimumUnit: 78,
    minimums: [32, 0, 1, 6],
    maximums: [71, 10, 40, 45],
    specializedCodes: ["CE", "CC"],
    foundationCodes: ["CB1", "CC1", "CE1"],
  }),
  "medicine-22": buildRequirement({
    department: "医学類",
    major: "医学主専攻",
    compulsory: ["医学統計学", "医療・福祉現場でのふれあい等", "医療概論I", "医療概論I-B", "医学の基礎", "医学の基礎B", "医科分子生物学", "機能・構造と病態I", "医療概論II", "English Medical Terminology I", "機能・構造と病態II", "医療概論III", "English Medical Terminology II", "クリニカル・クラークシップ準備学習", "社会医学実習", "M4クリニカル・クラークシップ（Phase IA）", "医療概論IV", "アドヴァンストコース", "M5クリニカル・クラークシップ（Phase IB、Phase IIA）", "研究室実習", "医療概論V", "医学総括", ...medicalCommon],
    compulsorySumUnit: 186,
    selectMinimumUnit: 13,
    minimums: [0, 5, 1, 7],
    maximums: [0, 5, 1, 7],
    specializedCodes: [],
    foundationCodes: ["FA", "FE", "FF", "FG", "GA", "GB", "GC"],
  }),
  "new-medicine-22": buildRequirement({
    department: "医学類",
    major: "新医学主専攻",
    compulsory: ["医学統計学", "医療・福祉現場でのふれあい等", "医療概論I", "医療概論I-B", "医学の基礎", "医学の基礎B", "医科分子生物学", "機能・構造と病態I", "医療概論II", "English Medical Terminology I", "機能・構造と病態II", "医療概論III", "English Medical Terminology II", "クリニカル・クラークシップ準備学習", "社会医学実習", "M4クリニカル・クラークシップ（Phase IA）", "医療概論IV", "アドヴァンストコース", "M5クリニカル・クラークシップ（Phase IB、Phase IIA）", "研究室実習", "医療概論V", "医学総括", ...medicalCommon],
    compulsorySumUnit: 186,
    selectMinimumUnit: 13,
    minimums: [0, 5, 1, 7],
    maximums: [0, 5, 1, 7],
    specializedCodes: [],
    foundationCodes: ["FA", "FE", "FF", "FG", "GA", "GB", "GC"],
  }),
  "nursing-22": buildRequirement({
    department: "看護学類",
    major: "看護師課程",
    compulsory: ["基礎看護学概論", "基本看護技術", "基本看護技術演習", "フィジカルアセスメント", "看護過程", "看護生命倫理", "臨床看護学概論", "臨床看護方法論", "人間関係論", "心の健康と相談活動", "行動科学", "看護専門英語", "コミュニティ・エンパワメント論", "人体機能学", "人体構造学", "人体の代謝と栄養", "臨床薬理学", "遺伝と健康", "微生物学", "疾病の治療と看護I", "疾病の治療と看護II", "子どもの健康と障害", "老化と健康", "医療生命科学とテクノロジー", ...medicalCommon],
    compulsorySumUnit: 118,
    selectMinimumUnit: 6,
    minimums: [0, 1, 1, 4],
    maximums: [0, 1, 1, 4],
    specializedCodes: [],
    foundationCodes: ["HE", "HB"],
  }),
  "public-health-nursing-22": buildRequirement({
    department: "看護学類",
    major: "保健師課程",
    compulsory: ["基礎看護学概論", "基本看護技術", "基本看護技術演習", "フィジカルアセスメント", "看護過程", "看護生命倫理", "臨床看護学概論", "臨床看護方法論", "公衆衛生看護学概論", "公衆衛生看護活動方法論", "公衆衛生看護学応用論", "公衆衛生看護学実習", "人間関係論", "心の健康と相談活動", "行動科学", "看護専門英語", "コミュニティ・エンパワメント論", "人体機能学", "人体構造学", "人体の代謝と栄養", "臨床薬理学", "遺伝と健康", "微生物学", "疾病の治療と看護I", "疾病の治療と看護II", "子どもの健康と障害", "老化と健康", "医療生命科学とテクノロジー", ...medicalCommon],
    compulsorySumUnit: 131,
    selectMinimumUnit: 6,
    minimums: [0, 1, 1, 4],
    maximums: [0, 1, 1, 4],
    specializedCodes: [],
    foundationCodes: ["HE", "HB"],
  }),
  "medical-science-22": buildRequirement({
    department: "医療科学類",
    major: "医療科学主専攻",
    compulsory: ["臨床病態学", "病態検査学", "臨床薬理学", "臨床病理学実習I", "病理組織学", "病理組織学実習", "免疫検査学", "輸血学", "輸血学実習", "ゲノム医科学", "生理機能検査学", "生理機能検査学実習", "病棟実習", "卒業研究", ...medicalCommon],
    compulsorySumUnit: 109,
    selectMinimumUnit: 18,
    minimums: [6, 5, 1, 6],
    maximums: [55, 27, 1, 6],
    specializedCodes: ["HE", "HC", "HF"],
    foundationCodes: ["FA", "FE", "FF", "FG", "GA", "GB", "GC"],
  }),
  "international-medical-science-22": buildRequirement({
    department: "医療科学類",
    major: "国際医療科学主専攻",
    compulsory: ["健康科学グループワーク", "臨床病理学演習", "医療科学特論I", "医療科学特論II", "医療科学演習I", "研究演習", "卒業研究", "先端医科学英語演習基礎", ...medicalCommon],
    compulsorySumUnit: 35,
    selectMinimumUnit: 89,
    minimums: [55, 27, 1, 6],
    maximums: [55, 27, 1, 6],
    specializedCodes: ["HE", "HC", "HF"],
    foundationCodes: ["FA", "FE", "FF", "FG", "GA", "GB", "GC"],
  }),
  "physical-education-22": buildRequirement({
    department: "体育専門学群",
    major: "体育学主専攻",
    compulsory: ["専門語学B", "卒業研究", "保健体育科（体力づくり運動）指導", "種目別コーチング演習I～II", "スポーツキャリア形成A", "スポーツキャリア形成B", "専門語学A", "専門基礎共通演習", "体育科学シンポジウム", "体育・スポーツ専門英語基礎演習", "実技理論・実習", "テーピング・マッサージ", "ファーストイヤーセミナー", "学問への誘い", "外国語::4", "情報::4", "国語::2"],
    compulsorySumUnit: 33,
    selectMinimumUnit: 91,
    minimums: [28, 31, 1, 12],
    maximums: [43, 39, 10, 25],
    specializedCodes: ["W15", "W16", "W18"],
    foundationCodes: ["W87", "W89", "W90"],
  }),
  "art-studies-22": buildRequirement({
    department: "芸術専門学群",
    major: "芸術学主専攻",
    compulsory: ["卒業研究", "領域研究I", "領域研究II", "領域特別演習I", "領域特別演習II", "領域特別演習III", "芸術キャリア教育", "アート＆デザイン入門", "芸術と文化", "芸術と社会", "芸術基礎演習A", "芸術基礎演習B", "芸術基礎演習C", "ファーストイヤーセミナー", "学問への誘い", "体育::2", "英語::4", "情報::4"],
    compulsorySumUnit: 28,
    selectMinimumUnit: 96,
    minimums: [50, 13, 1, 6],
    maximums: [64, 20, 12, 24],
    specializedCodes: ["YB", "AB90", "AB93", "AC50", "AC60", "FG45901", "FH45051", "FH45061", "FH45071"],
    foundationCodes: ["YAT", "YAC", "YBD"],
  }),
  "japanese-art-22": buildRequirement({
    department: "芸術専門学群",
    major: "日本芸術主専攻",
    compulsory: ["卒業研究", "領域研究I", "領域研究II", "領域特別演習I", "領域特別演習II", "領域特別演習III", "インターンシップ", "芸術キャリア教育", "アート＆デザイン入門", "芸術と文化", "芸術と社会", "Japan-Expert概論", "ファーストイヤーセミナー", "学問への誘い", "体育::2", "外国語::15", "情報::4"],
    compulsorySumUnit: 41,
    selectMinimumUnit: 95,
    minimums: [50, 12, 1, 6],
    maximums: [64, 19, 12, 24],
    specializedCodes: ["YB", "AB90", "AB93", "AC50", "AC60", "FG45901", "FH45051", "FH45061", "FH45071"],
    foundationCodes: ["YAT", "YAC", "YBD"],
  }),
} satisfies Pick<GradRequirementTable, HumanHealthArtsRequirementId>;
