/**
 * KOAN CSV の科目詳細区分::科目小区分 プレフィックス
 *
 * 根拠: CELAS「履修の手引」2026 付録1/3
 * https://www.celas.osaka-u.ac.jp/wp-content/uploads/registration/2026/rishunotebiki2026saisyusei.pdf
 */

export const GENRE = {
  common: "全学共通教育科目",
  foundation: "専門基礎教育科目",
  specialized: "専門教育科目",
  international: "国際性涵養教育系科目",
  advancedLiberal: "高度教養教育科目",
  teacher: "教職教育科目",
} as const;

/** 小区分プレフィックス（course.id / select codes 用） */
export const subGenre = (genre: string, sub: string) => `${genre}::${sub}`;

export const SUB = {
  humanities: subGenre(GENRE.common, "人文科学系科目"),
  social: subGenre(GENRE.common, "社会科学系科目"),
  natural: subGenre(GENRE.common, "自然科学系科目"),
  comprehensive: subGenre(GENRE.common, "総合型科目"),
  info: subGenre(GENRE.common, "情報教育科目"),
  healthSports: subGenre(GENRE.common, "健康・スポーツ教育科目"),
  advancedSeminar: subGenre(GENRE.common, "アドヴァンスト・セミナー"),
  firstForeign: subGenre(GENRE.international, "第１外国語"),
  secondForeign: subGenre(GENRE.international, "第２外国語"),
  electiveForeign: subGenre(GENRE.international, "選択外国語"),
  globalUnderstanding: subGenre(GENRE.international, "グローバル理解"),
  /** GPA 集計から除外される小区分（KOAN-grade-analyzer 参考） */
  otherDept: "他学科・専攻・教免等科目",
} as const;

export const COMMON_SUB_GENRES = [
  SUB.humanities,
  SUB.social,
  SUB.natural,
  SUB.comprehensive,
  SUB.info,
  SUB.healthSports,
  SUB.advancedSeminar,
] as const;

export const INTERNATIONAL_SUB_GENRES = [
  SUB.firstForeign,
  SUB.secondForeign,
  SUB.electiveForeign,
  SUB.globalUnderstanding,
] as const;
