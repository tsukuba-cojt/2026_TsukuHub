/**
 * 法学部
 */
import type { GradRequirementTable } from "../../../core/types";
import { buildOsakaRequirement, ENROLL_YEARS } from "./buildRequirement";

export const lawRequirements: GradRequirementTable = {
  "osaka-law-22": buildOsakaRequirement({
    department: "法学部",
    major: "法学部",
    enrollYear: ENROLL_YEARS,
    specKey: "law",
  }),
};
