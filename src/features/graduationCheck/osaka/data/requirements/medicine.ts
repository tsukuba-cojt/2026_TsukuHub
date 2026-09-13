/**
 * 医学部
 */
import type { GradRequirementTable } from "../../../core/types";
import { buildOsakaRequirement, ENROLL_YEARS } from "./buildRequirement";

export const medicineRequirements: GradRequirementTable = {
  "osaka-medicine-22": buildOsakaRequirement({
    department: "医学部",
    major: "医学科",
    enrollYear: ENROLL_YEARS,
    specKey: "medicine",
  }),
  "osaka-medicine-nursing-22": buildOsakaRequirement({
    department: "医学部",
    major: "保健学科（看護学専攻）",
    enrollYear: ENROLL_YEARS,
    specKey: "medicine-nursing",
  }),
  "osaka-medicine-radiology-22": buildOsakaRequirement({
    department: "医学部",
    major: "保健学科（放射線技術科学専攻）",
    enrollYear: ENROLL_YEARS,
    specKey: "medicine-radiology",
  }),
  "osaka-medicine-lab-22": buildOsakaRequirement({
    department: "医学部",
    major: "保健学科（検査技術科学専攻）",
    enrollYear: ENROLL_YEARS,
    specKey: "medicine-lab",
  }),
};
