/**
 * 基礎工学部 4学科
 */
import type { GradRequirementTable } from "../../../core/types";
import { buildOsakaRequirement, ENROLL_YEARS } from "./buildRequirement";

export const fengRequirements: GradRequirementTable = {
  "osaka-feng-electron-22": buildOsakaRequirement({
    department: "基礎工学部",
    major: "電子物理科学科",
    enrollYear: ENROLL_YEARS,
    specKey: "feng-electron",
    extraCompulsory: ["卒業研究"],
    compulsorySumUnit: 12,
  }),
  "osaka-feng-chemistry-22": buildOsakaRequirement({
    department: "基礎工学部",
    major: "化学応用科学科",
    enrollYear: ENROLL_YEARS,
    specKey: "feng-chemistry",
    extraCompulsory: ["卒業研究"],
    compulsorySumUnit: 12,
  }),
  "osaka-feng-systems-22": buildOsakaRequirement({
    department: "基礎工学部",
    major: "システム科学科",
    enrollYear: ENROLL_YEARS,
    specKey: "feng-systems",
    extraCompulsory: ["卒業研究"],
    compulsorySumUnit: 12,
  }),
  "osaka-feng-info-22": buildOsakaRequirement({
    department: "基礎工学部",
    major: "情報科学科",
    enrollYear: ENROLL_YEARS,
    specKey: "feng-info",
    extraCompulsory: ["卒業研究"],
    compulsorySumUnit: 12,
  }),
};
