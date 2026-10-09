/**
 * 大阪大学 学部別卒業要件データのビルダー
 *
 * 全学共通は commonEducation.ts、学科固有は requirements/*.ts
 */

import type {
  GradRequirement,
  SelectRequirementTuple,
} from "../../../core/types";
import {
  buildCommonEducationRules,
  getCommonEducationSpec,
} from "./commonEducation";

export type RequirementBuildOptions = {
  department: string;
  major: string;
  enrollYear: string;
  specKey: string;
  /** 学科固有の追加必修（全学共通必修に加算） */
  extraCompulsory?: string[];
  /** 学科固有の追加選択ルール（common rules の後に適用） */
  extraSelect?: SelectRequirementTuple[];
  /** 必修合計上限（デフォルト4=学問への扉+体育） */
  compulsorySumUnit?: number;
};

const BASE_COMPULSORY = ["学問への扉", "健康・スポーツ教育科目::2"];

export const ENROLL_YEARS = "2022~2026";

export const buildOsakaRequirement = ({
  department,
  major,
  enrollYear,
  specKey,
  extraCompulsory = [],
  extraSelect = [],
  compulsorySumUnit = 4,
}: RequirementBuildOptions): GradRequirement => {
  const spec = getCommonEducationSpec(specKey);
  const commonRules = buildCommonEducationRules(spec);

  const compulsory = [...BASE_COMPULSORY, ...extraCompulsory];

  return {
    header: { department, major, enrollYear },
    courses: {
      compulsory,
      compulsorySumUnit,
      select: [...commonRules.select, ...extraSelect],
      selectMinimumUnit:
        commonRules.selectMinimumUnit +
        extraSelect.reduce((sum, rule) => sum + rule[1], 0),
      groups: commonRules.groups,
      enforceSelectMinimums: commonRules.enforceSelectMinimums,
    },
  };
};

/** @deprecated 後方互換。新規は buildOsakaRequirement を使用 */
export const buildOsakaRequirementLegacy = buildOsakaRequirement;
