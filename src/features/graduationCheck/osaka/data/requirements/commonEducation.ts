/**
 * 全学共通教育・国際性涵養の小区分要件
 *
 * 根拠: CELAS prerequisite HTML + 履修の手引2026 付録1
 * https://www.celas.osaka-u.ac.jp/education/prerequisite/
 */

import type {
  GradRequirement,
  SelectRequirementTuple,
} from "../../../core/types";
import { GENRE, SUB } from "../subGenreMaster";

export type CommonEducationSpec = {
  humanities: number;
  social: number;
  natural: number;
  comprehensive: number;
  info: number;
  foundation: number;
  specialized: number;
  firstForeign: number;
  secondForeign: number;
  electiveForeign: number;
  globalUnderstanding: number;
  excludeNaturalSciences?: boolean;
  dentistryHumanitiesSocial?: boolean;
  enforceSelectMinimums?: boolean;
};

/** 付録1 + CELAS prerequisite（2022〜2026入学者） */
export const commonEducationSpecs: Record<string, CommonEducationSpec> = {
  letters: {
    humanities: 12,
    social: 6,
    natural: 2,
    comprehensive: 0,
    info: 2,
    foundation: 6,
    specialized: 96,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 4,
    globalUnderstanding: 4,
  },
  "human-sciences": {
    humanities: 6,
    social: 6,
    natural: 2,
    comprehensive: 6,
    info: 2,
    foundation: 6,
    specialized: 96,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 3,
    globalUnderstanding: 4,
  },
  "foreign-lang": {
    humanities: 6,
    social: 6,
    natural: 2,
    comprehensive: 0,
    info: 2,
    foundation: 6,
    specialized: 102,
    firstForeign: 4,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 0,
  },
  law: {
    humanities: 10,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 0,
    specialized: 94,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
  },
  economics: {
    humanities: 10,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 10,
    specialized: 90,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
  },
  "science-math": {
    humanities: 6,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 37,
    specialized: 77,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 2,
    excludeNaturalSciences: true,
    enforceSelectMinimums: true,
  },
  "science-physics": {
    humanities: 6,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 37,
    specialized: 77,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 2,
    excludeNaturalSciences: true,
    enforceSelectMinimums: true,
  },
  "science-chemistry": {
    humanities: 6,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 37,
    specialized: 77,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 2,
    excludeNaturalSciences: true,
    enforceSelectMinimums: true,
  },
  "science-biology": {
    humanities: 6,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 36,
    specialized: 78,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 2,
    excludeNaturalSciences: true,
    enforceSelectMinimums: true,
  },
  medicine: {
    humanities: 0,
    social: 0,
    natural: 4,
    comprehensive: 0,
    info: 2,
    foundation: 14,
    specialized: 140,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 6,
  },
  "medicine-nursing": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 13,
    specialized: 144,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
  },
  "medicine-radiology": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 16,
    specialized: 138,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
  },
  "medicine-lab": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 18,
    specialized: 134,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
  },
  dentistry: {
    humanities: 2,
    social: 2,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 20,
    specialized: 126,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 6,
    dentistryHumanitiesSocial: true,
  },
  pharmacy: {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 18,
    specialized: 134,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 6,
  },
  "engineering-applied": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 34,
    specialized: 80,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
    enforceSelectMinimums: true,
  },
  "engineering-einfo": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 30,
    specialized: 84,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
    enforceSelectMinimums: true,
  },
  "engineering-applied-tech": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 36,
    specialized: 78,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
    enforceSelectMinimums: true,
  },
  "engineering-env": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 36,
    specialized: 78,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
    enforceSelectMinimums: true,
  },
  "engineering-earth": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 36,
    specialized: 78,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 4,
    enforceSelectMinimums: true,
  },
  "feng-electron": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 35,
    specialized: 79,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 2,
    enforceSelectMinimums: true,
  },
  "feng-chemistry": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 32,
    specialized: 82,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 2,
    enforceSelectMinimums: true,
  },
  "feng-systems": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 32,
    specialized: 82,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 2,
    enforceSelectMinimums: true,
  },
  "feng-info": {
    humanities: 0,
    social: 0,
    natural: 0,
    comprehensive: 0,
    info: 2,
    foundation: 30,
    specialized: 84,
    firstForeign: 6,
    secondForeign: 2,
    electiveForeign: 0,
    globalUnderstanding: 2,
    enforceSelectMinimums: true,
  },
};

const commonGroupMin = (spec: CommonEducationSpec) =>
  spec.humanities +
  spec.social +
  spec.natural +
  spec.comprehensive +
  spec.info;

const relatedGroupMin = (spec: CommonEducationSpec) =>
  spec.firstForeign +
  spec.secondForeign +
  spec.electiveForeign +
  spec.globalUnderstanding;

const addSubGenreRule = (
  rules: SelectRequirementTuple[],
  prefix: string,
  min: number,
  label: string,
  group: number,
  maxBuffer = 20
) => {
  if (min <= 0) return;
  rules.push([[prefix], min, min + maxBuffer, false, label, group]);
};

export const buildCommonEducationRules = (
  spec: CommonEducationSpec
): Pick<
  GradRequirement["courses"],
  "select" | "groups" | "selectMinimumUnit" | "enforceSelectMinimums"
> => {
  const select: SelectRequirementTuple[] = [];

  if (spec.dentistryHumanitiesSocial) {
    addSubGenreRule(select, SUB.humanities, 2, "人文科学系科目（歯学部）", 1, 10);
    addSubGenreRule(select, SUB.social, 2, "社会科学系科目（歯学部）", 1, 10);
  } else {
    addSubGenreRule(select, SUB.humanities, spec.humanities, "人文科学系科目", 1);
    addSubGenreRule(select, SUB.social, spec.social, "社会科学系科目", 1);
    if (!spec.excludeNaturalSciences) {
      addSubGenreRule(select, SUB.natural, spec.natural, "自然科学系科目", 1);
    }
    addSubGenreRule(select, SUB.comprehensive, spec.comprehensive, "総合型科目", 1);
  }

  addSubGenreRule(select, SUB.info, spec.info, "情報教育科目", 1, 4);
  addSubGenreRule(select, GENRE.foundation, spec.foundation, "専門基礎教育科目", 2, 30);
  addSubGenreRule(select, GENRE.specialized, spec.specialized, "専門教育科目", 3, 60);
  addSubGenreRule(select, SUB.firstForeign, spec.firstForeign, "第１外国語", 4);
  addSubGenreRule(select, SUB.secondForeign, spec.secondForeign, "第２外国語", 4);
  if (spec.electiveForeign > 0) {
    addSubGenreRule(select, SUB.electiveForeign, spec.electiveForeign, "選択外国語", 4);
  }
  addSubGenreRule(select, SUB.globalUnderstanding, spec.globalUnderstanding, "グローバル理解", 4);

  const commonMin = commonGroupMin(spec);
  const relatedMin = relatedGroupMin(spec);

  return {
    select,
    groups: [
      [1, commonMin, commonMin + 30, "全学共通教育科目"],
      [2, spec.foundation, spec.foundation + 30, "専門基礎教育科目"],
      [3, spec.specialized, spec.specialized + 60, "専門教育科目"],
      [4, relatedMin, relatedMin + 20, "国際性涵養教育系科目"],
    ],
    selectMinimumUnit: commonMin + spec.foundation + spec.specialized + relatedMin,
    enforceSelectMinimums: spec.enforceSelectMinimums ?? false,
  };
};

export const getCommonEducationSpec = (specKey: string): CommonEducationSpec => {
  const spec = commonEducationSpecs[specKey];
  if (!spec) throw new Error(`Unknown common education spec: ${specKey}`);
  return spec;
};
