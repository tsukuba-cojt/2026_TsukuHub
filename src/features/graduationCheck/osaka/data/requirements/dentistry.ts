/**
 * 歯学部
 */
import type { GradRequirementTable } from "../../../core/types";
import { buildOsakaRequirement, ENROLL_YEARS } from "./buildRequirement";

export const dentistryRequirements: GradRequirementTable = {
  "osaka-dentistry-22": buildOsakaRequirement({
    department: "歯学部",
    major: "歯学部",
    enrollYear: ENROLL_YEARS,
    specKey: "dentistry",
  }),
};
