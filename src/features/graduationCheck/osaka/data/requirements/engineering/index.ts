/**
 * 工学部 5学科 — 専門必修
 *
 * 根拠: 令和8年度工学部履修案内
 * https://www.eng.osaka-u.ac.jp/wp-content/uploads/pdf/student/ug_curriculum/2026_1_bc_curriculum.pdf
 */

import type { GradRequirementTable } from "../../../../core/types";
import { buildOsakaRequirement, ENROLL_YEARS } from "../buildRequirement";

const engineeringCommonCompulsory = ["卒業研究"];

export const engineeringRequirements: GradRequirementTable = {
  "osaka-engineering-applied-22": buildOsakaRequirement({
    department: "工学部",
    major: "応用自然科学科",
    enrollYear: ENROLL_YEARS,
    specKey: "engineering-applied",
    extraCompulsory: engineeringCommonCompulsory,
    compulsorySumUnit: 12,
  }),
  "osaka-engineering-einfo-22": buildOsakaRequirement({
    department: "工学部",
    major: "電子情報工学科",
    enrollYear: ENROLL_YEARS,
    specKey: "engineering-einfo",
    extraCompulsory: engineeringCommonCompulsory,
    compulsorySumUnit: 12,
  }),
  "osaka-engineering-applied-tech-22": buildOsakaRequirement({
    department: "工学部",
    major: "応用理工学科",
    enrollYear: ENROLL_YEARS,
    specKey: "engineering-applied-tech",
    extraCompulsory: engineeringCommonCompulsory,
    compulsorySumUnit: 12,
  }),
  "osaka-engineering-env-22": buildOsakaRequirement({
    department: "工学部",
    major: "環境・エネルギー工学科",
    enrollYear: ENROLL_YEARS,
    specKey: "engineering-env",
    extraCompulsory: engineeringCommonCompulsory,
    compulsorySumUnit: 12,
  }),
  "osaka-engineering-earth-22": buildOsakaRequirement({
    department: "工学部",
    major: "地球総合工学科",
    enrollYear: ENROLL_YEARS,
    specKey: "engineering-earth",
    extraCompulsory: engineeringCommonCompulsory,
    compulsorySumUnit: 12,
  }),
};
