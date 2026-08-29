/**
 * 薬学部
 */
import type { GradRequirementTable } from "../../../core/types";
import { buildOsakaRequirement, ENROLL_YEARS } from "./buildRequirement";

export const pharmacyRequirements: GradRequirementTable = {
  "osaka-pharmacy-22": buildOsakaRequirement({
    department: "薬学部",
    major: "薬学部",
    enrollYear: ENROLL_YEARS,
    specKey: "pharmacy",
  }),
};
