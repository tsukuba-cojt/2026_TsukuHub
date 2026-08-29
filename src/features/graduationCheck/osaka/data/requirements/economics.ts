/**
 * 経済学部
 */
import type { GradRequirementTable } from "../../../core/types";
import { buildOsakaRequirement, ENROLL_YEARS } from "./buildRequirement";

export const economicsRequirements: GradRequirementTable = {
  "osaka-economics-22": buildOsakaRequirement({
    department: "経済学部",
    major: "経済学部",
    enrollYear: ENROLL_YEARS,
    specKey: "economics",
  }),
};
