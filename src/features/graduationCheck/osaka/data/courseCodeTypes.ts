/**
 * 大阪大学 KOAN 成績CSVの科目区分タグ
 */

import type { CourseCodeType } from "../../core/courseCodeTypes";
import { GENRE, SUB } from "./subGenreMaster";

const prefixTag = (prefix: string): CourseCodeType => ({
  codes: [prefix],
  except: [],
});

export const courseCodeTypes: Record<string, CourseCodeType> = {
  全学共通教育科目: prefixTag(GENRE.common),
  専門基礎教育科目: prefixTag(GENRE.foundation),
  専門教育科目: prefixTag(GENRE.specialized),
  国際性涵養教育系科目: prefixTag(GENRE.international),
  教職教育科目: prefixTag(GENRE.teacher),
  高度教養教育科目: prefixTag(GENRE.advancedLiberal),
  人文科学系: prefixTag(SUB.humanities),
  社会科学系: prefixTag(SUB.social),
  自然科学系: prefixTag(SUB.natural),
  総合型: prefixTag(SUB.comprehensive),
  情報教育: prefixTag(SUB.info),
  健康・スポーツ教育科目: {
    codes: [
      SUB.healthSports,
      `${GENRE.common}::健康・スポーツ`,
      `${GENRE.common}::健康`,
      `${GENRE.common}::スポーツ`,
    ],
    except: [],
  },
  第１外国語: prefixTag(SUB.firstForeign),
  第２外国語: prefixTag(SUB.secondForeign),
  選択外国語: prefixTag(SUB.electiveForeign),
  グローバル理解: prefixTag(SUB.globalUnderstanding),
};
