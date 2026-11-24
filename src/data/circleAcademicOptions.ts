import { universityAcademicOptions } from "./universityAcademicOptions";

export type CircleAcademicGroup = { label: string; options: string[] };

// 筑波大学公式一覧を2026-11-20に確認。課程により名称が異なるものは別候補とする。
// https://www.tsukuba.ac.jp/education/organization-ug-list/
// https://www.tsukuba.ac.jp/education/g-list-organization/
export const circleAcademicSources = [
  "https://www.tsukuba.ac.jp/education/organization-ug-list/",
  "https://www.tsukuba.ac.jp/education/g-list-organization/",
] as const;

const programs = (label: string, names: string[]): CircleAcademicGroup => ({
  label,
  options: names.map((name) => `${name}学位プログラム`),
});

const tsukubaGraduate: CircleAcademicGroup[] = [
  programs("人文社会科学研究群", ["人文学", "国際公共政策", "国際日本研究"]),
  programs("ビジネス科学研究群", ["法学", "経営学"]),
  programs("数理物質科学研究群", ["数学", "物理学", "化学", "応用理工学", "国際マテリアルズイノベーション"]),
  { label: "システム情報工学研究群", options: [...programs("", [
    "社会工学", "サービス工学", "リスク・レジリエンス工学", "情報理工",
    "知能機能システム", "構造エネルギー工学",
    "ライフイノベーション（生物情報）",
  ]).options, "エンパワーメント情報学プログラム"] },
  programs("生命地球科学研究群", [
    "生物学", "生物資源科学", "農学", "生命農学", "生命産業科学", "地球科学",
    "環境科学", "環境学", "山岳科学", "ライフイノベーション（食料革新）",
    "ライフイノベーション（環境制御）", "ライフイノベーション（生体分子材料）",
  ]),
  programs("人間総合科学研究群", [
    "教育学", "心理学", "障害科学", "カウンセリング", "カウンセリング科学",
    "リハビリテーション科学", "ニューロサイエンス", "医学", "看護科学",
    "フロンティア医科学", "公衆衛生学", "ヒューマン・ケア科学", "パブリックヘルス",
    "スポーツ医学", "体育学", "スポーツ・オリンピック学", "体育科学", "コーチング学",
    "スポーツウエルネス学", "芸術学", "デザイン学", "世界遺産学", "情報学",
    "ヒューマンバイオロジー", "ライフイノベーション（病態機構）", "ライフイノベーション（創薬開発）",
  ]),
  { label: "専攻", options: [
    "法曹専攻", "国際経営プロフェッショナル専攻", "国際連携持続環境科学専攻",
    "スポーツ国際開発学共同専攻", "大学体育スポーツ高度化共同専攻", "国際連携食料健康科学専攻",
  ] },
  programs("グローバル教育院", ["ヒューマニクス"]),
];

export function getCircleAcademicGroups(
  universitySlug: string,
  program: "undergraduate" | "graduate",
): CircleAcademicGroup[] {
  if (universitySlug === "tsukuba" && program === "graduate") return tsukubaGraduate;
  const level = universityAcademicOptions[universitySlug]?.[program === "graduate" ? "master" : "undergraduate"];
  const groups = (level?.options ?? []).map((group) => ({
    label: group.label,
    options: group.children.length ? group.children.map((child) => child.label) : [group.label],
  }));
  if (universitySlug === "tsukuba") {
    groups.find((group) => group.label === "理工学群")?.options.push("総合理工学位プログラム");
    groups.push(
      { label: "学際サイエンス・デザイン専門学群（マレーシア校）", options: ["学際サイエンス・デザイン専門学群"] },
      { label: "グローバル教育院", options: ["地球規模課題学位プログラム（学士）"] },
    );
  }
  return groups;
}
